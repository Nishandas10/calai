-- Set permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

-- Grant specific permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_health_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_dietary_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_macro_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_nutrition_targets TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_macro_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_nutrition_targets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable users to manage their own profile"
ON public.user_profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable users to manage their own health metrics"
ON public.user_health_metrics
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable users to manage their own goals"
ON public.user_goals
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable users to manage their own dietary preferences"
ON public.user_dietary_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable users to manage their own macro goals"
ON public.user_macro_goals
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable users to manage their own nutrition targets"
ON public.daily_nutrition_targets
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add service role policies
CREATE POLICY "Enable service role full access on user_profiles"
ON public.user_profiles FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Enable service role full access on health metrics"
ON public.user_health_metrics FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Enable service role full access on goals"
ON public.user_goals FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Enable service role full access on dietary preferences"
ON public.user_dietary_preferences FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Enable service role full access on macro goals"
ON public.user_macro_goals FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Enable service role full access on nutrition targets"
ON public.daily_nutrition_targets FOR ALL TO service_role
USING (true) WITH CHECK (true); 