import React from "react";
import { motion } from "framer-motion";

const moods = [
  { key: "great", emoji: "😄", label: "Great" },
  { key: "good", emoji: "🙂", label: "Good" },
  { key: "neutral", emoji: "😐", label: "Okay" },
  { key: "low", emoji: "😔", label: "Down" },
  { key: "bad", emoji: "😢", label: "Bad" },
];

export default function MoodSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {moods.map((mood) => {
        const isActive = value === mood.key;
        return (
          <motion.button
            key={mood.key}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(mood.key)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 flex-shrink-0 min-w-[64px] ${
              isActive
                ? "bg-teal-500/15 ring-1 ring-teal-500/30"
                : "hover:bg-white/5"
            }`}
          >
            <span className={`text-xl ${isActive ? "" : "grayscale opacity-50"} transition-all`}>
              {mood.emoji}
            </span>
            <span className={`text-[10px] font-medium ${isActive ? "text-teal-400" : "text-slate-500"}`}>
              {mood.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
