import { supabase } from "@/lib/supabase";
import axios from "axios";

const OPENFOODFACTS_API = "https://world.openfoodfacts.org/api/v0";

export interface ProductData {
    code: string;
    product: {
        product_name: string;
        brands: string;
        image_url: string;
        serving_size: string;
        serving_quantity: number;
        nutriments: {
            "energy-kcal_100g": number;
            proteins_100g: number;
            carbohydrates_100g: number;
            fat_100g: number;
            fiber_100g: number;
            sugars_100g: number;
            "saturated-fat_100g": number;
            sodium_100g: number;
            calcium_100g: number;
            iron_100g: number;
        };
        nutriscore_grade?: string;
    };
}

export async function getProductByBarcode(
    barcode: string,
): Promise<ProductData> {
    try {
        const response = await axios.get(
            `${OPENFOODFACTS_API}/product/${barcode}.json`,
        );
        return response.data;
    } catch (error) {
        throw new Error("Failed to fetch product data");
    }
}

// Add nutriscore mapping helper
function mapNutriscore(grade: string | null | undefined): string {
    if (!grade) return "unknown";
    const validGrades = ["a", "b", "c", "d", "e"];
    const normalizedGrade = grade.toLowerCase();
    return validGrades.includes(normalizedGrade) ? normalizedGrade : "unknown";
}

type NutrimentKey = keyof ProductData["product"]["nutriments"];

export async function saveProductToDatabase(productData: ProductData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    try {
        // Validate product data
        if (!productData?.product) {
            throw new Error("Invalid product data structure");
        }

        const product = productData.product;

        // Check for required fields
        if (!product.product_name) {
            throw new Error("Missing product name");
        }

        // Safely get nutriment values with fallbacks
        const getNutrimentValue = (nutriment: NutrimentKey): number => {
            const value = product.nutriments?.[nutriment];
            return typeof value === "number" && !isNaN(value) ? value : 0;
        };

        // Create nutrition data in the format expected by FoodAnalysisCard
        const nutritionData = {
            ingredients: [{
                name: product.product_name || "Unknown Product",
                calories: Math.max(
                    0,
                    Math.round(getNutrimentValue("energy-kcal_100g")),
                ),
                protein: Math.max(
                    0,
                    Number(getNutrimentValue("proteins_100g").toFixed(1)),
                ),
                carbs: Math.max(
                    0,
                    Number(getNutrimentValue("carbohydrates_100g").toFixed(1)),
                ),
                fat: Math.max(
                    0,
                    Number(getNutrimentValue("fat_100g").toFixed(1)),
                ),
            }],
            total: {
                calories: Math.max(
                    0,
                    Math.round(getNutrimentValue("energy-kcal_100g")),
                ),
                protein: Math.max(
                    0,
                    Number(getNutrimentValue("proteins_100g").toFixed(1)),
                ),
                carbs: Math.max(
                    0,
                    Number(getNutrimentValue("carbohydrates_100g").toFixed(1)),
                ),
                fat: Math.max(
                    0,
                    Number(getNutrimentValue("fat_100g").toFixed(1)),
                ),
            },
        };

        // Save basic product info with mapped nutriscore
        const { data: savedProduct, error: productError } = await supabase
            .from("scanned_products")
            .upsert(
                {
                    user_id: user.id,
                    barcode: productData.code,
                    product_name: product.product_name,
                    brand_name: product.brands || null,
                    image_url: product.image_url || null,
                    serving_size: product.serving_size || null,
                    serving_quantity:
                        typeof product.serving_quantity === "number"
                            ? product.serving_quantity
                            : null,
                    nutriscore: mapNutriscore(product.nutriscore_grade),
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_id,barcode",
                },
            )
            .select()
            .single();

        if (productError) {
            console.error("Error saving product info:", productError);
            throw productError;
        }

        if (!savedProduct) {
            throw new Error("Failed to save product info");
        }

        // Return data in the format expected by FoodAnalysisCard
        return {
            ...savedProduct,
            analysis: nutritionData,
        };
    } catch (error) {
        console.error("Error in saveProductToDatabase:", error);
        throw error;
    }
}
