import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

const sizes = {
  sm: "h-9 w-9 rounded-xl text-xs",
  md: "h-10 w-10 rounded-xl text-sm",
};

export function IconButton({ size = "md", className, children, ...rest }: Props) {
  return (
    <button
      className={`press grid shrink-0 place-items-center border border-line bg-panel text-muted shadow-warm transition-colors hover:border-accent hover:text-accent ${sizes[size]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}