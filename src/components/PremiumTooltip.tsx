import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
  children: React.ReactNode;
  content: {
    title: string;
    description: string;
    bestPractice?: string;
  };
  position?: "top" | "bottom" | "left" | "right";
  key?: any;
}

export default function PremiumTooltip({ children, content, position = "top" }: TooltipProps) {
  const [active, setHovered] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="inline-block relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === "top" ? 4 : position === "bottom" ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-[9999] w-64 p-3 bg-white text-[#2E2E2E] rounded-xl border border-[#6F4E37]/15 shadow-xl pointer-events-none text-left font-sans ${positionClasses[position]}`}
          >
            <div className="text-xs font-bold text-[#6F4E37] flex items-center gap-1">
              <span>☕</span> {content.title}
            </div>
            <p className="text-[11px] text-[#2E2E2E] mt-1 font-medium leading-relaxed">
              {content.description}
            </p>
            {content.bestPractice && (
              <div className="mt-1.5 pt-1.5 border-t border-[#6F4E37]/10 text-[9px] text-[#D4A017] font-mono font-semibold">
                ✨ Best Practice: {content.bestPractice}
              </div>
            )}
            
            {/* Tiny Arrow */}
            <div
              className={`absolute w-1.5 h-1.5 bg-white border-b border-r border-[#6F4E37]/15 rotate-45 ${
                position === "top"
                  ? "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0"
                  : position === "bottom"
                  ? "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-0 border-r-0 border-t border-l"
                  : position === "left"
                  ? "left-full top-1/2 -translate-y-1/2 -ml-1 border-b-0 border-l-0 border-t border-r"
                  : "right-full top-1/2 -translate-y-1/2 -mr-1 border-t-0 border-r-0 border-b border-l"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
