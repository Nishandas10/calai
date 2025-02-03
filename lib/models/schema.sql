-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_health_metrics table
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

-- Create user_goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    primary_goal TEXT NOT NULL, -- e.g., 'weight_loss', 'muscle_gain', 'maintenance'
    target_weight NUMERIC,
    weekly_pace NUMERIC NOT NULL, -- e.g., 0.5 kg/week
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_dietary_preferences table
CREATE TABLE IF NOT EXISTS public.user_dietary_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    is_dairy_free BOOLEAN DEFAULT FALSE,
    diet_style TEXT DEFAULT 'None', -- e.g., 'keto', 'paleo', 'mediterranean'
    excluded_ingredients TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_macro_goals table
CREATE TABLE IF NOT EXISTS public.user_macro_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    protein NUMERIC NOT NULL,
    carbs NUMERIC NOT NULL,
    fat NUMERIC NOT NULL,
    use_auto_macros BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_health_metrics_user_id ON public.user_health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dietary_preferences_user_id ON public.user_dietary_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_macro_goals_user_id ON public.user_macro_goals(user_id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_macro_goals ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for dietary preferences
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_dietary_preferences;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.user_dietary_preferences;
DROP POLICY IF EXISTS "Enable select for own rows" ON public.user_dietary_preferences;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.user_dietary_preferences;
DROP POLICY IF EXISTS "Enable update for own rows" ON public.user_dietary_preferences;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_dietary_preferences;
DROP POLICY IF EXISTS "Enable delete for own rows" ON public.user_dietary_preferences;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.user_dietary_preferences;

-- Drop ALL existing policies for macro goals
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_macro_goals;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_macro_goals;
DROP POLICY IF EXISTS "Enable select for own rows" ON public.user_macro_goals;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.user_macro_goals;
DROP POLICY IF EXISTS "Enable update for own rows" ON public.user_macro_goals;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_macro_goals;
DROP POLICY IF EXISTS "Enable delete for own rows" ON public.user_macro_goals;

-- Create new policies for dietary preferences
CREATE POLICY "Enable insert for authenticated users"
ON public.user_dietary_preferences FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable select for own rows"
ON public.user_dietary_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own rows"
ON public.user_dietary_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own rows"
ON public.user_dietary_preferences FOR DELETE
USING (auth.uid() = user_id);

-- Create new policies for macro goals
CREATE POLICY "Enable insert for authenticated users"
ON public.user_macro_goals FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable select for own rows"
ON public.user_macro_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own rows"
ON public.user_macro_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own rows"
ON public.user_macro_goals FOR DELETE
USING (auth.uid() = user_id); 