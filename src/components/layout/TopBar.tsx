import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Plus,
  Play,
  Pause,
  Clock,
  Sparkles,
  Command,
  ChevronRight,
  FolderDot,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { useProductivity } from "@/lib/ProductivityContext";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/lib/utils";
import { MagneticButton } from "@/components/motion/MagneticButton";

interface TopBarProps {
  onOpenCommand: () => void;
  onOpenQuickCapture: (tab?: "task" | "project" | "goal" | "habit" | "learning") => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCommand,
  onOpenQuickCapture,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    timer,
    stopFocus,
    notifications,
    dismissNotification,
    clearAllNotifications,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
  } = useProductivity();

  const [showNotifs, setShowNotifs] = useState(false);

  // Format active timer minutes & seconds
  const timerMins = Math.floor(timer.seconds_remaining / 60);
  const timerSecs = timer.seconds_remaining % 60;
  const timeFormatted = `${String(timerMins).padStart(2, "0")}:${String(timerSecs).padStart(2, "0")}`;

  // Breadcrumb generation
  const path = location.pathname;
  let pageTitle = "Command Hub";
  if (path.includes("DailyFocus")) pageTitle = "Focus Chamber";
  else if (path.includes("DeveloperMatrix")) pageTitle = "Developer Matrix";
  else if (path.includes("Journal")) pageTitle = "Mind Vault";

  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FFF8E7]/90 backdrop-blur-md border-b border-[#6F4E37]/10 px-4 sm:px-8 flex items-center justify-between font-sans">
      {/* Left: Breadcrumb & Workspace Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Link
            to={createPageUrl("Dashboard")}
            className="text-[#7A6F62] hover:text-[#6F4E37] transition"
          >
            CreamFlow
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#7A6F62]/40" />
          <span className="text-[#6F4E37] font-bold">{pageTitle}</span>
        </div>

        {/* Workspace select dropdown */}
        {workspaces.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#6F4E37]/10 text-xs text-[#6F4E37] font-medium shadow-xs">
            <FolderDot className="w-3.5 h-3.5 text-[#D4A017]" />
            <select
              value={activeWorkspaceId || ""}
              onChange={(e) => setActiveWorkspaceId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#6F4E37] focus:outline-none cursor-pointer"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Timer Widget, Quick Command, Capture CTA, Notifications */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Active Focus Mini-Widget */}
        {timer.is_running && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#6F4E37] text-white rounded-2xl shadow-sm text-xs font-mono font-bold cursor-pointer"
            onClick={() => navigate(createPageUrl("DailyFocus"))}
          >
            <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse" />
            <Clock className="w-3.5 h-3.5" />
            <span>{timeFormatted}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopFocus();
              }}
              className="p-1 hover:bg-white/20 rounded-md transition"
            >
              <Pause className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {/* Command Search Trigger Button */}
        <button
          onClick={onOpenCommand}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-[#6F4E37]/15 rounded-xl text-xs text-[#7A6F62] hover:border-[#6F4E37]/30 hover:text-[#6F4E37] transition shadow-xs cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#6F4E37]" />
          <span className="font-medium">Search / Command</span>
          <kbd className="px-1.5 py-0.5 bg-[#FFF8E7] rounded text-[10px] font-mono font-bold text-[#6F4E37] border border-[#6F4E37]/10">
            ⌘K
          </kbd>
        </button>

        {/* Quick Capture CTA */}
        <MagneticButton
          onClick={() => onOpenQuickCapture("task")}
          className="px-3 sm:px-3.5 py-1.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Capture</span>
        </MagneticButton>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl bg-white border border-[#6F4E37]/15 text-[#6F4E37] hover:bg-[#FFF8E7] transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4A017] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#6F4E37]/20 shadow-xl overflow-hidden z-50 text-[#2E2E2E]"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#6F4E37]/10 bg-[#FFF8E7]/40">
                  <span className="text-xs font-serif font-bold text-[#6F4E37]">
                    Activity & Alerts
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-[#7A6F62] hover:text-[#6F4E37] font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#6F4E37]/5">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#7A6F62]">
                      No notifications yet. You&apos;re in flow! ☕
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className="p-3 hover:bg-[#FFF8E7]/30 transition flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#2E2E2E]">{n.title}</p>
                          <p className="text-[11px] text-[#7A6F62] mt-0.5">{n.message}</p>
                        </div>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          className="text-[#7A6F62] hover:text-[#6F4E37] p-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
export default TopBar;
