import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import {
  Command,
  Plus,
  Clock,
  Briefcase,
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { audioService } from "@/lib/AudioService";
import { toast } from "sonner";

interface FloatingDockProps {
  onOpenCommand: () => void;
  onOpenQuickCapture: (tab?: "task" | "project" | "goal" | "habit" | "learning") => void;
}

function DockIcon({
  mouseX,
  icon: Icon,
  label,
  shortcut,
  onClick,
  active = false,
}: {
  mouseX: any;
  icon: any;
  label: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [42, 58, 42]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-2xl cursor-pointer transition-colors shadow-md ${
        active
          ? "bg-[#6F4E37] text-white"
          : "bg-white/90 text-[#6F4E37] hover:bg-white border border-[#6F4E37]/15"
      }`}
    >
      <Icon className="w-5 h-5 pointer-events-none" />

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -45, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#2E2E2E] text-[#FFF8E7] text-[11px] font-sans font-medium rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5 border border-white/10"
          >
            <span>{label}</span>
            {shortcut && (
              <span className="px-1 py-0.2 bg-white/20 rounded text-[9px] font-mono">
                {shortcut}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  onOpenCommand,
  onOpenQuickCapture,
}) => {
  const mouseX = useMotionValue(Infinity);
  const navigate = useNavigate();
  const [ambientActive, setAmbientActive] = useState(false);

  const toggleAmbientSound = () => {
    if (ambientActive) {
      audioService.stopAmbient();
      setAmbientActive(false);
      toast.info("Ambient sound paused");
    } else {
      audioService.startAmbient("cafe", 0.4);
      setAmbientActive(true);
      toast.success("Warm Cafe ambience active ☕");
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:block">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex items-end gap-3 px-4 py-3 rounded-3xl bg-white/80 backdrop-blur-xl border border-[#6F4E37]/20 shadow-2xl"
      >
        <DockIcon
          mouseX={mouseX}
          icon={LayoutDashboard}
          label="Dashboard"
          onClick={() => navigate(createPageUrl("Dashboard"))}
        />
        <DockIcon
          mouseX={mouseX}
          icon={Clock}
          label="Focus Chamber"
          onClick={() => navigate(createPageUrl("DailyFocus"))}
        />
        <DockIcon
          mouseX={mouseX}
          icon={Briefcase}
          label="Developer Matrix"
          onClick={() => navigate(createPageUrl("DeveloperMatrix"))}
        />
        <DockIcon
          mouseX={mouseX}
          icon={BookOpen}
          label="Mind Vault"
          onClick={() => navigate(createPageUrl("Journal"))}
        />

        <div className="w-[1px] h-8 bg-[#6F4E37]/20 my-auto mx-1" />

        <DockIcon
          mouseX={mouseX}
          icon={Plus}
          label="Quick Capture"
          shortcut="C"
          onClick={() => onOpenQuickCapture("task")}
        />
        <DockIcon
          mouseX={mouseX}
          icon={Command}
          label="Command Palette"
          shortcut="⌘K"
          onClick={onOpenCommand}
        />
        <DockIcon
          mouseX={mouseX}
          icon={ambientActive ? Volume2 : VolumeX}
          label={ambientActive ? "Ambient Sound Playing" : "Cafe Ambience"}
          active={ambientActive}
          onClick={toggleAmbientSound}
        />
      </motion.div>
    </div>
  );
};
