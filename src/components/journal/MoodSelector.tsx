import React from "react";
import { motion } from "framer-motion";

const moods = [
  { key: "great", emoji: "🌟", label: "Peak Flow" },
  { key: "good", emoji: "☕", label: "Focused" },
  { key: "neutral", emoji: "🍃", label: "Balanced" },
  { key: "low", emoji: "💨", label: "Fatigue" },
  { key: "bad", emoji: "🌋", label: "Overwhelmed" },
];

export default function MoodSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide font-sans">
      {moods.map((mood) => {
        const isActive = value === mood.key;
        return (
          <motion.button
            key={mood.key}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(mood.key)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0 min-w-[80px] cursor-pointer border ${
              isActive
                ? "bg-[#6F4E37] border-transparent text-white"
                : "bg-white hover:bg-[#FFF8E7] border-[#6F4E37]/10 text-[#7A6F62]"
            }`}
          >
            <span className="text-lg">
              {mood.emoji}
            </span>
            <span className={`text-[9px] uppercase tracking-wider font-bold`}>
              {mood.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
