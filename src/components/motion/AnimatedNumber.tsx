import React, { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className = "",
  format = (n) => Math.round(n).toLocaleString(),
}) => {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    stiffness: 100,
    damping: 20,
    mass: 0.8,
  });

  const display = useTransform(springVal, (current) => format(current));

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  return <motion.span className={className}>{display}</motion.span>;
};
