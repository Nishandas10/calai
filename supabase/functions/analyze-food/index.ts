// @ts-ignore: Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
// @ts-ignore: Deno imports
import { OpenAI } from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface FoodAnalysis {
  ingredients: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface RequestBody {
  imagePath: string;
  userId?: string;
}

// Declare Deno namespace for TypeScript
declare global {
  namespace Deno {
    interface Env {
      get(key: string): string | undefined;
    }
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    // Check environment variables
    if (!supabaseUrl || !supabaseServiceRoleKey || !openaiApiKey) {
      console.error("Missing environment variables:", {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceRoleKey,
        hasOpenAIKey: !!openaiApiKey,
      });
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
          details: "Missing required environment variables",
        }),
        { headers: corsHeaders, status: 500 },
      );
    }

    // Parse and validate request body
    const { imagePath, userId } = await req.json() as RequestBody;
    if (!imagePath) {
      return new Response(
        JSON.stringify({ error: "Missing required field: imagePath" }),
        { headers: corsHeaders, status: 400 },
      );
    }

    // Initialize clients
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Get signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabaseClient
      .storage
      .from("food-images")
      .createSignedUrl(imagePath, 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", signedUrlError);
      return new Response(
        JSON.stringify({
          error: "Failed to access image",
          details: signedUrlError?.message,
        }),
        { headers: corsHeaders, status: 500 },
      );
    }

    // Call OpenAI Vision API
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",

            content: [
              {
                type: "text",
                text:
                  "Analyze this food image and return a JSON object with the following format: {ingredients: [{name: string, calories: number, protein: number, carbs: number, fat: number}], total: {calories: number, protein: number, carbs: number, fat: number}}. Be precise with the measurements and ensure the totals are accurate sums of the ingredients.",
              },
              {
                type: "image_url",
                image_url: {
                  url: signedUrlData.signedUrl,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      if (!response.choices[0]?.message?.content) {
        throw new Error("No response from OpenAI");
      }

      const analysis: FoodAnalysis = JSON.parse(
        response.choices[0].message.content,
      );

      // Store analysis in food_logs
      const { error: logError } = await supabaseClient
        .from("food_logs")
        .insert({
          image_path: imagePath,
          ai_analysis: analysis,
          user_id: userId,
        });

      if (logError) {
        console.error("Database error:", logError);
        return new Response(
          JSON.stringify({
            error: "Failed to store analysis",
            details: logError.message,
          }),
          { headers: corsHeaders, status: 500 },
        );
      }

      return new Response(
        JSON.stringify(analysis),
        { headers: corsHeaders, status: 200 },
      );
    } catch (openAiError) {
      console.error("OpenAI API error:", openAiError);
      return new Response(
        JSON.stringify({
          error: "Failed to analyze image",
          details: openAiError instanceof Error
            ? openAiError.message
            : "Unknown OpenAI error",
        }),
        { headers: corsHeaders, status: 500 },
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error
          ? error.message
          : "Unknown error occurred",
      }),
      { headers: corsHeaders, status: 500 },
    );
  }
});
