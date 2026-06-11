import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, supabaseUrl } from '@/supabase';
import { toast } from 'sonner';

const getProjectId = () => {
  try {
    return supabaseUrl.replace('https://', '').split('.')[0];
  } catch {
    return 'your-project';
  }
};

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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err: any) {
        console.error("Failed to get initial session, testing sandbox fallback: ", err);
        const msg = err?.message || "";
        if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("fetch failed") || msg.toLowerCase().includes("network error") || msg.toLowerCase().includes("getaddrinfo")) {
          localStorage.setItem('supabase_fallback_sandbox', 'true');
          const sandboxSession = JSON.parse(localStorage.getItem('sandbox_session') || 'null');
          setUser(sandboxSession?.user ?? null);
          toast.warning("Supabase backend unreachable. Running in Local Sandbox Mode.");
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    let subscription: any = null;
    try {
      const authListener = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = authListener?.data?.subscription;
    } catch (e) {
      console.warn("Could not setup realtime auth listener, skipping:", e);
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
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
    } catch (error: any) {
      const msg = error?.message || "";
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("fetch failed") || msg.toLowerCase().includes("network error") || msg.toLowerCase().includes("getaddrinfo")) {
        console.log("Supabase fetch failed during login, switching to Sandbox mode...");
        localStorage.setItem('supabase_fallback_sandbox', 'true');
        toast.info("Database connection failed. Switched to secure Local Sandbox Mode!", { duration: 5000 });
        // Retry logging in sandbox mode instantly
        try {
          const { error: sandboxErr } = await supabase.auth.signInWithPassword({ email, password });
          if (sandboxErr) throw sandboxErr;
          toast.success("Signed in successfully (Local Sandbox)!");
        } catch (subErr: any) {
          toast.error(subErr?.message || "Login failed inside sandbox.");
        }
      } else {
        toast.error(error.message || "Login failed. Please check your credentials.");
      }
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
    } catch (error: any) {
      const msg = error?.message || "";
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("fetch failed") || msg.toLowerCase().includes("network error") || msg.toLowerCase().includes("getaddrinfo")) {
        console.log("Supabase fetch failed during signup, switching to Sandbox mode...");
        localStorage.setItem('supabase_fallback_sandbox', 'true');
        toast.info("Database connection failed. Switched to secure Local Sandbox Mode!", { duration: 5000 });
        // Retry signing up in sandbox mode instantly
        try {
          const { error: sandboxErr } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
          });
          if (sandboxErr) throw sandboxErr;
          toast.success("Account created successfully (Local Sandbox)!");
        } catch (subErr: any) {
          toast.error(subErr?.message || "Signup failed inside sandbox.");
        }
      } else {
        toast.error(error.message || "Signup failed. Please try again.");
      }
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
