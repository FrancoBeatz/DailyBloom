import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  Briefcase,
  Coffee,
  Plus,
  Command,
} from "lucide-react";

const navItems = [
  { name: "Command Hub", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Focus", icon: Clock, page: "DailyFocus" },
  { name: "Matrix", icon: Briefcase, page: "DeveloperMatrix" },
  { name: "Mind Vault", icon: BookOpen, page: "Journal" },
];

interface MobileNavProps {
  currentPage: string;
  onOpenCommandPalette?: () => void;
  onOpenQuickCapture?: (tab?: "task" | "project" | "goal" | "habit" | "learning") => void;
}

export default function MobileNav({
  currentPage,
  onOpenCommandPalette,
  onOpenQuickCapture,
}: MobileNavProps) {
  return (
    <>
      {/* Top bar on Mobile */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-[#6F4E37]/10 flex items-center justify-between px-4 z-50 md:hidden shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6F4E37] flex items-center justify-center shadow-xs">
            <Coffee className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-serif font-black text-[#6F4E37] tracking-tight">
            CreamFlow <span className="text-[#D4A017] font-semibold font-sans text-xs">SaaS</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="p-1.5 rounded-lg bg-[#6F4E37]/10 text-[#6F4E37] cursor-pointer"
            >
              <Command className="w-4 h-4" />
            </button>
          )}
          {onOpenQuickCapture && (
            <button
              onClick={() => onOpenQuickCapture("task")}
              className="p-1.5 rounded-lg bg-[#6F4E37] text-white cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#6F4E37]/10 z-50 md:hidden safe-area-bottom shadow-md">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-sans ${
                  isActive ? "text-[#6F4E37] font-bold" : "text-[#7A6F62] hover:text-[#6F4E37]"
                }`}
              >
                <item.icon
                  className={`w-4.5 h-4.5 ${isActive ? "text-[#6F4E37]" : "text-[#7A6F62]"}`}
                />
                <span className="text-[10px] uppercase font-semibold tracking-wider font-sans">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
