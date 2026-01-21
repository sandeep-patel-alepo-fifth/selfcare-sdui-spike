"use client";

import type { ComponentType as ReactComponentType } from "react";
import type { ComponentType } from "@/types/sdui";
import { cn } from "@/lib/utils/cn";

// UI Components
import {
  Text,
  Heading,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Avatar,
  KPI,
  Progress,
  Input,
  Select,
  Checkbox,
  Switch,
  OTPInput,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Stepper,
  Alert,
  Spinner,
  UsageWidget,
  PlanCard,
  WelcomeSlide,
} from "@/components/ui";

// ============================================================================
// Layout Components (Built-in)
// ============================================================================

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
  padding?: "none" | "sm" | "md" | "lg";
  centered?: boolean;
}

function Container({ children, className, style, maxWidth, padding, centered }: ContainerProps) {
  const maxWidths: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
    none: "",
  };

  const paddings: Record<string, string> = {
    none: "",
    sm: "px-3 py-3",
    md: "px-4 py-5",
    lg: "px-6 py-8",
  };

  // Only apply layout classes when explicitly specified
  // This prevents nested containers from getting unwanted defaults
  return (
    <div
      className={cn(
        centered && "mx-auto",
        maxWidth && maxWidths[maxWidth],
        padding && paddings[padding],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

interface GridProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | string;
}

function Grid({ children, className, style, columns = 12, gap = 6 }: GridProps) {
  const getColumnsClass = () => {
    if (typeof columns === "number") {
      return `grid-cols-${columns}`;
    }
    // Mobile-first: default to 1 column, then apply responsive breakpoints
    return cn(
      "grid-cols-1",
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`
    );
  };

  const gapValue = typeof gap === "number" && gap > 0 ? `${gap * 0.25}rem` : (typeof gap === "string" ? gap : undefined);

  return (
    <div
      className={cn("grid", getColumnsClass(), !gapValue && "gap-6", className)}
      style={{ ...(gapValue ? { gap: gapValue } : {}), ...style }}
    >
      {children}
    </div>
  );
}

interface FlexProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: number | string;
  wrap?: boolean;
}

function Flex({
  children,
  className,
  style,
  direction = "row",
  align = "stretch",
  justify = "start",
  gap = 4,
  wrap = false,
}: FlexProps) {
  const directions = {
    row: "flex-row",
    column: "flex-col",
    "row-reverse": "flex-row-reverse",
    "column-reverse": "flex-col-reverse",
  };

  const aligns = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  };

  const justifies = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  const gapValue = typeof gap === "number" && gap > 0 ? `${gap * 0.25}rem` : (typeof gap === "string" ? gap : undefined);

  return (
    <div
      className={cn(
        "flex",
        directions[direction],
        aligns[align],
        justifies[justify],
        wrap && "flex-wrap",
        !gapValue && "gap-4",
        className
      )}
      style={{ ...(gapValue ? { gap: gapValue } : {}), ...style }}
    >
      {children}
    </div>
  );
}

interface StackProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  gap?: number | string;
  align?: "start" | "center" | "end" | "stretch";
}

function Stack({ children, className, style, gap = 3, align = "stretch" }: StackProps) {
  const aligns = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const gapValue = typeof gap === "number" && gap > 0 ? `${gap * 0.25}rem` : (typeof gap === "string" ? gap : undefined);

  return (
    <div
      className={cn("flex flex-col", aligns[align], !gapValue && "gap-3", className)}
      style={{ ...(gapValue ? { gap: gapValue } : {}), ...style }}
    >
      {children}
    </div>
  );
}

interface SpacerProps {
  className?: string;
  size?: number | string;
  direction?: "horizontal" | "vertical";
}

function Spacer({ className, size = 4, direction = "vertical" }: SpacerProps) {
  const sizeValue = typeof size === "number" ? `${size * 0.25}rem` : size;

  return (
    <div
      className={className}
      style={
        direction === "vertical"
          ? { height: sizeValue }
          : { width: sizeValue }
      }
    />
  );
}

interface DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  label?: string;
}

function Divider({ className, orientation = "horizontal", label }: DividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-400">{label}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        orientation === "horizontal"
          ? "h-px w-full bg-slate-200"
          : "h-full w-px bg-slate-200",
        className
      )}
    />
  );
}

interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

function Image({
  src,
  alt = "",
  className,
  width,
  height,
  objectFit = "cover",
  rounded = "md",
}: ImageProps) {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const fitClasses = {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  };

  return (
    <img
      src={src}
      alt={alt}
      className={cn(roundedClasses[rounded], fitClasses[objectFit], className)}
      style={{ width, height }}
    />
  );
}

interface LinkProps {
  children?: React.ReactNode;
  className?: string;
  href: string;
  external?: boolean;
  variant?: "default" | "muted" | "primary";
}

function Link({ children, className, href, external = false, variant = "default" }: LinkProps) {
  const variants = {
    default: "text-slate-900 hover:text-indigo-600",
    muted: "text-slate-400 hover:text-slate-600",
    primary: "text-indigo-600 hover:text-indigo-700",
  };

  return (
    <a
      href={href}
      className={cn("underline-offset-4 hover:underline transition-colors", variants[variant], className)}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
    </a>
  );
}

interface ListProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "unordered" | "ordered" | "none";
}

function List({ children, className, variant = "none" }: ListProps) {
  const Tag = variant === "ordered" ? "ol" : "ul";
  const variantClasses = {
    unordered: "list-disc list-inside",
    ordered: "list-decimal list-inside",
    none: "",
  };

  return (
    <Tag className={cn("space-y-2", variantClasses[variant], className)}>{children}</Tag>
  );
}

interface ListItemProps {
  children?: React.ReactNode;
  className?: string;
}

function ListItem({ children, className }: ListItemProps) {
  return <li className={cn("text-slate-900", className)}>{children}</li>;
}

// ============================================================================
// Chart Component (using Recharts)
// ============================================================================

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface ChartProps {
  className?: string;
  type?: "line" | "bar" | "pie" | "area";
  data: ChartDataPoint[];
  height?: number;
  title?: string;
}

function Chart({ className, type = "bar", data, height = 300, title }: ChartProps) {
  // Lazy import recharts only when needed
  return (
    <div className={cn("w-full", className)}>
      {title && (
        <h4 className="mb-4 text-sm font-medium text-slate-600">{title}</h4>
      )}
      <div
        className="flex items-center justify-center rounded-xl bg-white border border-slate-200 p-4"
        style={{ height }}
      >
        <span className="text-sm text-slate-400">
          Chart: {type} ({data.length} data points)
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Component Registry
// ============================================================================

type ComponentRegistry = Record<ComponentType, ReactComponentType<any>>;

export const componentRegistry: ComponentRegistry = {
  // Layout
  container: Container,
  grid: Grid,
  flex: Flex,
  stack: Stack,
  spacer: Spacer,

  // Data Display
  text: Text,
  heading: Heading,
  card: Card,
  image: Image,
  avatar: Avatar,
  badge: Badge,
  kpi: KPI,
  list: List,
  listItem: ListItem,
  divider: Divider,

  // Input
  input: Input,
  textarea: Input, // Use Input with multiline for now
  select: Select,
  checkbox: Checkbox,
  radio: Checkbox, // Use Checkbox with radio styling
  switch: Switch,
  slider: Input, // Placeholder
  datePicker: Input, // Placeholder
  otp: OTPInput,

  // Navigation
  button: Button,
  link: Link,
  tabs: Tabs,
  stepper: Stepper,
  breadcrumb: Flex, // Placeholder

  // Feedback
  alert: Alert,
  progress: Progress,
  skeleton: Spinner, // Placeholder
  spinner: Spinner,

  // Domain-Specific
  usageWidget: UsageWidget,
  planCard: PlanCard,
  billingCard: Card, // Placeholder
  welcomeSlide: WelcomeSlide,

  // Charts
  chart: Chart,
};

export function getComponent(type: ComponentType): ReactComponentType | null {
  return componentRegistry[type] || null;
}

// Special handling for Tabs sub-components
export const tabsComponents = {
  TabsList,
  TabsTrigger,
  TabsContent,
};

// Special handling for Card sub-components
export const cardComponents = {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
