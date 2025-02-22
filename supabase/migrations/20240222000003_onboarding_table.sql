-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom type for valid goals if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_goal') THEN
        CREATE TYPE users_goal AS ENUM (
            'lose_weight', 'gain_muscle', 'maintain',
            'boost_energy', 'improve_nutrition', 'gain_weight'
        );
    END IF;
END $$;

-- Create onboarding table
CREATE TABLE IF NOT EXISTS public.user_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    -- User Info
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
    birthday DATE NOT NULL,
    activity_level INTEGER CHECK (activity_level BETWEEN 1 AND 5),
    -- Height and Weight (stored in metric)
    height_cm DECIMAL(5,2) NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    
    -- Goals (using text to store formatted goals with scores)
    users_goal TEXT NOT NULL,
    target_weight_kg DECIMAL(5,2),
    weekly_pace DECIMAL(3,1) CHECK (weekly_pace BETWEEN 0.1 AND 1.5),
    
    -- AI Recommended Macros
    ai_calories INTEGER,
    ai_protein INTEGER,
    ai_carbs INTEGER,
    ai_fat INTEGER,

    -- Standard Calculated Macros
    standard_calories INTEGER,
    standard_protein INTEGER,
    standard_carbs INTEGER,
    standard_fat INTEGER,
    
    -- Settings
    use_auto_macros BOOLEAN DEFAULT true,
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_user_onboarding
        UNIQUE(user_id)
);

-- Drop trigger if exists and create it again
DROP TRIGGER IF EXISTS update_user_onboarding_updated_at ON public.user_onboarding;
CREATE TRIGGER update_user_onboarding_updated_at
    BEFORE UPDATE ON public.user_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_onboarding_user_id') THEN
        CREATE INDEX idx_user_onboarding_user_id ON public.user_onboarding(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_onboarding_created_at') THEN
        CREATE INDEX idx_user_onboarding_created_at ON public.user_onboarding(created_at);
    END IF;
END $$;

-- Add table comment
COMMENT ON TABLE public.user_onboarding IS 'Stores user onboarding data including personal info, goals, and macro preferences in both metric and imperial units';
