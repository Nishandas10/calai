-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create food_logs table
CREATE TABLE IF NOT EXISTS public.food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    image_path TEXT NOT NULL,
    ai_analysis JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on food_logs
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for food_logs
CREATE POLICY "Users can view and create their own food logs"
ON public.food_logs FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Seed data for testing (optional)
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for food-images bucket
CREATE POLICY "Enable public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'food-images');

CREATE POLICY "Enable authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'food-images');

-- Create RLS policies for tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_macro_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_nutrition_targets ENABLE ROW LEVEL SECURITY;

-- User profiles policy
CREATE POLICY "Users can view and edit their own profiles"
ON public.user_profiles FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Health metrics policy
CREATE POLICY "Users can view and edit their own health metrics"
ON public.user_health_metrics FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Goals policy
CREATE POLICY "Users can view and edit their own goals"
ON public.user_goals FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Dietary preferences policy
CREATE POLICY "Users can view and edit their own dietary preferences"
ON public.user_dietary_preferences FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Macro goals policy
CREATE POLICY "Users can view and edit their own macro goals"
ON public.user_macro_goals FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Daily nutrition targets policy
CREATE POLICY "Users can view and edit their own nutrition targets"
ON public.daily_nutrition_targets FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant access to the service role
GRANT ALL ON public.food_logs TO service_role;

-- Create a policy for service role
CREATE POLICY "Enable service role access to food_logs"
ON public.food_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true); 