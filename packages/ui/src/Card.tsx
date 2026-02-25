import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "outlined" | "filled";
}

export function Card({ variant = "elevated", className = "", children, ...props }: CardProps) {
  const base = "rounded-xl p-6 transition-shadow";
  const variants = {
    elevated: "bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-200/50 dark:shadow-black/20",
    outlined: "border border-zinc-200 dark:border-zinc-700 bg-transparent",
    filled: "bg-zinc-50 dark:bg-zinc-800/50",
  };
  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
