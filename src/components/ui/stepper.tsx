"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

export interface Step {
  id: string;
  title: string;
  description?: string;
}

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: Step[];
  currentStep: number;
  variant?: "horizontal" | "vertical";
}

const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({ className, steps, currentStep, variant = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          variant === "horizontal" ? "flex items-center" : "flex flex-col",
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className={cn(
                variant === "horizontal" ? "flex items-center flex-1" : "flex items-start",
                isLast && variant === "horizontal" && "flex-none"
              )}
            >
              <div className={cn("flex items-center", variant === "vertical" && "flex-col")}>
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
                    isCompleted
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                      : isCurrent
                        ? "border-2 border-indigo-500 bg-white text-indigo-600"
                        : "border-2 border-slate-200 bg-white text-slate-400"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <div
                  className={cn(
                    variant === "horizontal" ? "ml-3" : "mt-2 text-center",
                    variant === "vertical" && "pb-8"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent || isCompleted
                        ? "text-slate-900"
                        : "text-slate-400"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    variant === "horizontal"
                      ? "mx-4 h-0.5 flex-1 min-w-8"
                      : "ml-5 h-8 w-0.5",
                    isCompleted ? "bg-indigo-500" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

Stepper.displayName = "Stepper";

export { Stepper };
