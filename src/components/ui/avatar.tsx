"use client";

import { forwardRef, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { User } from "lucide-react";

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
  shape?: "circle" | "square";
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", fallback, shape = "circle", src, alt, ...props }, ref) => {
    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };

    const shapes = {
      circle: "rounded-full",
      square: "rounded-lg",
    };

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-200",
          sizes[size],
          shapes[shape],
          className
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="h-full w-full object-cover"
            {...props}
          />
        ) : fallback ? (
          <span className="font-semibold text-indigo-700">
            {getInitials(fallback)}
          </span>
        ) : (
          <User className="h-1/2 w-1/2 text-indigo-500" />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
