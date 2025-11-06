import { FC, ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "secondary";
  className?: string;
}

export const Badge: FC<BadgeProps> = ({ children, variant, className }) => {
  const colors = variant === "secondary" ? "bg-gray-600 text-white" : "bg-green-600 text-white";
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors} ${className || ""}`}>{children}</span>;
};
