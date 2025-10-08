"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

/**
 * Provider/Seller Types
 * - service: Professional service providers (tutoring, plumbing, etc.)
 * - business: Businesses selling products or multiple services
 * - individual: Individual sellers (personal items, freelance work)
 * 
 * Note: Buyers/clients will have a separate lightweight account system (future)
 */
type ProviderType = 'service' | 'business' | 'individual';

/**
 * Authentication Context Type
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: ProviderType, phone?: string) => Promise<{ error: AuthError | null }>;
  signUpWithPhone: (phone: string, password: string, userType: ProviderType) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithPhone: (phone: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to use auth context
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { user, signIn, signOut } = useAuth()
 *   
 *   if (!user) {
 *     return <button onClick={() => signIn(email, password)}>Login</button>
 *   }
 *   
 *   return <button onClick={signOut}>Logout</button>
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Auth Provider Component
 * 
 * Wrap your app with this provider to enable authentication throughout.
 * Manages auth state, session persistence, and provides auth methods.
 * 
 * @example
 * ```typescript
 * // In app/layout.tsx
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Update local state
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Refresh page to sync server and client state
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  /**
   * Sign up a new provider/seller with email
   * 
   * Calls the signup API route which uses the service role key for admin operations.
   * This ensures proper database trigger execution for profile, verification, and settings creation.
   * 
   * @param email - User's email address
   * @param password - User's password (min 8 chars recommended)
   * @param userType - Provider type: 'service' | 'business' | 'individual'
   * @param phone - Optional phone number for future verification (enables +15 BMC reward)
   * @returns Promise with error object or null on success
   */
  const signUp = async (
    email: string,
    password: string,
    userType: ProviderType,
    phone?: string
  ) => {
    try {
      // Call API route with service role key
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          userType,
          phone,
        }),
      });

      const result = await response.json();

      // Handle API errors
      if (!response.ok || !result.success) {
        console.error('Signup failed:', result.error);
        return { 
          error: { 
            message: result.error || 'Signup failed',
            name: 'SignUpError',
            status: response.status
          } as AuthError 
        };
      }

      return { error: null };
    } catch (error) {
      console.error('Signup exception:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Sign up a new provider/seller with phone number
   * 
   * @param phone User's phone number (with country code, e.g., +27821234567)
   * @param password User's password (min 8 chars)
   * @param userType Type of provider (service/business/individual)
   */
  const signUpWithPhone = async (
    phone: string,
    password: string,
    userType: ProviderType
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: {
            user_type: userType,
          },
        },
      });

      return { error };
    } catch (error) {
      console.error('Phone signup error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Sign in an existing user with email
   * 
   * @param email User's email
   * @param password User's password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Sign in an existing user with phone number
   * 
   * @param phone User's phone number
   * @param password User's password
   */
  const signInWithPhone = async (phone: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });

      return { error };
    } catch (error) {
      console.error('Phone sign in error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Verify OTP code sent to phone
   * 
   * @param phone User's phone number
   * @param token OTP code received via SMS
   */
  const verifyOTP = async (phone: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      return { error };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  /**
   * Send password reset email
   * 
   * @param email User's email
   */
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signUpWithPhone,
    signIn,
    signInWithPhone,
    signOut,
    resetPassword,
    verifyOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
