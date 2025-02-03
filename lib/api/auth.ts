import { supabase } from "../supabase";
import { UserModel } from "../models/user";

export const signUpUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error("User not found after sign-up");

    // Create user profile in the database
    await UserModel.createProfile({
      id: user.id,
      email: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
  }
};
