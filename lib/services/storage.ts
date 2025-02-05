import { supabase } from "../supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

export async function uploadFoodImage(
  uri: string,
  userId: string
): Promise<string> {
  try {
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${randomString}.jpg`;
    const filePath = `${userId}/${filename}`;

    // Upload to Supabase Storage with retry logic
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase.storage
          .from("food-images")
          .upload(filePath, decode(base64), {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (error) {
          if (attempts === maxAttempts - 1) throw error;
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("food-images").getPublicUrl(filePath);

        return publicUrl;
      } catch (uploadError) {
        if (attempts === maxAttempts - 1) throw uploadError;
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    throw new Error("Failed to upload after multiple attempts");
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
