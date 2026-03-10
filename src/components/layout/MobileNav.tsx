import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { LayoutDashboard, BookOpen, PenLine, Brain } from "lucide-react";

const navItems = [
  { name: "Home", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Diary", icon: BookOpen, page: "Journal" },
  { name: "Write", icon: PenLine, page: "JournalEditor" },
];

export default function MobileNav({ currentPage }) {
  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 glass border-b border-white/5 flex items-center px-4 z-50 md:hidden">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="ml-2 text-base font-bold bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">
          DailyBloom
        </span>
      </div>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 z-50 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? "text-teal-400"
                    : "text-slate-500"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
