import React from "react";
import { motion } from "framer-motion";

interface SoundWaveVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  className?: string;
  color?: string;
}

export const SoundWaveVisualizer: React.FC<SoundWaveVisualizerProps> = ({
  isPlaying,
  barCount = 12,
  height = 24,
  className = "",
  color = "#6F4E37",
}) => {
  return (
    <div className={`flex items-center gap-1 h-${height} ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.span
          key={i}
          animate={
            isPlaying
              ? {
                  height: [
                    "20%",
                    `${Math.max(25, (Math.sin(i * 1.5) * 45 + 50))}%`,
                    `${Math.max(15, (Math.cos(i * 2.1) * 40 + 60))}%`,
                    "20%",
                  ],
                }
              : { height: "20%" }
          }
          transition={
            isPlaying
              ? {
                  repeat: Infinity,
                  duration: 0.8 + (i % 5) * 0.15,
                  ease: "easeInOut",
                  delay: i * 0.06,
                }
              : { duration: 0.3 }
          }
          style={{ backgroundColor: color }}
          className="w-1 rounded-full min-h-[4px]"
        />
      ))}
    </div>
  );
};

export const BreathingCircle: React.FC<{
  phase: "Inhale" | "Hold" | "Exhale" | "Ready";
  progress?: number;
  size?: number;
}> = ({ phase, size = 180 }) => {
  const getScale = () => {
    switch (phase) {
      case "Inhale":
        return 1.25;
      case "Hold":
        return 1.25;
      case "Exhale":
        return 0.85;
      default:
        return 1;
    }
  };

  return (
    <div
      className="relative flex items-center justify-center mx-auto"
      style={{ width: size, height: size }}
    >
      {/* Outer Glow Ring */}
      <motion.div
        animate={{
          scale: getScale(),
          opacity: phase === "Inhale" || phase === "Hold" ? 0.35 : 0.15,
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-radial from-[#D4A017] to-transparent blur-xl pointer-events-none"
      />

      {/* Pulsing Ripple Circle */}
      <motion.div
        animate={{
          scale: getScale(),
          borderColor: phase === "Hold" ? "#D4A017" : "#6F4E37",
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="absolute inset-4 rounded-full border-2 border-dashed border-[#6F4E37]/30"
      />

      {/* Inner Core */}
      <motion.div
        animate={{ scale: getScale() }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6F4E37] to-[#A67C52] shadow-xl flex flex-col items-center justify-center text-white text-center p-2"
      >
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFF8E7]/70">
          Focus
        </span>
        <span className="text-xs font-serif font-bold text-[#FFF8E7] mt-0.5">
          {phase}
        </span>
      </motion.div>
    </div>
  );
};
