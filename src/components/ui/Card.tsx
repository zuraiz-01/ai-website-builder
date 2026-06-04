import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline";
  hover?: boolean;
  children: ReactNode;
}

export default function Card({
  variant = "default",
  hover = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  const variants = {
    default: "glass",
    elevated:
      "glass shadow-2xl shadow-violet-500/10",
    outline: "border border-white/10 bg-transparent",
  };
  return (
    <div
      {...rest}
      className={[
        "rounded-2xl",
        variants[variant],
        hover ? "card-hover" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
