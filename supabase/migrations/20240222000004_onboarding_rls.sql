-- Enable Row Level Security
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own onboarding data
CREATE POLICY "Users can view their own onboarding data"
ON public.user_onboarding
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own onboarding data
CREATE POLICY "Users can insert their own onboarding data"
ON public.user_onboarding
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own onboarding data
CREATE POLICY "Users can update their own onboarding data"
ON public.user_onboarding
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own onboarding data
CREATE POLICY "Users can delete their own onboarding data"
ON public.user_onboarding
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_onboarding TO authenticated;

-- Create a secure function to check user permissions
CREATE OR REPLACE FUNCTION check_onboarding_user_permission()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.uid() != NEW.user_id THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce user permissions
CREATE TRIGGER check_onboarding_permission
    BEFORE INSERT OR UPDATE ON public.user_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION check_onboarding_user_permission(); 