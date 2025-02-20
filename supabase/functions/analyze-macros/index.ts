// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface UserData {
    activityLevel: number;
    birthday: string;
    gender: string;
    height: number;
    name: string;
    targetWeight: number;
    unit: string;
    useAutoMacros: boolean;
    usersGoal: string;
    weeklyPace: number;
    weight: number;
}

function cleanJsonResponse(response: string): string {
    // Remove markdown code block syntax if present
    response = response.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    // Remove any leading/trailing whitespace
    response = response.trim();
    return response;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("Request received:", req.method);
        const body = await req.json();
        console.log("Request body:", body);

        const { userData } = body as { userData: UserData };
        console.log("Parsed userData:", userData);

        // Initialize OpenAI
        const openAiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openAiKey) {
            console.error("OpenAI API key missing");
            throw new Error("Missing OpenAI API key");
        }

        // Validate required fields
        if (
            !userData.weight || !userData.height || !userData.birthday ||
            !userData.gender || !userData.activityLevel
        ) {
            console.error("Missing required user data fields");
            throw new Error("Missing required user data fields");
        }

        const openai = new OpenAI({ apiKey: openAiKey });

        // Calculate age from birthday
        const birthDate = new Date(userData.birthday);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        // Prepare the prompt for OpenAI
        const prompt =
            `As a nutrition expert, analyze the following user data and provide recommended daily calories and macronutrient ratios:

User Profile:
- Age: ${age} years
- Gender: ${userData.gender}
- Height: ${userData.height} cm
- Current Weight: ${userData.weight} kg
- Target Weight: ${userData.targetWeight} kg
- Activity Level: ${userData.activityLevel} (1=Sedentary, 2=Light, 3=Moderate, 4=Very Active, 5=Super Active)
- Goals: ${userData.usersGoal}
- Weekly Weight Change Pace: ${userData.weeklyPace} kg/week

Provide a JSON object with these exact keys and numeric values only:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}`;

        // Call OpenAI API
        console.log("Calling OpenAI API with prompt:", prompt);
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a certified nutrition expert. Provide evidence-based nutrition recommendations. Respond ONLY with a valid JSON object, no markdown or additional text.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.3,
        });

        console.log("OpenAI API Response:", completion);
        const response = completion.choices[0].message?.content;
        if (!response) {
            throw new Error("No response from OpenAI");
        }

        // Clean and parse the JSON response
        console.log("Raw response:", response);
        const cleanedResponse = cleanJsonResponse(response);
        console.log("Cleaned response:", cleanedResponse);

        try {
            const macros = JSON.parse(cleanedResponse);
            console.log("Final macros:", macros);

            // Validate the response structure
            if (
                !macros.calories || !macros.protein || !macros.carbs ||
                !macros.fat
            ) {
                throw new Error("Invalid response format from OpenAI");
            }

            return new Response(
                JSON.stringify(macros),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            throw new Error("Failed to parse OpenAI response");
        }
    } catch (error: any) {
        console.error("Error in analyze-macros function:", error);
        return new Response(
            JSON.stringify({
                error: error.message,
                details: error.toString(),
                stack: error.stack,
            }),
            {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
                status: 400,
            },
        );
    }
});
