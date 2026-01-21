"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Check, Star } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  period?: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  buttonText?: string;
  disabled?: boolean;
}

const PlanCard = forwardRef<HTMLDivElement, PlanCardProps>(
  (
    {
      className,
      name,
      description,
      price,
      currency = "$",
      period = "/month",
      features,
      isPopular = false,
      isSelected = false,
      onSelect,
      buttonText = "Select Plan",
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col rounded-xl sm:rounded-2xl border-2 bg-white p-4 sm:p-6 transition-all duration-200",
          isSelected
            ? "border-indigo-500 shadow-xl shadow-indigo-500/10"
            : "border-slate-200 hover:border-indigo-300 hover:shadow-lg",
          isPopular && "ring-2 ring-indigo-500 ring-offset-2",
          className
        )}
        {...props}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="default" className="flex items-center gap-1 shadow-md">
              <Star className="h-3 w-3 fill-current" />
              Most Popular
            </Badge>
          </div>
        )}

        <div className="mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">{name}</h3>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>

        <div className="mb-4 sm:mb-6">
          <span className="text-3xl sm:text-4xl font-bold text-slate-900">
            {currency}
            {price}
          </span>
          <span className="text-sm sm:text-base text-slate-400">{period}</span>
        </div>

        <ul className="mb-4 sm:mb-6 flex-1 space-y-2 sm:space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 sm:gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full",
                  feature.included
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-100 text-slate-300"
                )}
              >
                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </div>
              <span
                className={cn(
                  "text-xs sm:text-sm",
                  feature.included
                    ? "text-slate-700"
                    : "text-slate-400 line-through"
                )}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        <Button
          variant={isSelected ? "primary" : "outline"}
          className="w-full"
          onClick={onSelect}
          disabled={disabled}
        >
          {isSelected ? "Selected" : buttonText}
        </Button>
      </div>
    );
  }
);

PlanCard.displayName = "PlanCard";

export { PlanCard };
