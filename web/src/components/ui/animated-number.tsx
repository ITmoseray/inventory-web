"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const spring = useSpring(0, { bounce: 0, duration: 1500 });
  
  const display = useTransform(spring, (current) => 
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    setHasMounted(true);
    spring.set(value);
  }, [spring, value]);

  if (!hasMounted) {
    return <span className={className}>{value.toLocaleString()}</span>;
  }

  return <motion.span className={className}>{display}</motion.span>;
}
