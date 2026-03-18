import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/supabase';
import { toast } from 'sonner';

const AuthContext = createContext({
  user: null,
  loading: true,
  isLoggingIn: false,
  login: async (email, password) => {},
  signup: async (email, password, fullName) => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Get initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setIsLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Welcome back!");
    } catch (error) {
      toast.error(error.message || "Login failed. Please check your credentials.");
      console.error("Login failed", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signup = async (email, password, fullName) => {
    setIsLoggingIn(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      toast.success("Check your email for confirmation!");
    } catch (error) {
      toast.error(error.message || "Signup failed. Please try again.");
      console.error("Signup failed", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully.");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoggingIn, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
