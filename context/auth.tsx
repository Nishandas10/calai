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
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';
    
    console.log('Current route:', { segments, inAuthGroup, hasSession: !!session });

    async function checkAuthAndOnboarding() {
      try {
        // If no session, redirect to sign in unless already in auth group
        if (!session) {
          if (!inAuthGroup) {
            console.log('No session, redirecting to sign-in');
            router.replace('/(auth)/sign-in');
          }
          return;
        }

        // If we have a session, check onboarding status
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error checking profile:', error);
          return;
        }

        // Handle navigation based on onboarding status
        if (profile?.onboarding_completed) {
          if (inAuthGroup || inOnboardingGroup) {
            console.log('Onboarding completed, redirecting to main app');
            router.replace('/(tabs)');
          }
        } else {
          if (inTabsGroup || inAuthGroup) {
            console.log('Onboarding not completed, redirecting to onboarding');
            router.replace('/(onboarding)/goals');
          }
        }
      } catch (error) {
        console.error('Error in checkAuthAndOnboarding:', error);
      }
    }

    checkAuthAndOnboarding();
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
        setIsLoading(true);
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (mounted) {
          if (initialSession) {
            // Ensure user profile exists
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('id, onboarding_completed')
              .eq('id', initialSession.user.id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error checking profile:', profileError);
            }

            // If no profile exists, create one
            if (!profile) {
              const { error: createError } = await supabase
                .from('user_profiles')
                .insert({
                  id: initialSession.user.id,
                  email: initialSession.user.email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  onboarding_completed: false
                });

              if (createError) {
                console.error('Error creating profile:', createError);
              }
            }

            setSession(initialSession);
          } else {
            setSession(null);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setSession(null);
          setIsLoading(false);
        }
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth event:', event);
      if (mounted && currentSession) {
        // Ensure user profile exists on auth state change
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', currentSession.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking profile:', profileError);
        }

        // If no profile exists, create one
        if (!profile) {
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: currentSession.user.id,
              email: currentSession.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createError) {
            console.error('Error creating profile:', createError);
          }
        }

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
      console.error('Signup error:', error);
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

        // Check user profile and onboarding status
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, onboarding_completed')
          .eq('id', data.session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking profile:', profileError);
        }

        // If no profile exists, create one
        if (!profile) {
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.session.user.id,
              email: data.session.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              onboarding_completed: false
            });

          if (createError) {
            console.error('Error creating profile:', createError);
          }
          setSession(data.session);
          router.replace('/(onboarding)/bmi-calculator');
        } else {
          setSession(data.session);
          if (profile.onboarding_completed) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(onboarding)/bmi-calculator');
          }
        }
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