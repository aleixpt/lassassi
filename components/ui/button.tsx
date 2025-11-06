import { FC, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export const Button: FC<ButtonProps> = ({ children, onClick, variant, className }) => {
  let base = "px-4 py-2 rounded font-semibold transition-all";
  let colors = variant === "secondary" ? "bg-gray-600 text-white" : "bg-blue-600 text-white";
  return (
    <button onClick={onClick} className={`${base} ${colors} ${className || ""}`}>
      {children}
    </button>
  );
};

