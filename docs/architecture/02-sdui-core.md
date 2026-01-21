# SDUI Core: The Rendering Engine

This document provides a deep dive into the SDUI rendering engine - the heart of the framework that transforms JSON schemas into React components.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [The Renderer](#the-renderer)
3. [Data Binding](#data-binding)
4. [Condition Evaluation](#condition-evaluation)
5. [Template String Processing](#template-string-processing)
6. [The Rendering Pipeline](#the-rendering-pipeline)
7. [Performance Considerations](#performance-considerations)
8. [Exercises](#exercises)

---

## Architecture Overview

The SDUI core consists of four main modules:

```
src/lib/sdui/
├── renderer.tsx           # Main rendering engine
├── data-binding.ts        # Template and binding resolution
├── condition-evaluator.ts # Conditional rendering logic
├── action-dispatcher.ts   # Action handling (covered in 03-actions)
├── component-registry.tsx # Component mapping (covered in 04-components)
└── store.ts              # State management (covered in 06-state)
```

### How They Connect

```
                    Screen Schema (JSON)
                           │
                           ▼
                    ┌─────────────┐
                    │  renderer   │
                    │   .tsx      │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│ condition-      │ │ data-       │ │ action-         │
│ evaluator.ts    │ │ binding.ts  │ │ dispatcher.ts   │
└────────┬────────┘ └──────┬──────┘ └────────┬────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ component-      │
                  │ registry.tsx    │
                  └────────┬────────┘
                           │
                           ▼
                    React Components
```

---

## The Renderer

**File:** `src/lib/sdui/renderer.tsx`

The renderer has two main exports:

1. `ScreenRenderer` - Renders a complete screen
2. `DynamicComponent` - Renders a single component node

### ScreenRenderer

```typescript
export function ScreenRenderer({ screen, ...rendererProps }: ScreenRendererProps): ReactNode {
  // Apply layout styles to the root container
  const layoutStyles = useMemo(() => {
    if (!screen.layout) return {};

    const { columns, gap, margin } = screen.layout;
    return {
      display: screen.layout.type === "grid" ? "grid" : "flex",
      gridTemplateColumns: screen.layout.type === "grid" && typeof columns === "number"
        ? `repeat(${columns}, minmax(0, 1fr))`
        : undefined,
      gap: typeof gap === "number" ? `${gap * 0.25}rem` : gap,
      // ... more layout calculations
    };
  }, [screen.layout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={layoutStyles}>
        {screen.components.map((component) => (
          <DynamicComponent
            key={component.id}
            node={component}
            rendererProps={rendererProps}
          />
        ))}
      </div>
    </div>
  );
}
```

**Key Points:**
- `ScreenRenderer` is the entry point
- It calculates layout styles from the screen's `layout` config
- It maps over `screen.components` and renders each via `DynamicComponent`

### DynamicComponent (Line-by-Line)

This is where the magic happens. Let's walk through it:

```typescript
function DynamicComponent({ node, rendererProps }: DynamicComponentProps): ReactNode {
  const {
    context, state, screenState, formState, apiData,
    setState, setScreenState, setFormValue,
    navigate, navigateBack, currentStep, setStep, totalSteps,
    callApi, openModal, closeModal, submitForm, validateForm, customHandlers,
  } = rendererProps;
```

**Step 1: Destructure all the props needed for rendering and actions.**

```typescript
  // Build full context for evaluation
  const fullContext = useMemo(
    () => ({
      ...context,
      state: { ...state, ...screenState },  // Merged state
      form: formState.values,
      api: apiData,
    }),
    [context, state, screenState, formState.values, apiData]
  );
```

**Step 2: Build the full context object.** This merges:
- `context` - User, tenant, and other application data
- `state` - Persistent state + screen-local state
- `form` - Current form values
- `api` - Data from API calls

```typescript
  // Check render conditions
  const shouldRender = useMemo(() => {
    if (!node.conditions) return true;
    return evaluateConditions(node.conditions, fullContext);
  }, [node.conditions, fullContext]);
```

**Step 3: Evaluate conditions.** If the node has `conditions`, check if they pass. This determines if the component renders at all.

```typescript
  // Get the component from registry
  const Component = useMemo(() => getComponent(node.type), [node.type]);
```

**Step 4: Look up the React component.** The `node.type` (e.g., "button", "card") maps to an actual React component.

```typescript
  // Resolve data bindings
  const resolvedBindings = useMemo(() => {
    if (!node.dataBinding) return {};
    return resolveDataBindings(
      {},
      node.dataBinding as Record<string, DataBinding>,
      { context, state: { ...state, ...screenState }, form: formState.values, api: apiData }
    );
  }, [node.dataBinding, context, state, screenState, formState.values, apiData]);
```

**Step 5: Resolve data bindings.** If the node has explicit `dataBinding` configurations, resolve them to actual values.

```typescript
  // Resolve template strings in props
  const resolvedProps = useMemo(() => {
    const props = node.props || {};
    const resolved = resolveAllTemplates(props, fullContext) as Record<string, unknown>;
    return { ...resolved, ...resolvedBindings };
  }, [node.props, fullContext, resolvedBindings]);
```

**Step 6: Resolve templates.** Process `{{user.name}}` style templates in the props, then merge with resolved bindings.

```typescript
  // Create action context
  const actionContext: ActionContext = useMemo(
    () => ({
      context, state: { ...state, ...screenState }, form: formState.values, api: apiData,
      setState, setScreenState, setFormValue, navigate, navigateBack,
      currentStep, setStep, totalSteps, callApi, openModal, closeModal,
      submitForm, validateForm, customHandlers,
    }),
    [/* dependencies */]
  );

  // Create action handlers
  const actionHandlers = useMemo(
    () => createActionHandlers(node.actions as Action[] | undefined, actionContext),
    [node.actions, actionContext]
  );
```

**Step 7: Create action handlers.** Convert the declarative `actions` array into actual `onClick`, `onChange`, etc. handlers.

```typescript
  // Handle special input components with form state
  const inputProps = useMemo(() => {
    const isInput = ["input", "textarea", "select", "checkbox", "switch", "otp"].includes(node.type);
    if (!isInput) return {};

    const fieldName = (node.props?.name as string) || node.id;
    return {
      value: formState.values[fieldName] ?? "",
      error: formState.errors[fieldName],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string) => {
        const value = typeof e === "string" ? e : e.target?.value ?? e;
        setFormValue(fieldName, value);

        // Also trigger any onChange actions
        if (actionHandlers.onChange) {
          actionHandlers.onChange(e);
        }
      },
    };
  }, [node.type, node.props, node.id, formState, setFormValue, actionHandlers]);
```

**Step 8: Special handling for form inputs.** Input components get automatic form state wiring - their value comes from `formState` and changes update it automatically.

```typescript
  // Render children recursively
  const children = useMemo(() => {
    if (!node.children || node.children.length === 0) {
      return resolvedProps.children || resolvedProps.text || null;
    }

    return node.children.map((child) => (
      <DynamicComponent key={child.id} node={child} rendererProps={rendererProps} />
    ));
  }, [node.children, resolvedProps.children, resolvedProps.text, rendererProps]);
```

**Step 9: Recursively render children.** If the node has `children`, render each one. Otherwise, use `props.children` or `props.text` as the content.

```typescript
  // Early returns after all hooks
  if (!shouldRender) return null;
  if (!Component) {
    console.warn(`Unknown component type: ${node.type}`);
    return null;
  }

  return <FinalComponent {...finalProps}>{children}</FinalComponent>;
}
```

**Step 10: Render the final component.** After all hooks have been called (React rules!), we can do early returns and final rendering.

### Why All the useMemo Calls?

Notice every calculation is wrapped in `useMemo`. This is for performance:

1. **Prevents unnecessary recalculations** - Template resolution, condition evaluation, etc. only run when their dependencies change
2. **React hooks rules** - We must call all hooks unconditionally (can't have hooks inside conditions)
3. **Stable references** - Action handlers get stable references, preventing child re-renders

---

## Data Binding

**File:** `src/lib/sdui/data-binding.ts`

Data binding resolves dynamic values from various data sources.

### Sources

```typescript
type BindingSource = "context" | "state" | "form" | "api";
```

| Source | Contains | Example |
|--------|----------|---------|
| `context` | User data, tenant config | `context.user.firstName` |
| `state` | Screen state, persistent state | `state.selectedTab` |
| `form` | Form field values | `form.email` |
| `api` | API response data | `api.plans[0].name` |

### Binding Configuration

```typescript
interface DataBinding {
  source: "context" | "api" | "state" | "form";
  path: string;           // Dot notation: "user.profile.name"
  transform?: string;     // Transform function: "uppercase"
  fallback?: unknown;     // Default if undefined
}
```

### How Binding Resolution Works

```typescript
export function resolveBinding(binding: DataBinding, context: {...}): unknown {
  // 1. Select the source object
  let sourceData: Record<string, unknown>;
  switch (binding.source) {
    case "context": sourceData = context.context || {}; break;
    case "state":   sourceData = context.state || {};   break;
    case "form":    sourceData = context.form || {};    break;
    case "api":     sourceData = context.api || {};     break;
  }

  // 2. Get the nested value using dot notation
  let value = getNestedValue(sourceData, binding.path);

  // 3. Apply fallback if undefined
  if (value === undefined && binding.fallback !== undefined) {
    value = binding.fallback;
  }

  // 4. Apply transform if specified
  if (binding.transform && value !== undefined) {
    value = applyTransform(value, binding.transform);
  }

  return value;
}
```

### Getting Nested Values

The `getNestedValue` function navigates dot notation paths:

```typescript
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj as unknown);
}
```

**Example:**
```typescript
const obj = { user: { profile: { name: "John" } } };
getNestedValue(obj, "user.profile.name"); // "John"
getNestedValue(obj, "user.missing.path"); // undefined
```

### Built-in Transforms

The framework includes these transforms:

```typescript
const transforms = {
  // String transforms
  uppercase:  (v) => v.toUpperCase(),
  lowercase:  (v) => v.toLowerCase(),
  capitalize: (v) => v.charAt(0).toUpperCase() + v.slice(1),
  trim:       (v) => v.trim(),
  truncate:   (v, len = 50) => v.length > len ? v.slice(0, len) + "..." : v,

  // Number transforms
  currency:   (v, cur = "USD") => new Intl.NumberFormat("en-US",
                { style: "currency", currency: cur }).format(v),
  percent:    (v, dec = 0) => `${(v * 100).toFixed(dec)}%`,
  round:      (v, dec = 0) => Number(v.toFixed(dec)),
  abs:        (v) => Math.abs(v),

  // Date transforms
  date:         (v, format = "short") => { /* formats date */ },
  relativeTime: (v) => { /* "2 hours ago" */ },

  // Array transforms
  join:   (v, sep = ", ") => v.join(sep),
  first:  (v) => v[0],
  last:   (v) => v[v.length - 1],
  length: (v) => v.length,

  // Boolean transforms
  not:  (v) => !v,
  bool: (v) => Boolean(v),

  // Fallback
  default: (v, def) => v ?? def,
};
```

### Using Transforms

Transforms can have arguments:

```typescript
// No arguments
"{{user.name|uppercase}}"

// With arguments
"{{user.balance|currency('EUR')}}"
"{{description|truncate(100)}}"
"{{price|round(2)}}"
```

### Exercise: Add a Custom Transform

1. Open `src/lib/sdui/data-binding.ts`
2. Add to the `transforms` object:

```typescript
const transforms = {
  // ... existing transforms

  // Add phone formatting
  phone: (value) => {
    if (typeof value !== "string") return value;
    // Format as (XXX) XXX-XXXX
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  },

  // Add initials extraction
  initials: (value) => {
    if (typeof value !== "string") return value;
    return value.split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .join("");
  },
};
```

3. Use in a schema:
```typescript
{
  id: "user-phone",
  type: "text",
  props: { text: "{{user.phone|phone}}" }  // (555) 123-4567
}

{
  id: "user-initials",
  type: "avatar",
  props: { fallback: "{{user.firstName}} {{user.lastName}}|initials" }  // JD
}
```

---

## Condition Evaluation

**File:** `src/lib/sdui/condition-evaluator.ts`

Conditions determine when components render.

### Condition Structure

```typescript
interface RenderCondition {
  field: string;           // Path in context: "user.plan.type"
  operator: ConditionOperator;
  value?: unknown;         // Value to compare against
}

type ConditionOperator =
  | "eq"          // Equal
  | "neq"         // Not equal
  | "gt"          // Greater than
  | "gte"         // Greater than or equal
  | "lt"          // Less than
  | "lte"         // Less than or equal
  | "contains"    // String/array contains
  | "notContains" // String/array doesn't contain
  | "startsWith"  // String starts with
  | "endsWith"    // String ends with
  | "in"          // Value in array
  | "notIn"       // Value not in array
  | "exists"      // Not undefined/null
  | "notExists";  // Is undefined/null
```

### Condition Groups

For complex logic, use groups:

```typescript
interface ConditionGroup {
  operator: "and" | "or";
  conditions: (RenderCondition | ConditionGroup)[];
}
```

### Evaluation Logic

```typescript
export function evaluateCondition(
  condition: RenderCondition,
  context: Record<string, unknown>
): boolean {
  const fieldValue = getNestedValue(context, condition.field);
  const conditionValue = condition.value;

  switch (condition.operator) {
    case "eq":
      return fieldValue === conditionValue;

    case "neq":
      return fieldValue !== conditionValue;

    case "gt":
      return typeof fieldValue === "number" && fieldValue > (conditionValue as number);

    case "contains":
      if (typeof fieldValue === "string") {
        return fieldValue.includes(conditionValue as string);
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(conditionValue);
      }
      return false;

    case "in":
      return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);

    case "exists":
      return fieldValue !== undefined && fieldValue !== null;

    // ... more operators
  }
}
```

### Group Evaluation

```typescript
export function evaluateConditions(
  conditions: RenderCondition | ConditionGroup | undefined,
  context: Record<string, unknown>
): boolean {
  if (!conditions) return true;

  // Check if it's a group
  if (isConditionGroup(conditions)) {
    const results = conditions.conditions.map((c) => evaluateConditions(c, context));

    if (conditions.operator === "and") {
      return results.every(Boolean);  // ALL must be true
    } else {
      return results.some(Boolean);   // ANY must be true
    }
  }

  return evaluateCondition(conditions, context);
}
```

### Examples

**Simple condition:**
```typescript
// Show only for postpaid users
conditions: {
  field: "user.plan.type",
  operator: "eq",
  value: "postpaid"
}
```

**Multiple conditions (AND):**
```typescript
// Show only for verified users with positive balance
conditions: {
  operator: "and",
  conditions: [
    { field: "user.isVerified", operator: "eq", value: true },
    { field: "user.balance", operator: "gt", value: 0 }
  ]
}
```

**Multiple conditions (OR):**
```typescript
// Show for admins OR premium users
conditions: {
  operator: "or",
  conditions: [
    { field: "user.role", operator: "eq", value: "admin" },
    { field: "user.plan.type", operator: "eq", value: "premium" }
  ]
}
```

**Nested groups:**
```typescript
// (isAdmin OR isPremium) AND hasValidEmail
conditions: {
  operator: "and",
  conditions: [
    {
      operator: "or",
      conditions: [
        { field: "user.role", operator: "eq", value: "admin" },
        { field: "user.isPremium", operator: "eq", value: true }
      ]
    },
    { field: "user.emailVerified", operator: "eq", value: true }
  ]
}
```

### Exercise: Add a Custom Operator

1. Open `src/lib/sdui/condition-evaluator.ts`
2. Add a new operator:

```typescript
// In the switch statement
case "regex":
  if (typeof fieldValue !== "string" || typeof conditionValue !== "string") {
    return false;
  }
  try {
    const regex = new RegExp(conditionValue);
    return regex.test(fieldValue);
  } catch {
    console.warn(`Invalid regex: ${conditionValue}`);
    return false;
  }

case "empty":
  if (Array.isArray(fieldValue)) return fieldValue.length === 0;
  if (typeof fieldValue === "string") return fieldValue.trim() === "";
  return fieldValue === null || fieldValue === undefined;

case "notEmpty":
  if (Array.isArray(fieldValue)) return fieldValue.length > 0;
  if (typeof fieldValue === "string") return fieldValue.trim() !== "";
  return fieldValue !== null && fieldValue !== undefined;
```

3. Add to the type in `src/types/sdui.ts`:

```typescript
export const ConditionOperatorSchema = z.enum([
  // ... existing operators
  "regex",
  "empty",
  "notEmpty",
]);
```

4. Use in a schema:
```typescript
// Show only if email looks valid
conditions: {
  field: "form.email",
  operator: "regex",
  value: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
}
```

---

## Template String Processing

**File:** `src/lib/sdui/data-binding.ts`

Template strings allow embedding dynamic values in props:

```typescript
"Hello, {{user.firstName}}!"
"Balance: {{user.balance|currency}}"
"{{state.count + 1}} items"
"{{user.isActive ? 'Active' : 'Inactive'}}"
```

### Processing Flow

```typescript
export function resolveTemplateString(
  template: string,
  context: Record<string, unknown>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
    const trimmedExpr = expression.trim();

    // Check for transform: {{user.name|uppercase}}
    const [exprPart, ...transformParts] = trimmedExpr.split("|");

    // Evaluate expression
    let value = safeEvaluateExpression(exprPart.trim(), context);

    // Apply transforms
    for (const transform of transformParts) {
      value = applyTransform(value, transform.trim());
    }

    return value !== undefined ? String(value) : "";
  });
}
```

### Safe Expression Evaluation

The `safeEvaluateExpression` function handles:

1. **Property access:** `state.count`, `user.profile.name`
2. **Literals:** `'text'`, `123`, `true`, `false`, `null`
3. **Arithmetic:** `state.count + 1`, `price * 1.1`
4. **Comparisons:** `count > 5`, `name === 'Admin'`
5. **Ternary:** `isActive ? 'Yes' : 'No'`
6. **Logical:** `a && b`, `a || b`
7. **Negation:** `!isValid`

```typescript
function safeEvaluateExpression(expression: string, context: Record<string, unknown>): unknown {
  const expr = expression.trim();

  // Handle ternary: condition ? trueValue : falseValue
  const ternaryMatch = expr.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
  if (ternaryMatch) {
    const condition = safeEvaluateExpression(ternaryMatch[1], context);
    const trueVal = safeEvaluateExpression(ternaryMatch[2], context);
    const falseVal = safeEvaluateExpression(ternaryMatch[3], context);
    return condition ? trueVal : falseVal;
  }

  // Handle comparison operators
  const comparisonOps = ['===', '!==', '>=', '<=', '>', '<', '==', '!='];
  for (const op of comparisonOps) {
    if (expr.includes(op)) {
      const [left, right] = expr.split(op).map(s => s.trim());
      const leftVal = safeEvaluateExpression(left, context);
      const rightVal = safeEvaluateExpression(right, context);
      // ... apply comparison
    }
  }

  // Handle arithmetic: +, -, *, /
  // Handle logical: &&, ||
  // Handle negation: !
  // Handle literals: strings, numbers, booleans
  // Handle property access: state.count

  return getNestedValue(context, expr);
}
```

### Template Examples

```typescript
// Simple substitution
text: "Hello, {{user.firstName}}!"
// Result: "Hello, John!"

// With transform
text: "{{user.plan.type|uppercase}} PLAN"
// Result: "POSTPAID PLAN"

// With arithmetic
text: "Page {{state.currentPage + 1}} of {{state.totalPages}}"
// Result: "Page 2 of 10"

// With ternary
text: "Status: {{user.isActive ? 'Active' : 'Inactive'}}"
// Result: "Status: Active"

// Multiple templates
text: "{{user.firstName}} {{user.lastName}} ({{user.email}})"
// Result: "John Doe (john@example.com)"
```

---

## The Rendering Pipeline

Here's the complete pipeline for rendering a single component:

```
Component Node (JSON)
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ 1. BUILD CONTEXT                                        │
│    Merge: context + state + screenState + form + api    │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ 2. EVALUATE CONDITIONS                                  │
│    if (conditions) evaluateConditions(conditions, ctx)  │
│    Returns: boolean (should render?)                    │
└─────────────────────────────────────────────────────────┘
        │
        ▼ (if true)
┌─────────────────────────────────────────────────────────┐
│ 3. RESOLVE DATA BINDINGS                                │
│    For each dataBinding entry:                          │
│      - Get value from source (context/state/form/api)   │
│      - Apply fallback if undefined                      │
│      - Apply transform if specified                     │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ 4. RESOLVE TEMPLATE STRINGS                             │
│    For each prop value:                                 │
│      - Find {{...}} patterns                            │
│      - Evaluate expression safely                       │
│      - Apply transforms (|uppercase, |currency, etc.)   │
│      - Replace with resolved value                      │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ 5. CREATE ACTION HANDLERS                               │
│    Group actions by trigger (click, submit, change...)  │
│    Create onClick, onSubmit, onChange handlers          │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ 6. SPECIAL INPUT HANDLING                               │
│    If input component:                                  │
│      - Wire value from formState                        │
│      - Wire onChange to setFormValue                    │
│      - Wire error from formState.errors                 │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ 7. COMPONENT LOOKUP                                     │
│    getComponent(node.type) from registry                │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ 8. RENDER CHILDREN                                      │
│    Recursively render each child with DynamicComponent  │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ 9. FINAL RENDER                                         │
│    <Component {...props} {...handlers}>{children}</>    │
└─────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Why useMemo Everywhere?

Every calculation in `DynamicComponent` is memoized:

```typescript
const shouldRender = useMemo(() => {...}, [node.conditions, fullContext]);
const resolvedBindings = useMemo(() => {...}, [node.dataBinding, ...]);
const resolvedProps = useMemo(() => {...}, [node.props, fullContext]);
const actionHandlers = useMemo(() => {...}, [node.actions, actionContext]);
```

**Without memoization:**
- Every re-render recalculates everything
- Every prop change triggers all child re-renders
- Action handlers get new references, breaking React's optimization

**With memoization:**
- Calculations only run when dependencies change
- Stable handler references prevent unnecessary re-renders
- Better performance with large component trees

### React Hooks Rules

Notice we call ALL hooks before any conditional returns:

```typescript
function DynamicComponent({ node, rendererProps }) {
  // ALL hooks called unconditionally first
  const fullContext = useMemo(() => {...}, [...]);
  const shouldRender = useMemo(() => {...}, [...]);
  const Component = useMemo(() => {...}, [...]);
  const resolvedBindings = useMemo(() => {...}, [...]);
  // ... all other hooks

  // THEN conditional returns
  if (!shouldRender) return null;
  if (!Component) return null;

  return <Component {...}>{...}</Component>;
}
```

This is required by React's rules of hooks - hooks must be called in the same order on every render.

### Potential Bottlenecks

1. **Deep component trees** - Each level adds rendering overhead
2. **Complex conditions** - Deeply nested condition groups
3. **Large data sets** - Huge arrays in context
4. **Frequent state updates** - Each update re-renders the tree

### Optimization Tips

1. **Use screenState for local state** - Doesn't persist across screens
2. **Avoid unnecessary nesting** - Flatten when possible
3. **Use conditions wisely** - Prefer simple conditions
4. **Memoize expensive components** - Wrap in React.memo if needed

---

## Exercises

### Exercise 1: Trace a Render

Open the browser DevTools and add this to `renderer.tsx`:

```typescript
// At the start of DynamicComponent
console.log(`Rendering: ${node.type} (${node.id})`);
```

1. Navigate to `/dashboard`
2. Watch the console to see the render order
3. Trigger a state change and see what re-renders

### Exercise 2: Add a New Transform

Add a `mask` transform for credit cards:

1. Edit `data-binding.ts`
2. Add: `mask: (v) => v.replace(/\d(?=\d{4})/g, "*")`
3. Use: `"{{card.number|mask}}"` → `************1234`

### Exercise 3: Add a Custom Condition

Add a `between` operator:

1. Edit `condition-evaluator.ts`
2. Add the operator logic (expect `value` to be `[min, max]`)
3. Add to the Zod schema
4. Test: `{ field: "age", operator: "between", value: [18, 65] }`

### Exercise 4: Debug a Template

Create a failing template and fix it:

1. Add: `text: "{{user.missing.path}}"`
2. See it renders empty
3. Add: `text: "{{user.missing.path|default('N/A')}}"`
4. See it renders "N/A"

---

## Next Steps

- **[Actions System](./03-actions-system.md)** - How actions are dispatched and executed
- **[Components](./04-components.md)** - Building and registering components
