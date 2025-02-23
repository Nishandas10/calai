import { auth, firestore } from "./firebase";
import {
  AuthError,
  AuthErrorCodes,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateUserProfile,
  User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export type OnboardingStatus = {
  onboardingCompleted: boolean;
};

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  onboarding: OnboardingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User | null;
  profile: UserProfile | null;
}

export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const user = auth.currentUser;

    if (!user) {
      return { user: null, profile: null };
    }

    // Fetch profile from Firestore
    const profileDoc = await getDoc(doc(firestore, "profiles", user.uid));

    if (!profileDoc.exists()) {
      // Create profile if it doesn't exist
      const newProfile = await createUserProfile(
        user.uid,
        user.email!,
        user.displayName || ""
      );
      return { user, profile: newProfile };
    }

    const profileData = profileDoc.data();
    return {
      user,
      profile: {
        id: profileDoc.id,
        email: profileData.email,
        fullName: profileData.fullName,
        avatarUrl: profileData.avatarUrl,
        onboarding: profileData.onboarding,
        createdAt: profileData.createdAt.toDate(),
        updatedAt: profileData.updatedAt.toDate(),
      },
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, profile: null };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResponse> {
  try {
    // Validate inputs
    if (!email || !password || !fullName) {
      throw new Error("All fields are required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const { user } = userCredential;

    // Update user profile with full name
    await updateUserProfile(user, {
      displayName: fullName,
    });

    // Create profile in Firestore
    const profile = await createUserProfile(user.uid, email, fullName);

    // Send email verification
    await sendEmailVerification(user);

    return { user, profile };
  } catch (error: unknown) {
    console.error("Error in signUpWithEmail:", error);

    // Handle specific Firebase Auth errors
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/email-already-in-use":
          throw new Error("Email already in use");
        case "auth/invalid-email":
          throw new Error("Invalid email address");
        case "auth/weak-password":
          throw new Error("Password is too weak");
        case "auth/operation-not-allowed":
          throw new Error("Email/password accounts are not enabled");
        default:
          throw new Error(error.message || "Failed to create account");
      }
    }

    // Handle other errors
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("An unexpected error occurred");
  }
}

export async function createUserProfile(
  userId: string,
  email: string,
  fullName: string
): Promise<UserProfile> {
  try {
    const now = new Date();
    const profileData = {
      email,
      fullName,
      avatarUrl: null,
      onboarding: {
        onboardingCompleted: false,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Create or update profile in Firestore
    await setDoc(doc(firestore, "profiles", userId), profileData, {
      merge: true,
    });

    return {
      id: userId,
      ...profileData,
    };
  } catch (error) {
    console.error("Profile creation error:", error);
    throw new Error("Failed to create user profile");
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const { user } = userCredential;

    // Check if email is verified
    if (!user.emailVerified) {
      // Optionally resend verification email
      await sendEmailVerification(user);
      throw new Error(
        "Please verify your email address. A new verification email has been sent."
      );
    }

    // Fetch profile from Firestore
    const profileDoc = await getDoc(doc(firestore, "profiles", user.uid));

    if (!profileDoc.exists()) {
      // Create profile if it doesn't exist
      const profile = await createUserProfile(
        user.uid,
        email,
        user.displayName || ""
      );
      return { user, profile };
    }

    const profileData = profileDoc.data();
    return {
      user,
      profile: {
        id: profileDoc.id,
        email: profileData.email,
        fullName: profileData.fullName,
        avatarUrl: profileData.avatarUrl,
        onboarding: profileData.onboarding,
        createdAt: profileData.createdAt.toDate(),
        updatedAt: profileData.updatedAt.toDate(),
      },
    };
  } catch (error: unknown) {
    console.error("Error in signInWithEmail:", error);

    // Handle specific Firebase Auth errors
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/user-not-found":
          throw new Error("Account not found");
        case "auth/invalid-email":
          throw new Error("Invalid email address");
        case "auth/wrong-password":
          throw new Error("Incorrect password");
        case "auth/user-disabled":
          throw new Error("Account has been disabled");
        case "auth/too-many-requests":
          throw new Error("Too many failed attempts. Please try again later");
        default:
          throw new Error(error.message || "Failed to sign in");
      }
    }

    // Handle other errors
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("An unexpected error occurred");
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    // Update profile in Firestore
    await updateDoc(doc(firestore, "profiles", userId), updateData);

    // Fetch updated profile
    const profileDoc = await getDoc(doc(firestore, "profiles", userId));

    const profileData = profileDoc.data()!;
    return {
      id: profileDoc.id,
      email: profileData.email,
      fullName: profileData.fullName,
      avatarUrl: profileData.avatarUrl,
      onboarding: profileData.onboarding,
      createdAt: profileData.createdAt.toDate(),
      updatedAt: profileData.updatedAt.toDate(),
    };
  } catch (error) {
    console.error("Profile update error:", error);
    throw new Error("Failed to update profile");
  }
}
