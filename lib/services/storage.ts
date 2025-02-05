import { supabase } from "../supabase";
import { decode } from "base64-arraybuffer";

export async function uploadFoodImage(
  uri: string,
  userId: string
): Promise<string> {
  try {
    // Convert image to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Generate unique filename
    const filename = `${Date.now()}.jpg`;
    const filePath = `${userId}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("food-images")
      .upload(filePath, blob);

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("food-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
