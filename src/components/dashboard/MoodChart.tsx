import React from "react";
import { motion } from "framer-motion";

const moods = [
  { key: "great", emoji: "😄", label: "Great", color: "bg-emerald-500" },
  { key: "good", emoji: "🙂", label: "Good", color: "bg-teal-500" },
  { key: "neutral", emoji: "😐", label: "Okay", color: "bg-slate-500" },
  { key: "low", emoji: "😔", label: "Down", color: "bg-amber-500" },
  { key: "bad", emoji: "😢", label: "Bad", color: "bg-red-500" },
];

export default function MoodChart({ entries }) {
  const moodCounts = {};
  entries.forEach((e) => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });

  const maxCount = Math.max(1, ...Object.values(moodCounts).map(v => Number(v)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="glass rounded-2xl p-5 sm:p-6"
    >
      <h2 className="text-base font-semibold text-white mb-5">How You Feel</h2>

      <div className="space-y-3">
        {moods.map((mood) => {
          const count = moodCounts[mood.key] || 0;
          const pct = (count / maxCount) * 100;
          return (
            <div key={mood.key} className="flex items-center gap-3">
              <span className="text-lg w-7 text-center">{mood.emoji}</span>
              <div className="flex-1">
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${mood.color} opacity-70`}
                  />
                </div>
              </div>
              <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
