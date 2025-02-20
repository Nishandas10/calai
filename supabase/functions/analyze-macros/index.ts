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

Please provide:
1. Daily calorie target
2. Recommended macronutrient distribution in grams:
   - Protein (g)
   - Carbohydrates (g)
   - Fat (g)

Format your response as a JSON object with these exact keys: calories, protein, carbs, fat`;

        // Call OpenAI API
        console.log("Calling OpenAI API with prompt:", prompt);
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a certified nutrition expert. Provide evidence-based nutrition recommendations. Respond only with the requested JSON format.",
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

        // Parse the JSON response
        console.log("Parsing response:", response);
        const macros = JSON.parse(response);
        console.log("Final macros:", macros);

        return new Response(
            JSON.stringify(macros),
            {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            },
        );
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
