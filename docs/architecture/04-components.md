# Components: Building and Registering

This document covers the component system - how components are registered, built, and used in the SDUI framework.

## Table of Contents

1. [Component Registry](#component-registry)
2. [Built-in Components](#built-in-components)
3. [Creating New Components](#creating-new-components)
4. [Component Props Pattern](#component-props-pattern)
5. [Layout Components](#layout-components)
6. [Form Components](#form-components)
7. [Domain-Specific Components](#domain-specific-components)
8. [Component Best Practices](#component-best-practices)
9. [Exercises](#exercises)

---

## Component Registry

**File:** `src/lib/sdui/component-registry.tsx`

The registry maps string type names to React components:

```typescript
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
  // ...

  // Input
  input: Input,
  select: Select,
  // ...
};

export function getComponent(type: ComponentType): ReactComponentType | null {
  return componentRegistry[type] || null;
}
```

### How It Works

1. Schema defines `type: "button"`
2. Renderer calls `getComponent("button")`
3. Registry returns the `Button` component
4. Renderer renders `<Button {...props} />`

### Adding to the Registry

To add a new component:

1. Create the component in `src/components/ui/`
2. Import it in `component-registry.tsx`
3. Add to the registry object
4. Add the type to `src/types/sdui.ts`

```typescript
// 1. Create src/components/ui/my-component.tsx
export function MyComponent({ title, children }: MyComponentProps) {
  return <div>{title}{children}</div>;
}

// 2. Import in component-registry.tsx
import { MyComponent } from "@/components/ui/my-component";

// 3. Add to registry
export const componentRegistry = {
  // ...existing
  myComponent: MyComponent,
};

// 4. Add type to sdui.ts
export const ComponentTypeSchema = z.enum([
  // ...existing
  "myComponent",
]);
```

---

## Built-in Components

### Layout Components

| Type | Component | Purpose |
|------|-----------|---------|
| `container` | Container | Wrapper with max-width and padding |
| `grid` | Grid | CSS Grid layout |
| `flex` | Flex | Flexbox layout |
| `stack` | Stack | Vertical flex with gap |
| `spacer` | Spacer | Empty space |
| `divider` | Divider | Horizontal/vertical line |

### Data Display

| Type | Component | Purpose |
|------|-----------|---------|
| `text` | Text | Paragraph text |
| `heading` | Heading | h1-h6 headings |
| `card` | Card | Card container |
| `image` | Image | Image display |
| `avatar` | Avatar | User avatar |
| `badge` | Badge | Status badge |
| `kpi` | KPI | Key performance indicator |
| `list` | List | Ordered/unordered list |
| `listItem` | ListItem | List item |

### Input Components

| Type | Component | Purpose |
|------|-----------|---------|
| `input` | Input | Text input |
| `textarea` | Input | Multi-line text |
| `select` | Select | Dropdown select |
| `checkbox` | Checkbox | Checkbox input |
| `switch` | Switch | Toggle switch |
| `otp` | OTPInput | OTP code input |

### Navigation

| Type | Component | Purpose |
|------|-----------|---------|
| `button` | Button | Clickable button |
| `link` | Link | Hyperlink |
| `tabs` | Tabs | Tab navigation |
| `stepper` | Stepper | Step indicator |

### Feedback

| Type | Component | Purpose |
|------|-----------|---------|
| `alert` | Alert | Alert message |
| `progress` | Progress | Progress bar |
| `spinner` | Spinner | Loading indicator |

### Domain-Specific

| Type | Component | Purpose |
|------|-----------|---------|
| `usageWidget` | UsageWidget | Telecom usage display |
| `planCard` | PlanCard | Plan information card |
| `welcomeSlide` | WelcomeSlide | Onboarding slide |

---

## Creating New Components

### Step 1: Define the Component

Create `src/components/ui/info-banner.tsx`:

```typescript
import { cn } from "@/lib/utils/cn";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface InfoBannerProps {
  variant?: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const styles = {
  info: "bg-blue-50 border-blue-200 text-blue-900",
  success: "bg-green-50 border-green-200 text-green-900",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  error: "bg-red-50 border-red-200 text-red-900",
};

export function InfoBanner({
  variant = "info",
  title,
  description,
  children,
  className,
  dismissible = false,
  onDismiss,
}: InfoBannerProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        styles[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        {description && (
          <p className="mt-1 text-sm opacity-90">{description}</p>
        )}
        {children}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-50 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
```

### Step 2: Export from Index

Edit `src/components/ui/index.ts`:

```typescript
// ... existing exports
export { InfoBanner } from "./info-banner";
```

### Step 3: Register the Component

Edit `src/lib/sdui/component-registry.tsx`:

```typescript
import { InfoBanner } from "@/components/ui";

export const componentRegistry: ComponentRegistry = {
  // ... existing
  infoBanner: InfoBanner,
};
```

### Step 4: Add Type Definition

Edit `src/types/sdui.ts`:

```typescript
export const ComponentTypeSchema = z.enum([
  // ... existing
  "infoBanner",
]);
```

### Step 5: Use in Schema

```typescript
{
  id: "welcome-banner",
  type: "infoBanner",
  props: {
    variant: "info",
    title: "Welcome, {{user.firstName}}!",
    description: "Your account is now active."
  }
}
```

---

## Component Props Pattern

### Standard Props

All components should accept these standard props:

```typescript
interface StandardProps {
  className?: string;    // Additional CSS classes
  style?: CSSProperties; // Inline styles
  children?: ReactNode;  // Child content
}
```

### Props Flow

When the renderer processes a component node:

```typescript
// Schema
{
  id: "my-button",
  type: "button",
  props: {
    text: "Click me",
    variant: "primary"
  },
  className: "mt-4",
  style: { minWidth: "200px" }
}

// Becomes
<Button
  text="Click me"
  variant="primary"
  className="mt-4"
  style={{ minWidth: "200px" }}
/>
```

### Handling Events

The renderer adds event handlers from actions:

```typescript
// Schema
{
  type: "button",
  props: { text: "Submit" },
  actions: [
    { trigger: "click", type: "submit" }
  ]
}

// Becomes
<Button
  text="Submit"
  onClick={handleClick}  // Added by renderer
/>
```

Your component just needs to accept standard React event props:

```typescript
interface ButtonProps {
  text: string;
  onClick?: () => void;  // Standard React prop
  // ...
}
```

### Children vs Content Props

Components can receive content two ways:

**1. Via props:**
```typescript
// Schema
{ type: "text", props: { text: "Hello" } }

// Component
function Text({ text }) {
  return <p>{text}</p>;
}
```

**2. Via children:**
```typescript
// Schema
{
  type: "card",
  children: [
    { type: "heading", props: { text: "Title" } }
  ]
}

// Component
function Card({ children }) {
  return <div className="card">{children}</div>;
}
```

The renderer handles both - it renders child nodes recursively and passes them as `children`.

---

## Layout Components

### Container

A wrapper with max-width and padding options:

```typescript
interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

function Container({ children, className, maxWidth = "xl", padding = "md" }: ContainerProps) {
  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  const paddings = {
    none: "",
    sm: "px-3 py-3",
    md: "px-4 py-5",
    lg: "px-6 py-8",
  };

  return (
    <div className={cn("mx-auto w-full", maxWidths[maxWidth], paddings[padding], className)}>
      {children}
    </div>
  );
}
```

**Usage:**
```typescript
{
  type: "container",
  props: { maxWidth: "lg", padding: "lg" },
  children: [...]
}
```

### Grid

CSS Grid with responsive columns:

```typescript
interface GridProps {
  children?: React.ReactNode;
  className?: string;
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | string;
}

function Grid({ children, className, columns = 12, gap = 6 }: GridProps) {
  // Handle responsive columns
  const getColumnsClass = () => {
    if (typeof columns === "number") {
      return `grid-cols-${columns}`;
    }
    return cn(
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`
    );
  };

  return (
    <div
      className={cn("grid", getColumnsClass(), className)}
      style={{ gap: typeof gap === "number" ? `${gap * 0.25}rem` : gap }}
    >
      {children}
    </div>
  );
}
```

**Usage:**
```typescript
{
  type: "grid",
  props: {
    columns: { sm: 1, md: 2, lg: 3 },
    gap: 6
  },
  children: [...]
}
```

### Flex

Flexbox layout component:

```typescript
interface FlexProps {
  children?: React.ReactNode;
  className?: string;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: number | string;
  wrap?: boolean;
}
```

**Usage:**
```typescript
{
  type: "flex",
  props: {
    direction: "row",
    align: "center",
    justify: "between",
    gap: 4
  },
  children: [...]
}
```

### Stack

Vertical stack (shorthand for flex-col):

```typescript
{
  type: "stack",
  props: { gap: 4, align: "stretch" },
  children: [...]
}
```

---

## Form Components

Form components get special handling from the renderer.

### Automatic Form State Wiring

When the renderer sees an input component (`input`, `select`, `checkbox`, etc.), it automatically:

1. Reads value from `formState.values[fieldName]`
2. Wires `onChange` to update form state
3. Passes error from `formState.errors[fieldName]`

```typescript
// In renderer.tsx
const inputProps = useMemo(() => {
  const isInput = ["input", "textarea", "select", "checkbox", "switch", "otp"].includes(node.type);
  if (!isInput) return {};

  const fieldName = (node.props?.name as string) || node.id;
  return {
    value: formState.values[fieldName] ?? "",
    error: formState.errors[fieldName],
    onChange: (e) => {
      const value = typeof e === "string" ? e : e.target?.value;
      setFormValue(fieldName, value);
    },
  };
}, [...]);
```

### Input Component

```typescript
interface InputProps {
  name?: string;
  type?: "text" | "email" | "password" | "tel" | "number";
  placeholder?: string;
  label?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Input({
  name,
  type = "text",
  placeholder,
  label,
  error,
  value,
  onChange,
  required,
  disabled,
  className,
}: InputProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border px-3 py-2",
          error ? "border-red-500" : "border-slate-300",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500"
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

**Schema Usage:**
```typescript
{
  id: "email-input",
  type: "input",
  props: {
    name: "email",
    type: "email",
    label: "Email Address",
    placeholder: "you@example.com",
    required: true
  }
}
```

### Select Component

```typescript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  name?: string;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export function Select({
  name,
  options,
  placeholder,
  label,
  error,
  value,
  onChange,
  className,
}: SelectProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full rounded-lg border px-3 py-2",
          error ? "border-red-500" : "border-slate-300"
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

**Schema Usage:**
```typescript
{
  id: "country-select",
  type: "select",
  props: {
    name: "country",
    label: "Country",
    placeholder: "Select a country",
    options: [
      { value: "us", label: "United States" },
      { value: "uk", label: "United Kingdom" },
      { value: "ca", label: "Canada" }
    ]
  }
}
```

---

## Domain-Specific Components

These components are specific to the telecom self-care domain.

### UsageWidget

Displays data/voice/SMS usage:

```typescript
interface UsageItem {
  type: "data" | "voice" | "sms";
  used: number;
  total: number;
  unit: string;
  label: string;
}

interface UsageWidgetProps {
  title?: string;
  items: UsageItem[];
  className?: string;
}

export function UsageWidget({ title = "Your Usage", items, className }: UsageWidgetProps) {
  return (
    <div className={cn("rounded-xl bg-white border border-slate-200 p-6", className)}>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item) => {
          const percentage = (item.used / item.total) * 100;
          return (
            <div key={item.type}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-medium">
                  {item.used} / {item.total} {item.unit}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Schema Usage:**
```typescript
{
  type: "usageWidget",
  props: {
    title: "Your Usage",
    items: [
      {
        type: "data",
        used: "{{user.usage.data.used}}",
        total: "{{user.usage.data.total}}",
        unit: "{{user.usage.data.unit}}",
        label: "Mobile Data"
      },
      // ...
    ]
  }
}
```

### PlanCard

Displays plan information:

```typescript
interface PlanCardProps {
  name: string;
  price: number;
  period?: string;
  features: string[];
  recommended?: boolean;
  current?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function PlanCard({
  name,
  price,
  period = "month",
  features,
  recommended,
  current,
  onSelect,
  className,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6",
        recommended && "border-indigo-500 ring-2 ring-indigo-500",
        !recommended && "border-slate-200",
        className
      )}
    >
      {recommended && (
        <span className="text-xs font-medium text-indigo-600 uppercase">
          Recommended
        </span>
      )}
      <h3 className="text-xl font-bold mt-2">{name}</h3>
      <div className="mt-2">
        <span className="text-3xl font-bold">${price}</span>
        <span className="text-slate-500">/{period}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <CheckIcon className="h-4 w-4 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        disabled={current}
        className={cn(
          "mt-6 w-full py-2 rounded-lg font-medium",
          current
            ? "bg-slate-100 text-slate-500"
            : "bg-indigo-500 text-white hover:bg-indigo-600"
        )}
      >
        {current ? "Current Plan" : "Select Plan"}
      </button>
    </div>
  );
}
```

---

## Component Best Practices

### 1. Accept Standard Props

Always accept `className` and `style`:

```typescript
interface MyComponentProps {
  // ... specific props
  className?: string;
  style?: React.CSSProperties;
}
```

### 2. Use the cn Utility

The `cn` utility merges class names safely:

```typescript
import { cn } from "@/lib/utils/cn";

// Good
className={cn("base-classes", variant && variantClasses[variant], className)}

// Avoid
className={`base-classes ${variant ? variantClasses[variant] : ''} ${className || ''}`}
```

### 3. Handle Missing Props Gracefully

```typescript
// Good
const { title = "Default Title", items = [] } = props;

// Avoid assuming props exist
items.map(...)  // Might crash if undefined
```

### 4. Type Your Props

```typescript
// Define interface
interface CardProps {
  title: string;
  description?: string;
  variant?: "default" | "elevated";
  children?: React.ReactNode;
  className?: string;
}

// Use in component
export function Card({ title, description, variant = "default", children, className }: CardProps) {
  // ...
}
```

### 5. Support Children

Container components should render `children`:

```typescript
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      {children}
    </div>
  );
}
```

### 6. Document with JSDoc

```typescript
/**
 * A card component for displaying content in a contained area.
 *
 * @example
 * <Card variant="elevated" title="Hello">
 *   Content here
 * </Card>
 */
export function Card({ variant = "default", ...props }: CardProps) {
  // ...
}
```

---

## Exercises

### Exercise 1: Create a Stats Card

Create a `StatsCard` component that shows a metric with change indicator:

```typescript
interface StatsCardProps {
  label: string;
  value: string | number;
  change?: number;  // Percentage change
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}
```

**Features:**
- Shows positive/negative change with colors
- Optional icon
- Formatted value

**Usage:**
```typescript
{
  type: "statsCard",
  props: {
    label: "Monthly Revenue",
    value: "{{stats.revenue|currency}}",
    change: 12.5,
    changeLabel: "vs last month"
  }
}
```

### Exercise 2: Create a Timeline

Create a `Timeline` component for showing events:

```typescript
interface TimelineItem {
  date: string;
  title: string;
  description?: string;
  status?: "completed" | "current" | "upcoming";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}
```

### Exercise 3: Create a Dynamic Table

Create a `DataTable` component:

```typescript
interface Column {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  className?: string;
}
```

### Exercise 4: Add Validation Display

Enhance the `Input` component to show validation state:

- Green checkmark when valid
- Red X when invalid
- Yellow warning for hints

---

## Next Steps

- **[API Layer](./05-api-layer.md)** - Backend routes and database
- **[State Management](./06-state-management.md)** - Zustand store patterns
