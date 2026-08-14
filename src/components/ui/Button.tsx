import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-accent text-white shadow-warm hover:bg-accent/90",
  secondary:
    "border border-line bg-panel text-foreground shadow-warm hover:border-accent/60 hover:text-accent",
  ghost: "text-muted hover:text-foreground",
};

const sizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: Props) {
  return (
    <button
      className={`press inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
      {...rest}
    />
  );
}