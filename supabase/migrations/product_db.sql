-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate the enum type with 'unknown' value
DO $$ 
BEGIN
    -- Drop the existing type if it exists (and its dependent objects)
    DROP TYPE IF EXISTS public.nutriscore_grade CASCADE;
    
    -- Create the type with the additional 'unknown' value
    CREATE TYPE public.nutriscore_grade AS ENUM ('a', 'b', 'c', 'd', 'e', 'unknown');
EXCEPTION
    WHEN OTHERS THEN
        -- If we can't drop and recreate, try to add the value
        ALTER TYPE public.nutriscore_grade ADD VALUE IF NOT EXISTS 'unknown';
END
$$;

-- Drop and recreate the tables to ensure clean state
DROP TABLE IF EXISTS public.meal_logs CASCADE;
DROP TABLE IF EXISTS public.product_nutrition CASCADE;
DROP TABLE IF EXISTS public.scanned_products CASCADE;

-- Create table for scanned products
CREATE TABLE public.scanned_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    barcode VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    image_url VARCHAR(512),
    serving_size VARCHAR(100),
    serving_quantity DECIMAL(10,2),
    nutriscore public.nutriscore_grade DEFAULT 'unknown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT scanned_products_user_id_barcode_key UNIQUE(user_id, barcode)
);

-- Create table for product nutrition facts
CREATE TABLE IF NOT EXISTS public.product_nutrition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.scanned_products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    calories_per_100g INTEGER NOT NULL,
    protein_g DECIMAL(10,2) NOT NULL,
    carbohydrates_g DECIMAL(10,2) NOT NULL,
    fat_g DECIMAL(10,2) NOT NULL,
    fiber_g DECIMAL(10,2),
    sugars_g DECIMAL(10,2),
    saturated_fat_g DECIMAL(10,2),
    sodium_mg DECIMAL(10,2),
    calcium_mg DECIMAL(10,2),
    iron_mg DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_nutrition_product_id_user_id_key UNIQUE(product_id, user_id),
    CONSTRAINT fk_product
        FOREIGN KEY(product_id)
        REFERENCES public.scanned_products(id),
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES public.user_profiles(id)
);

-- Create table for meal logs with scanned products
CREATE TABLE IF NOT EXISTS public.meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    product_id UUID REFERENCES public.scanned_products(id),
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_time TIME NOT NULL DEFAULT CURRENT_TIME,
    meal_type VARCHAR(50) NOT NULL, -- 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'
    serving_quantity DECIMAL(10,2) NOT NULL,
    calories INTEGER NOT NULL,
    protein_g DECIMAL(10,2) NOT NULL,
    carbs_g DECIMAL(10,2) NOT NULL,
    fat_g DECIMAL(10,2) NOT NULL,
    fiber_g DECIMAL(10,2),
    notes TEXT,
    image_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES public.user_profiles(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scanned_products_user_barcode ON public.scanned_products(user_id, barcode);
CREATE INDEX IF NOT EXISTS idx_product_nutrition_user_product ON public.product_nutrition(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_meal_logs_product ON public.meal_logs(product_id);

-- Create view for user's nutrition summary
CREATE OR REPLACE VIEW public.user_nutrition_summary AS
SELECT 
    ml.user_id,
    ml.meal_date,
    SUM(ml.calories) as total_calories,
    SUM(ml.protein_g) as total_protein,
    SUM(ml.carbs_g) as total_carbs,
    SUM(ml.fat_g) as total_fat,
    SUM(ml.fiber_g) as total_fiber,
    json_agg(json_build_object(
        'meal_type', ml.meal_type,
        'calories', ml.calories,
        'protein', ml.protein_g,
        'carbs', ml.carbs_g,
        'fat', ml.fat_g,
        'fiber', ml.fiber_g,
        'product_name', sp.product_name,
        'serving_quantity', ml.serving_quantity,
        'serving_size', sp.serving_size
    ) ORDER BY ml.meal_time) as meals
FROM public.meal_logs ml
LEFT JOIN public.scanned_products sp ON ml.product_id = sp.id
GROUP BY ml.user_id, ml.meal_date; 