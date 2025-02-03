-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to create tables
CREATE OR REPLACE FUNCTION create_user_profiles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user_health_metrics_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    weight NUMERIC NOT NULL,
    height NUMERIC NOT NULL,
    bmi NUMERIC NOT NULL,
    bmi_category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user_goals_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    primary_goal TEXT NOT NULL,
    target_weight NUMERIC,
    weekly_pace NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user_dietary_preferences_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_dietary_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    is_dairy_free BOOLEAN DEFAULT FALSE,
    diet_style TEXT DEFAULT 'None',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user_macro_goals_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_macro_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    protein NUMERIC NOT NULL,
    carbs NUMERIC NOT NULL,
    fat NUMERIC NOT NULL,
    use_auto_macros BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create indexes
CREATE OR REPLACE FUNCTION create_index(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql; 