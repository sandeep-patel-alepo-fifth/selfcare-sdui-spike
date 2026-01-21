"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface WelcomeSlideProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  image?: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
}

const WelcomeSlide = forwardRef<HTMLDivElement, WelcomeSlideProps>(
  (
    {
      className,
      title,
      description,
      image,
      icon,
      backgroundColor,
      textColor = "white",
      ...props
    },
    ref
  ) => {
    // Default to a gradient background if none specified
    const defaultBg = !backgroundColor;

    return (
      <div
        ref={ref}
        className={cn(
          "flex min-h-[400px] flex-col items-center justify-center p-8 text-center rounded-xl",
          defaultBg && "bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600",
          className
        )}
        style={{
          ...(backgroundColor ? { backgroundColor } : {}),
          color: textColor
        }}
        {...props}
      >
        {image && (
          <div className="mb-8 h-48 w-48 overflow-hidden rounded-full shadow-xl ring-4 ring-white/20">
            <img src={image} alt={title} className="h-full w-full object-cover" />
          </div>
        )}
        {icon && !image && (
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-lg">
            {icon}
          </div>
        )}
        <h2 className="mb-4 text-3xl font-bold tracking-tight">{title}</h2>
        <p className="max-w-md text-lg opacity-90 leading-relaxed">{description}</p>
      </div>
    );
  }
);

WelcomeSlide.displayName = "WelcomeSlide";

export { WelcomeSlide };
