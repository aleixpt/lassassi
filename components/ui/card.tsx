import { FC, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: FC<CardProps> = ({ children, className }) => (
  <div className={`bg-black/20 rounded-xl p-4 shadow-md ${className || ""}`}>{children}</div>
);

export const CardHeader: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`mb-2 ${className || ""}`}>{children}</div>
);

export const CardContent: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`${className || ""}`}>{children}</div>
);

export const CardTitle: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={`text-lg font-bold ${className || ""}`}>{children}</h3>
);

export const CardDescription: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <p className={`text-sm text-gray-400 ${className || ""}`}>{children}</p>
);
