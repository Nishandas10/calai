-- Enable RLS on all tables
ALTER TABLE public.scanned_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

-- Policies for scanned_products
CREATE POLICY "Users can view their own scanned products"
    ON public.scanned_products
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scanned products"
    ON public.scanned_products
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scanned products"
    ON public.scanned_products
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for product_nutrition
CREATE POLICY "Users can view their own product nutrition"
    ON public.product_nutrition
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product nutrition"
    ON public.product_nutrition
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product nutrition"
    ON public.product_nutrition
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for meal_logs
CREATE POLICY "Users can view their own meal logs"
    ON public.meal_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal logs"
    ON public.meal_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs"
    ON public.meal_logs
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs"
    ON public.meal_logs
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.scanned_products TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.product_nutrition TO authenticated;
GRANT ALL ON public.meal_logs TO authenticated;
GRANT SELECT ON public.user_nutrition_summary TO authenticated;

-- Update function to check user permissions
CREATE OR REPLACE FUNCTION public.check_user_permission()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.uid() != NEW.user_id THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to enforce user permissions
CREATE TRIGGER check_scanned_products_permission
    BEFORE INSERT OR UPDATE ON public.scanned_products
    FOR EACH ROW
    EXECUTE FUNCTION public.check_user_permission();

CREATE TRIGGER check_product_nutrition_permission
    BEFORE INSERT OR UPDATE ON public.product_nutrition
    FOR EACH ROW
    EXECUTE FUNCTION public.check_user_permission();

CREATE TRIGGER check_meal_logs_permission
    BEFORE INSERT OR UPDATE ON public.meal_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.check_user_permission(); 