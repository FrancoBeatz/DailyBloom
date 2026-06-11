import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  PenLine,
  LogOut,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  Layers,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import PremiumTooltip from "../PremiumTooltip";

const navItems = [
  { 
    name: "Command Hub", 
    icon: LayoutDashboard, 
    page: "Dashboard",
    tooltip: { 
      title: "Command Hub", 
      description: "Unified operating screen tracking your active project sprints, goal progress, and workspace metrics.",
      bestPractice: "Review your focus dashboard first thing in the morning to plan optimal sprints."
    }
  },
  { 
    name: "Focus Chamber", 
    icon: Clock, 
    page: "DailyFocus",
    tooltip: { 
      title: "Focus Chamber", 
      description: "Distraction-free deep work zone equipped with a responsive flow timer synchronised into actual task timelines.",
      bestPractice: "Work in blocks of 25-50 minutes, then log your focus times to update your actual developer hours."
    }
  },
  { 
    name: "Developer Matrix", 
    icon: Briefcase, 
    page: "DeveloperMatrix",
    tooltip: { 
      title: "Developer Matrix", 
      description: "Engineering and job metrics board. Log coding hours, monitor learning, and track active career logs.",
      bestPractice: "Keep your study topics structured to present an impeccable progress log and study timeline."
    }
  },
  { 
    name: "Cognitive Logs", 
    icon: BookOpen, 
    page: "Journal",
    tooltip: { 
      title: "Cognitive Logs", 
      description: "Record daily performance milestones, retrospectives, decisions, and psychological flow states.",
      bestPractice: "Write a short post-work review to log insights and keep your memory pipeline clean."
    }
  },
];

interface SidebarProps {
  currentPage: string;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ currentPage, collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-50 bg-white border-r border-[#6F4E37]/15 flex flex-col font-sans shadow-md"
    >
      {/* Brand Logo Section */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[#6F4E37]/10 bg-[#FFF8E7]/40">
        <div className="w-9 h-9 rounded-xl bg-[#6F4E37] flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#6F4E37]/10">
          <Coffee className="w-5 h-5 text-white animate-pulse" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col text-left"
          >
            <span className="text-base font-serif font-black tracking-tight text-[#6F4E37] flex items-center gap-1">
              CreamFlow <span className="text-xs text-[#D4A017] tracking-wider font-sans font-bold">SaaS</span>
            </span>
            <span className="text-[9px] font-sans font-semibold text-[#7A6F62] tracking-wider">
              ESTABLISH YOUR DAILY PATH
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation Loop with Premium Tooltips */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const iconColor = isActive ? "text-[#6F4E37]" : "text-[#7A6F62] group-hover:text-[#6F4E37]";
          
          const linkButton = (
            <Link
              to={createPageUrl(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative font-sans text-left
                ${isActive
                  ? "bg-[#6F4E37]/10 text-[#6F4E37] font-bold"
                  : "text-[#7A6F62] hover:text-[#6F4E37] hover:bg-[#6F4E37]/5"
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#6F4E37] rounded-r-full"
                />
              )}
              <item.icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${iconColor}`} />
              {!collapsed && (
                <span className="text-xs uppercase tracking-wider font-semibold">{item.name}</span>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <div key={item.page} className="w-full">
                <PremiumTooltip content={item.tooltip} position="right">
                  {linkButton}
                </PremiumTooltip>
              </div>
            );
          }

          return (
            <div key={item.page} className="w-full">
              {linkButton}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Controls and Profile */}
      <div className="p-3 border-t border-[#6F4E37]/10 bg-[#FFF8E7]/20 space-y-2">
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-lg text-[#7A6F62] hover:text-[#6F4E37] hover:bg-[#6F4E37]/5 transition-colors cursor-pointer"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User profile capsule */}
        <div className="flex items-center gap-2.5 px-2 py-2.5 bg-white border border-[#6F4E37]/10 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-[#6F4E37] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-inner">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#6F4E37] truncate">
                {displayName}
              </p>
              <p className="text-[9px] text-[#7A6F62] font-mono truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[#7A6F62] hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
              title="Sign Out of CreamFlow"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
