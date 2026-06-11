import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Trash2, Clock } from "lucide-react";

const moodEmoji = {
  great: "🧠",
  good: "☕",
  neutral: "🍃",
  low: "🕯️",
  bad: "🥀",
};

interface JournalCardProps {
  entry: any;
  index: number;
  onDelete: (entry: any) => void;
}

const JournalCard: React.FC<JournalCardProps> = ({ entry, index, onDelete }) => {
  const entryDate = entry.created_at ? new Date(entry.created_at) : new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="bg-white rounded-3xl overflow-hidden border border-[#6F4E37]/10 hover:border-[#6F4E37]/25 shadow-sm hover:shadow-md transition-all duration-300 group font-sans"
    >
      <Link
        to={createPageUrl(`JournalView?id=${entry.id}`)}
        className="block p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">
              {entry.mood === "great" ? "🌟" : entry.mood === "good" ? "☕" : entry.mood === "neutral" ? "🍃" : entry.mood === "low" ? "💨" : "🌋"}
            </span>
            <h3 className="text-sm font-bold text-[#6F4E37] group-hover:text-[#D4A017] transition line-clamp-1">
              {entry.title || "Untitled log"}
            </h3>
          </div>
        </div>

        <p className="text-xs text-[#7A6F62] line-clamp-2 mb-4 leading-relaxed font-semibold">
          {entry.content}
        </p>

        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {entry.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#6F4E37] border border-[#6F4E37]/10 font-bold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#6F4E37]/5 pt-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#7A6F62] font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#D4A017]" />
            {format(entryDate, "MMM d, yyyy")}
          </div>
          {entry.word_count > 0 && (
            <span className="text-[9px] font-mono text-[#D4A017] font-bold">{entry.word_count} words</span>
          )}
        </div>
      </Link>

      <div className="px-5 pb-4 sm:px-6 flex justify-end">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(entry);
          }}
          className="text-[10px] uppercase font-bold text-[#7A6F62] hover:text-red-500 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          <Trash2 className="w-3 h-3 text-red-500" />
          <span>Archive</span>
        </button>
      </div>
    </motion.div>
  );
};

export default JournalCard;
