import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Trash2, Clock } from "lucide-react";

const moodEmoji = {
  great: "😄",
  good: "🙂",
  neutral: "😐",
  low: "😔",
  bad: "😢",
};

interface JournalCardProps {
  entry: any;
  index: number;
  onDelete: (entry: any) => void;
}

export default function JournalCard({ entry, index, onDelete }: JournalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="glass rounded-2xl overflow-hidden glass-hover transition-all duration-300 group"
    >
      <Link
        to={createPageUrl(`JournalView?id=${entry.id}`)}
        className="block p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{moodEmoji[entry.mood] || "📝"}</span>
            <h3 className="text-base font-semibold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
              {entry.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {entry.content}
        </p>

        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {entry.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400/70 font-medium"
              >
                #{tag}
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="text-[10px] text-slate-500">
                +{entry.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {format(new Date(entry.createdAt?.seconds * 1000), "MMM d, yyyy")}
            {entry.word_count > 0 && (
              <span className="ml-2">{entry.word_count} words</span>
            )}
          </div>
        </div>
      </Link>

      {/* Delete button */}
      <div className="px-5 pb-4 sm:px-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(entry);
          }}
          className="text-xs text-slate-600 hover:text-red-400 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </motion.div>
  );
}
