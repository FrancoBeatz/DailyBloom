import React, { useState } from "react";
import { motion } from "framer-motion";
import { Coffee, Loader2, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const { login, signup, isLoggingIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signup(email, password, fullName);
    } else {
      await login(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative ambient coffee/cream blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#6F4E37]/[0.05] blur-[150px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[200px] h-[200px] rounded-full bg-[#D4A017]/[0.05] blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[#6F4E37]/10 text-center">
          
          {/* Logo Icon */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 mx-auto rounded-2xl bg-[#6F4E37] flex items-center justify-center mb-6 shadow-lg shadow-[#6F4E37]/20"
          >
            <Coffee className="w-8 h-8 text-[#FFF8E7]" />
          </motion.div>

          {/* Title Branding */}
          <h1 className="text-3xl font-serif font-bold text-[#6F4E37] tracking-tight">CreamFlow</h1>
          <p className="text-xs uppercase tracking-widest text-[#D4A017] font-semibold mt-1">
            Flow Through Your Day With Purpose
          </p>

          <p className="text-sm text-[#7A6F62] mt-3 mb-6 font-medium leading-relaxed">
            {isSignUp ? "Begin your elite personal flow engine" : "Sovereign deployment workspace & cognitive companion"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6F62]/60" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="E.g. Alexander Mercer"
                    className="w-full bg-[#FFF8E7]/50 border border-[#6F4E37]/15 rounded-xl py-3 pl-11 pr-4 text-[#2E2E2E] focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] transition-all text-sm font-semibold"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6F62]/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#FFF8E7]/50 border border-[#6F4E37]/15 rounded-xl py-3 pl-11 pr-4 text-[#2E2E2E] focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] transition-all text-sm font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6F62]/60" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FFF8E7]/50 border border-[#6F4E37]/15 rounded-xl py-3 pl-11 pr-4 text-[#2E2E2E] focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] transition-all text-sm font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#6F4E37] text-white font-semibold hover:bg-[#5a3e2b] transition-all shadow-md mt-6 text-sm hover:translate-y-[-1px] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? "Establish Sovereign Account" : "Access Workspace"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#6F4E37]/10 pt-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#6F4E37] hover:text-[#D4A017] font-bold text-sm transition-colors cursor-pointer"
            >
              {isSignUp ? "Already a premium member? Sign In" : "New to CreamFlow? Register Account"}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 mt-6 text-[10px] text-[#7A6F62] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>RSA-2048 Military Enclaved Security Shield</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
