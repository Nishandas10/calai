import { Session } from '@supabase/supabase-js';
import { router, useSegments, useRootNavigationState } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This hook will protect the route access based on user authentication
function useProtectedRoute(session: Session | null) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    console.log('Current route:', { segments, inAuthGroup, hasSession: !!session });

    if (!session && !inAuthGroup) {
      console.log('No session, redirecting to sign-in');
      router.replace('/(auth)/sign-in');
    } else if (session && inAuthGroup) {
      console.log('Has session but in auth group, redirecting to bmi-calculator');
      router.replace('/(onboarding)/bmi-calculator');
    }
  }, [session, segments, navigationState?.key]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useProtectedRoute(session);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (mounted) {
          if (initialSession) {
            setSession(initialSession);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth event:', event);
      if (mounted) {
        setSession(currentSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'calai://',
        },
      });
      
      if (error) throw error;

      if (data?.user) {
        Alert.alert(
          'Check your email',
          'We have sent you an email to verify your account. Please check your inbox and follow the verification link.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/sign-in')
            }
          ]
        );
      } else {
        throw new Error('Signup failed: No user data received');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.session) {
        console.log('Sign in successful, setting session');
        setSession(data.session);
        router.replace('/(onboarding)/bmi-calculator');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Error', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signUp, signIn, signOut }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 