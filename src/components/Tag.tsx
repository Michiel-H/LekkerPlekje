import { type ComponentProps } from "react";

interface TagProps extends ComponentProps<"button"> {
  emoji: string;
  label: string;
  selected?: boolean;
  variant?: "default" | "vote-up" | "vote-down";
  count?: number;
}

export default function Tag({
  emoji,
  label,
  selected = false,
  variant = "default",
  count,
  className = "",
  ...props
}: TagProps) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all cursor-pointer";

  const variants = {
    default: selected
      ? "bg-groen text-white"
      : "bg-groen/10 text-groen hover:bg-groen/20",
    "vote-up": selected
      ? "bg-frisgroen text-white"
      : "bg-frisgroen/10 text-frisgroen hover:bg-frisgroen/20",
    "vote-down": selected
      ? "bg-koraal text-white"
      : "bg-koraal/10 text-koraal hover:bg-koraal/20",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      <span>{emoji}</span>
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-0.5 text-xs opacity-70">{count}</span>
      )}
    </button>
  );
}
