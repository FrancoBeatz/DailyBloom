import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { PenLine, BookOpen } from "lucide-react";

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="glass rounded-2xl p-8 sm:p-12 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center mb-6"
      >
        <BookOpen className="w-10 h-10 text-teal-400" />
      </motion.div>

      <h3 className="text-xl font-semibold text-white mb-2">
        Your diary is empty
      </h3>
      <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">
        Start writing down your thoughts and ideas. Every story begins with a first page.
      </p>

      <Link
        to={createPageUrl("JournalEditor")}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium text-sm hover:from-teal-400 hover:to-teal-500 transition-all duration-300"
      >
        <PenLine className="w-4 h-4" />
        Write Your First Story
      </Link>
    </motion.div>
  );
}
