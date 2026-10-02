import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = "",
  strength = 0.25,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 350, damping: 25, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * strength);
    y.set(middleY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center transition-shadow ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};

export const ShimmerText: React.FC<{
  text: string;
  className?: string;
  shimmerColor?: string;
}> = ({ text, className = "", shimmerColor = "rgba(212, 160, 23, 0.4)" }) => {
  return (
    <span
      className={`relative inline-block bg-[linear-gradient(110deg,#6F4E37,45%,#D4A017,55%,#6F4E37)] bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_3s_infinite_linear] ${className}`}
      style={{
        backgroundImage: `linear-gradient(110deg, #6F4E37 40%, #D4A017 50%, #6F4E37 60%)`,
      }}
    >
      {text}
    </span>
  );
};
