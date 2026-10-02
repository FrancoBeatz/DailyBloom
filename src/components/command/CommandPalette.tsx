import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckSquare,
  FolderDot,
  Target,
  Zap,
  BookOpen,
  Clock,
  Briefcase,
  LayoutDashboard,
  Play,
  Volume2,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useProductivity } from "@/lib/ProductivityContext";
import { createPageUrl } from "@/lib/utils";
import { audioService } from "@/lib/AudioService";
import { toast } from "sonner";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickCapture: (tab?: "task" | "project" | "goal" | "habit" | "learning") => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenQuickCapture,
}) => {
  const navigate = useNavigate();
  const { tasks, projects, goals, habits, startFocus } = useProductivity();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define commands
  const allItems = useMemo(() => {
    const navItems = [
      {
        id: "nav-dash",
        title: "Go to Command Hub Dashboard",
        category: "Navigation",
        icon: LayoutDashboard,
        action: () => navigate(createPageUrl("Dashboard")),
      },
      {
        id: "nav-focus",
        title: "Go to Focus Chamber Timer",
        category: "Navigation",
        icon: Clock,
        action: () => navigate(createPageUrl("DailyFocus")),
      },
      {
        id: "nav-matrix",
        title: "Go to Developer Matrix & Learning",
        category: "Navigation",
        icon: Briefcase,
        action: () => navigate(createPageUrl("DeveloperMatrix")),
      },
      {
        id: "nav-journal",
        title: "Go to Mind Vault Retrospective",
        category: "Navigation",
        icon: BookOpen,
        action: () => navigate(createPageUrl("Journal")),
      },
    ];

    const actionItems = [
      {
        id: "act-new-task",
        title: "Create New Smart Task",
        category: "Actions",
        icon: Plus,
        shortcut: "T",
        action: () => onOpenQuickCapture("task"),
      },
      {
        id: "act-new-proj",
        title: "Create Project Tracker",
        category: "Actions",
        icon: FolderDot,
        shortcut: "P",
        action: () => onOpenQuickCapture("project"),
      },
      {
        id: "act-new-goal",
        title: "Set Strategic Goal",
        category: "Actions",
        icon: Target,
        shortcut: "G",
        action: () => onOpenQuickCapture("goal"),
      },
      {
        id: "act-new-habit",
        title: "Create Daily Habit",
        category: "Actions",
        icon: Zap,
        shortcut: "H",
        action: () => onOpenQuickCapture("habit"),
      },
      {
        id: "act-start-pomodoro",
        title: "Start 25m Deep Work Sprint",
        category: "Actions",
        icon: Play,
        action: () => {
          startFocus(tasks[0]?.id || undefined, 25);
          navigate(createPageUrl("DailyFocus"));
          toast.success("25-minute sprint launched!");
        },
      },
      {
        id: "act-ambient-rain",
        title: "Play Ambient Rain Audio",
        category: "Audio",
        icon: Volume2,
        action: () => {
          audioService.startAmbient("rain", 0.4);
          toast.success("Ambient rain started 🌧️");
        },
      },
      {
        id: "act-ambient-cafe",
        title: "Play Warm Cafe Ambience",
        category: "Audio",
        icon: Volume2,
        action: () => {
          audioService.startAmbient("cafe", 0.4);
          toast.success("Cafe ambience active ☕");
        },
      },
    ];

    const taskItems = tasks.slice(0, 8).map((t) => ({
      id: `task-${t.id}`,
      title: `${t.title} (${t.status})`,
      category: "Tasks",
      icon: CheckSquare,
      action: () => {
        navigate(createPageUrl("Dashboard"));
      },
    }));

    const projectItems = projects.slice(0, 5).map((p) => ({
      id: `proj-${p.id}`,
      title: `${p.name} - Project`,
      category: "Projects",
      icon: FolderDot,
      action: () => {
        navigate(createPageUrl("DeveloperMatrix"));
      },
    }));

    return [...navItems, ...actionItems, ...taskItems, ...projectItems];
  }, [tasks, projects, navigate, onOpenQuickCapture, startFocus]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside command palette
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, filtered, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="relative w-full max-w-xl bg-white rounded-3xl border border-[#6F4E37]/20 shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#6F4E37]/10 bg-[#FFF8E7]/30">
              <Search className="w-5 h-5 text-[#6F4E37]" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command, task, project, or quick action..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-[#2E2E2E] placeholder-[#7A6F62]/60 text-sm font-medium focus:outline-none"
              />
              <span className="px-2 py-0.5 text-[10px] font-mono bg-[#6F4E37]/10 text-[#6F4E37] rounded-md font-bold">
                ESC
              </span>
            </div>

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#6F4E37]/5">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#7A6F62]">
                  No matching results found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#6F4E37] text-white"
                          : "hover:bg-[#FFF8E7] text-[#2E2E2E]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[#6F4E37]/10 text-[#6F4E37]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{item.title}</p>
                          <p
                            className={`text-[10px] font-medium ${
                              isSelected ? "text-white/70" : "text-[#7A6F62]"
                            }`}
                          >
                            {item.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.shortcut && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-[#6F4E37]/5 text-[#6F4E37]"
                            }`}
                          >
                            {item.shortcut}
                          </span>
                        )}
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-white/80" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 bg-[#FFF8E7]/50 border-t border-[#6F4E37]/10 flex items-center justify-between text-[11px] text-[#7A6F62]">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Dismiss</span>
              </div>
              <div className="flex items-center gap-1 text-[#6F4E37] font-semibold">
                <Sparkles className="w-3 h-3 text-[#D4A017]" />
                <span>CreamFlow Command</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default CommandPalette;
