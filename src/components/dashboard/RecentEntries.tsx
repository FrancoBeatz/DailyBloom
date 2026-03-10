import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowRight, Clock } from "lucide-react";

const moodEmoji = {
  great: "😄",
  good: "🙂",
  neutral: "😐",
  low: "😔",
  bad: "😢",
};

export default function RecentEntries({ entries }) {
  const recent = entries.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/5">
        <h2 className="text-base font-semibold text-white">Latest Stories</h2>
        <Link
          to={createPageUrl("Journal")}
          className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
        >
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-white/5">
        {recent.map((entry, i) => (
          <Link
            key={entry.id}
            to={createPageUrl(`JournalView?id=${entry.id}`)}
            className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-white/[0.02] transition-colors group"
          >
            <div className="text-xl flex-shrink-0">
              {moodEmoji[entry.mood] || "📝"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate group-hover:text-teal-300 transition-colors">
                {entry.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500">
                  {format(new Date(entry.createdAt?.seconds * 1000), "MMM d, yyyy")}
                </span>
                {entry.word_count > 0 && (
                  <span className="text-xs text-slate-600">
                    · {entry.word_count} words
                  </span>
                )}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
