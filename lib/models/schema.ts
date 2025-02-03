import { supabase } from "../../scripts/supabase-admin";

export const createTables = async () => {
  try {
    // Create user_profiles table
    const { error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(0);
    if (profileError?.code === "42P01") {
      const { error } = await supabase
        .from("_schema")
        .select("*")
        .eq("name", "user_profiles")
        .maybeSingle()
        .then(async () => {
          return await supabase
            .from("user_profiles")
            .insert({
              id: "temp",
              email: "temp@example.com",
            })
            .select()
            .single();
        });
      if (error) {
        // Table doesn't exist, create it
        const { error: createError } = await supabase
          .from("user_profiles")
          .insert([])
          .select()
          .then(async () => {
            return await supabase.from("user_profiles").upsert({
              id: "temp",
              email: "temp@example.com",
            });
          });
        if (createError) throw createError;
      }
    }

    // Create user_health_metrics table
    const { error: metricsError } = await supabase
      .from("user_health_metrics")
      .select("*")
      .limit(0);
    if (metricsError?.code === "42P01") {
      const { error: createError } = await supabase
        .from("user_health_metrics")
        .insert([])
        .select()
        .then(async () => {
          return await supabase.from("user_health_metrics").upsert({
            id: "temp",
            user_id: "temp",
            weight: 0,
            height: 0,
            bmi: 0,
            bmi_category: "temp",
          });
        });
      if (createError) throw createError;
    }

    // Create user_goals table
    const { error: goalsError } = await supabase
      .from("user_goals")
      .select("*")
      .limit(0);
    if (goalsError?.code === "42P01") {
      const { error: createError } = await supabase
        .from("user_goals")
        .insert([])
        .select()
        .then(async () => {
          return await supabase.from("user_goals").upsert({
            id: "temp",
            user_id: "temp",
            primary_goal: "temp",
            weekly_pace: 0,
          });
        });
      if (createError) throw createError;
    }

    // Create user_dietary_preferences table
    const { error: dietaryError } = await supabase
      .from("user_dietary_preferences")
      .select("*")
      .limit(0);
    if (dietaryError?.code === "42P01") {
      const { error: createError } = await supabase
        .from("user_dietary_preferences")
        .insert([])
        .select()
        .then(async () => {
          return await supabase.from("user_dietary_preferences").upsert({
            id: "temp",
            user_id: "temp",
          });
        });
      if (createError) throw createError;
    }

    // Create user_macro_goals table
    const { error: macroError } = await supabase
      .from("user_macro_goals")
      .select("*")
      .limit(0);
    if (macroError?.code === "42P01") {
      const { error: createError } = await supabase
        .from("user_macro_goals")
        .insert([])
        .select()
        .then(async () => {
          return await supabase.from("user_macro_goals").upsert({
            id: "temp",
            user_id: "temp",
            protein: 0,
            carbs: 0,
            fat: 0,
          });
        });
      if (createError) throw createError;
    }

    console.log("All tables created successfully");
    return true;
  } catch (error) {
    console.error("Error creating tables:", error);
    return false;
  }
};

export const createIndexes = async () => {
  try {
    // For indexes, we'll need to use the SQL editor in Supabase dashboard
    // as the client doesn't support direct index creation
    console.log(
      "Please create indexes manually in Supabase SQL editor using these commands:"
    );
    console.log(`
      CREATE INDEX IF NOT EXISTS idx_user_health_metrics_user_id ON public.user_health_metrics(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_dietary_preferences_user_id ON public.user_dietary_preferences(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_macro_goals_user_id ON public.user_macro_goals(user_id);
    `);
    return true;
  } catch (error) {
    console.error("Error creating indexes:", error);
    return false;
  }
};

export const setupDatabase = async () => {
  try {
    await createTables();
    await createIndexes();
    return true;
  } catch (error) {
    console.error("Error setting up database:", error);
    return false;
  }
};
