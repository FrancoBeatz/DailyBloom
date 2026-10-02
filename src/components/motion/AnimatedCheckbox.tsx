import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: number;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  triggerConfetti?: boolean;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onChange,
  size = 20,
  label,
  disabled = false,
  className = "",
  triggerConfetti = true,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const nextState = !checked;
    onChange(nextState);

    if (nextState && triggerConfetti) {
      // Fire subtle luxury coffee & gold confetti burst from click position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 18,
        spread: 45,
        origin: { x, y },
        colors: ["#6F4E37", "#D4A017", "#FFF8E7", "#A67C52"],
        ticks: 120,
        gravity: 1.2,
        scalar: 0.6,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}
    >
      <motion.div
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.08 }}
        animate={{
          backgroundColor: checked ? "#6F4E37" : "#FFFFFF",
          borderColor: checked ? "#6F4E37" : "rgba(111, 78, 55, 0.25)",
        }}
        transition={{ duration: 0.2 }}
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-lg border shadow-xs overflow-hidden"
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              width={size * 0.7}
              height={size * 0.7}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFF8E7"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                d="M20 6L9 17l-5-5"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
      {label && <div className="text-xs font-medium">{label}</div>}
    </div>
  );
};
