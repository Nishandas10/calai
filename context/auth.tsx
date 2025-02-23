import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { signInWithEmail, signUpWithEmail, signOut, getCurrentUser, createUserProfile, AuthResponse, UserProfile } from '../lib/auth-helpers';
import { router, useSegments, useRootNavigationState } from 'expo-router';
import { Alert } from 'react-native';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This hook will protect the route access based on user authentication
function useProtectedRoute(user: User | null) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    async function checkOnboarding() {
      try {
        if (!user) {
          // If the user is not signed in and the initial segment is not in the auth group
          if (!inAuthGroup) {
            router.replace('/(auth)/sign-in');
          }
          return;
        }

        // If we have a user, check onboarding status
        const userData = await getCurrentUser();
        const onboardingCompleted = userData?.profile?.onboarding?.onboardingCompleted;

        if (user && !onboardingCompleted && !inOnboardingGroup) {
          router.replace('/(onboarding)/name');
        } else if (user && onboardingCompleted && (inAuthGroup || inOnboardingGroup)) {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error in protected route:', error);
      }
    }

    checkOnboarding();
  }, [user, segments, navigationState?.key]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useProtectedRoute(state.user);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const data = await getCurrentUser();
      setState({
        user: data?.user || null,
        profile: data?.profile || null,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking user:', error);
      setState({ user: null, profile: null, loading: false });
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      const { user, profile } = await signUpWithEmail(email, password, fullName);
      
      Alert.alert(
        'Check your email',
        'We have sent you a confirmation email. Please verify your email address to complete the signup process.',
        [
          {
            text: 'OK',
            onPress: () => {
              setState({ user: null, profile: null, loading: false });
              router.replace('/(auth)/sign-in');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error signing up:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred during sign up');
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { user, profile } = await signInWithEmail(email, password);
      setState({ user, profile, loading: false });
      
      if (profile?.onboarding?.onboardingCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/name');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut();
      setState({ user: null, profile: null, loading: false });
      router.replace('/(auth)/sign-in');
    } catch (error: any) {
      console.error('Error signing out:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
      throw error;
    }
  }

  const value = {
    ...state,
    signUp,
    signIn,
    logout,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{!state.loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 