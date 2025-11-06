import * as React from "react";

export const Avatar = ({ className = "", children }: any) => (
  <div className={`relative inline-flex items-center justify-center rounded-full bg-muted ${className}`}>
    {children}
  </div>
);

export const AvatarImage = ({ src, alt }: { src?: string; alt?: string }) => (
  <img src={src || "/default-avatar.png"} alt={alt} className="rounded-full object-cover w-full h-full" />
);

export const AvatarFallback = ({ children }: any) => (
  <span className="text-muted-foreground">{children}</span>
);
