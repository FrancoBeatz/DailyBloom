import React from "react";
import { motion } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const { login, isLoggingIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-500/[0.03] blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 max-w-md w-full"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-8 shadow-2xl shadow-teal-500/20"
        >
          <Brain className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-4">DailyBloom</h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          A friendly space for your daily stories and feelings.
        </p>

        <button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          )}
          {isLoggingIn ? "Signing in..." : "Continue with Google"}
        </button>

        <p className="mt-8 text-xs text-slate-600">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </motion.div>
    </div>
  );
}
