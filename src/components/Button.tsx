import { type ComponentProps } from "react";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-spritz/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-spritz text-white hover:bg-spritz-hover",
    secondary:
      "bg-espresso text-creme hover:bg-espresso-light",
    ghost:
      "bg-transparent text-espresso hover:bg-espresso/5 border border-espresso/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
