import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Flame, TrendingUp } from "lucide-react";

export default function StatsGrid({ entries }: { entries: any[] }) {
  const totalEntries = entries.length;

  // Calculate streak
  const sortedDates = [...new Set(
    entries.map((e: any) => {
      const date = e.created_at ? new Date(e.created_at) : 
                   e.createdAt?.seconds ? new Date(e.createdAt.seconds * 1000) : 
                   new Date();
      return date.toDateString();
    })
  )].sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (sortedDates.length > 0) {
    const lastEntryDate = sortedDates[0];
    if (lastEntryDate === today || lastEntryDate === yesterday) {
      streak = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = new Date(sortedDates[i] as string).getTime();
        const next = new Date(sortedDates[i + 1] as string).getTime();
        const diff = (current - next) / (1000 * 60 * 60 * 24);
        if (Math.round(diff) === 1) {
          streak++;
        } else break;
      }
    }
  }

  const totalWords = entries.reduce((sum, e: any) => sum + (e.word_count || 0), 0);

  const thisMonth = entries.filter((e: any) => {
    const d = e.created_at ? new Date(e.created_at) : 
              e.createdAt?.seconds ? new Date(e.createdAt.seconds * 1000) : 
              new Date();
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    {
      label: "Total Stories",
      value: totalEntries,
      icon: BookOpen,
      color: "from-teal-400 to-teal-600",
      bg: "bg-teal-500/10",
    },
    {
      label: "Days in a Row",
      value: streak,
      icon: Flame,
      color: "from-orange-400 to-red-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "This Month",
      value: thisMonth,
      icon: Calendar,
      color: "from-violet-400 to-purple-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Total Words",
      value: totalWords.toLocaleString(),
      icon: TrendingUp,
      color: "from-blue-400 to-cyan-500",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.5 }}
          className="glass rounded-2xl p-4 sm:p-5 glass-hover transition-all duration-300 cursor-default group"
        >
          <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
            <stat.icon className={`w-5 h-5 text-teal-400`} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
