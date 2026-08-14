"use client";

import { motion, useReducedMotion } from "framer-motion";

interface Props {
  label?: string;
  size?: number;
  className?: string;
}

export function HankoStamp({ label = "印", size = 40, className }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={reduce ? false : { scale: 1.9, opacity: 0, rotate: -16 }}
      animate={{ scale: 1, opacity: 1, rotate: -5 }}
      transition={{ type: "spring", stiffness: 340, damping: 17, mass: 0.9 }}
      className={`hanko text-accent ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden
    >
      {label}
    </motion.span>
  );
}