import React from "react";
import { Brain, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-500/[0.03] blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center mb-8"
        >
          <Brain className="w-10 h-10 text-teal-400/60" />
        </motion.div>

        <h1 className="text-7xl font-bold bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <p className="text-xl text-slate-300 mb-2">Page not found</p>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8">
          This page is missing. Let's go back home.
        </p>

        <Link
          to={createPageUrl("Dashboard")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium hover:from-teal-400 hover:to-teal-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to DailyBloom
        </Link>
      </motion.div>
    </div>
  );
}
