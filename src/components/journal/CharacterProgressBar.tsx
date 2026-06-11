import React from "react";
import { motion } from "framer-motion";

const MAX_CHARS = 10000;

export default function CharacterProgressBar({ charCount }) {
  const pct = Math.min((charCount / MAX_CHARS) * 100, 100);
  const isNearLimit = pct > 80;
  const isOverLimit = pct >= 100;

  return (
    <div className="flex items-center gap-3 font-sans">
      <div className="flex-1 h-1.5 rounded-full bg-[#FFF8E7] overflow-hidden border border-[#6F4E37]/5">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-full transition-colors ${
            isOverLimit
              ? "bg-red-500"
              : isNearLimit
              ? "bg-[#D4A017]"
              : "bg-[#6F4E37]"
          }`}
        />
      </div>
      <span className={`text-[10px] font-mono ${
        isOverLimit ? "text-red-500 font-bold" : isNearLimit ? "text-[#D4A017] font-bold" : "text-[#7A6F62]"
      }`}>
        {charCount.toLocaleString()}/{MAX_CHARS.toLocaleString()}
      </span>
    </div>
  );
}
