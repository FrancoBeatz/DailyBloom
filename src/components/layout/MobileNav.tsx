import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { LayoutDashboard, BookOpen, Clock, Briefcase, Coffee } from "lucide-react";

const navItems = [
  { name: "Command Hub", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Focus Chamber", icon: Clock, page: "DailyFocus" },
  { name: "Matrix", icon: Briefcase, page: "DeveloperMatrix" },
  { name: "Logs", icon: BookOpen, page: "Journal" },
];

export default function MobileNav({ currentPage }) {
  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur border-b border-[#6F4E37]/10 flex items-center px-4 z-50 md:hidden shadow-sm">
        <div className="w-7 h-7 rounded-lg bg-[#6F4E37] flex items-center justify-center shadow-sm">
          <Coffee className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="ml-2.5 text-base font-serif font-black text-[#6F4E37] tracking-tight">
          CreamFlow <span className="text-[#D4A017] font-semibold font-sans text-xs">SaaS</span>
        </span>
      </div>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#6F4E37]/10 z-50 md:hidden safe-area-bottom shadow-md">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-sans ${
                  isActive
                    ? "text-[#6F4E37] font-bold"
                    : "text-[#7A6F62] hover:text-[#6F4E37]"
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 ${isActive ? "text-[#6F4E37]" : "text-[#7A6F62]"}`} />
                <span className="text-[10px] uppercase font-semibold tracking-wider font-sans">{item.name.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
