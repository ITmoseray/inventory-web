"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedDivProps extends HTMLMotionProps<"div"> {
  animation?: "fade" | "slide-up" | "slide-down" | "scale";
  delay?: number;
}

export function AnimatedDiv({
  children,
  animation = "fade",
  delay = 0,
  className,
  ...props
}: AnimatedDivProps) {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    "slide-up": {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    "slide-down": {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[animation]}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className={cn("w-full h-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
