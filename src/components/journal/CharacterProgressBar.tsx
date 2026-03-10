import React from "react";
import { motion } from "framer-motion";

const MAX_CHARS = 10000;

export default function CharacterProgressBar({ charCount }) {
  const pct = Math.min((charCount / MAX_CHARS) * 100, 100);
  const isNearLimit = pct > 80;
  const isOverLimit = pct >= 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-full transition-colors ${
            isOverLimit
              ? "bg-red-500"
              : isNearLimit
              ? "bg-amber-500"
              : "bg-teal-500"
          }`}
        />
      </div>
      <span className={`text-xs font-mono ${
        isOverLimit ? "text-red-400" : isNearLimit ? "text-amber-400" : "text-slate-500"
      }`}>
        {charCount.toLocaleString()}/{MAX_CHARS.toLocaleString()}
      </span>
    </div>
  );
}
