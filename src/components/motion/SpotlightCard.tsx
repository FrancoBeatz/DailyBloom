import React, { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  tiltEffect?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  spotlightColor = "rgba(212, 160, 23, 0.12)",
  tiltEffect = false,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Tilt springs
  const rotateX = useSpring(0, { stiffness: 300, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 20 });

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    mouseX.set(x);
    mouseY.set(y);

    if (tiltEffect) {
      const centerX = width / 2;
      const centerY = height / 2;
      const rotateXVal = ((y - centerY) / centerY) * -6;
      const rotateYVal = ((x - centerX) / centerX) * 6;
      rotateX.set(rotateXVal);
      rotateY.set(rotateYVal);
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (tiltEffect) {
      rotateX.set(0);
      rotateY.set(0);
    }
  };

  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: tiltEffect ? rotateX : 0,
        rotateY: tiltEffect ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={`relative overflow-hidden rounded-2xl bg-white border border-[#6F4E37]/10 transition-shadow duration-300 hover:shadow-lg hover:border-[#6F4E37]/20 ${className}`}
      {...(props as any)}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background,
          opacity: isHovered ? 1 : 0,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};
