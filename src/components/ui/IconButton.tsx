import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

const sizes = {
  sm: "h-7 w-7 rounded-lg text-xs",
  md: "h-9 w-9 rounded-lg text-sm",
};

export function IconButton({ size = "md", className, children, ...rest }: Props) {
  return (
    <button
      className={`press grid shrink-0 place-items-center border border-line bg-panel text-muted transition-colors hover:border-accent hover:text-accent ${sizes[size]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
