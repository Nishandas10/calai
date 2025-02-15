-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Tables
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key after table creation
DO $$ 
BEGIN
    -- Check if the constraint doesn't exist before creating it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_id_fkey'
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD CONSTRAINT user_profiles_id_fkey 
        FOREIGN KEY (id) 
        REFERENCES auth.users(id);
    END IF;
EXCEPTION
    WHEN undefined_table THEN 
        NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    weight NUMERIC NOT NULL,
    height NUMERIC NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    activity_level TEXT NOT NULL,
    bmi NUMERIC GENERATED ALWAYS AS (weight / ((height / 100) * (height / 100))) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    primary_goal TEXT NOT NULL,
    target_weight NUMERIC,
    weekly_pace NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_dietary_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    is_dairy_free BOOLEAN DEFAULT FALSE,
    diet_style TEXT DEFAULT 'None',
    excluded_ingredients TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_macro_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    protein NUMERIC NOT NULL,
    carbs NUMERIC NOT NULL,
    fat NUMERIC NOT NULL,
    fiber NUMERIC NOT NULL,
    use_auto_macros BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.daily_nutrition_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_calories INTEGER NOT NULL,
    target_protein INTEGER NOT NULL,
    target_carbs INTEGER NOT NULL,
    target_fat INTEGER NOT NULL,
    target_fiber INTEGER NOT NULL,
    consumed_calories INTEGER DEFAULT 0,
    consumed_protein INTEGER DEFAULT 0,
    consumed_carbs INTEGER DEFAULT 0,
    consumed_fat INTEGER DEFAULT 0,
    consumed_fiber INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_health_metrics_user_id ON public.user_health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dietary_preferences_user_id ON public.user_dietary_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_macro_goals_user_id ON public.user_macro_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_targets_user_date 
ON public.daily_nutrition_targets(user_id, date);

