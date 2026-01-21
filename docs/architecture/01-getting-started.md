# Getting Started

This guide will help you set up your development environment and make your first changes to the SDUI framework.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Project](#running-the-project)
4. [Project Tour](#project-tour)
5. [Your First Changes](#your-first-changes)
6. [Development Workflow](#development-workflow)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** - JavaScript runtime ([download](https://nodejs.org/))
- **npm** - Package manager (comes with Node.js)
- **Git** - Version control ([download](https://git-scm.com/))
- **MongoDB** - Database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Code Editor** - VS Code recommended ([download](https://code.visualstudio.com/))

### Recommended VS Code Extensions

- **ESLint** - JavaScript/TypeScript linting
- **Tailwind CSS IntelliSense** - CSS class autocomplete
- **Prisma** - Database schema syntax highlighting
- **Pretty TypeScript Errors** - Better error messages

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd selfcare-spike
```

### 2. Install Dependencies

```bash
npm install
```

This installs all packages defined in `package.json`:

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `react`, `react-dom` | UI library |
| `zustand` | State management |
| `@prisma/client` | Database ORM |
| `zod` | Schema validation |
| `tailwindcss` | CSS framework |
| `sonner` | Toast notifications |
| `lucide-react` | Icons |
| `recharts` | Charts |
| `@monaco-editor/react` | Code editor (for admin) |

### 3. Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` with your values:

```env
# MongoDB connection string
# For local MongoDB: mongodb://localhost:27017/selfcare-sdui
# For MongoDB Atlas: mongodb+srv://user:password@cluster.mongodb.net/selfcare-sdui
DATABASE_URL="mongodb://localhost:27017/selfcare-sdui"

# App URL (used for absolute URLs)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Generate Prisma Client

```bash
npm run db:generate
```

This generates TypeScript types from your Prisma schema.

### 5. Push Database Schema (Optional)

If you have a MongoDB instance running:

```bash
npm run db:push
```

This creates the collections and indexes defined in `prisma/schema.prisma`.

**Note:** The app works without a database - it falls back to mock screens.

---

## Running the Project

### Development Server

```bash
npm run dev
```

This starts the development server with Turbopack (fast refresh) at http://localhost:3000.

### Available Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/dashboard` | Main dashboard (mock user data) |
| `/onboarding` | Multi-step onboarding flow |
| `/admin` | Admin panel (if implemented) |
| `/api/screens/[screenId]` | API: Get screen schema |
| `/api/schemas` | API: List/create schemas |

### Other Commands

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run db:studio # Open Prisma Studio (database GUI)
```

---

## Project Tour

Let's explore the key files you'll work with.

### The Dashboard Page

**File:** `src/app/dashboard/page.tsx`

```typescript
"use client";

import { ScreenPage } from "@/components/sdui/screen-page";
import { dashboardScreen } from "@/lib/sdui/schemas/dashboard";

export default function DashboardPage() {
  return <ScreenPage screenId="dashboard" initialScreen={dashboardScreen} />;
}
```

This is surprisingly simple. The `ScreenPage` component does all the work:
1. Takes a `screenId` to fetch from API (or uses `initialScreen` as fallback)
2. Sets up the Zustand store connections
3. Renders the `ScreenRenderer` with all the necessary props

### The Screen Schema

**File:** `src/lib/sdui/schemas/dashboard.ts`

Open this file and scroll through it. You'll see:

```typescript
export const dashboardScreen: Screen = {
  version: "1.0",
  id: "dashboard",
  type: "screen",
  meta: { title: "Dashboard", requiresAuth: true, tags: ["dashboard", "home"] },
  layout: { type: "grid", columns: 12, gap: 8 },
  components: [
    // Header Section
    {
      id: "header-container",
      type: "container",
      className: "col-span-12 mb-2",
      children: [
        {
          id: "greeting",
          type: "flex",
          props: { justify: "between", align: "center" },
          children: [
            // ... nested components
          ]
        }
      ]
    },
    // More components...
  ]
};
```

Notice:
- Components nest inside each other via `children`
- Template strings like `{{user.firstName}}` pull from context
- `conditions` control when components render
- `actions` define interactivity

### The Renderer

**File:** `src/lib/sdui/renderer.tsx`

This is the heart of the SDUI framework. The key function is `DynamicComponent`:

```typescript
function DynamicComponent({ node, rendererProps }: DynamicComponentProps): ReactNode {
  // 1. Build context for evaluation
  const fullContext = useMemo(() => ({ ...context, state, form, api }), [...]);

  // 2. Check if this component should render
  const shouldRender = useMemo(() => {
    if (!node.conditions) return true;
    return evaluateConditions(node.conditions, fullContext);
  }, [node.conditions, fullContext]);

  // 3. Resolve data bindings
  const resolvedBindings = useMemo(() => {
    return resolveDataBindings(node.dataBinding, context);
  }, [node.dataBinding, context]);

  // 4. Resolve template strings in props
  const resolvedProps = useMemo(() => {
    return resolveAllTemplates(node.props, fullContext);
  }, [node.props, fullContext]);

  // 5. Create action handlers
  const actionHandlers = useMemo(() => {
    return createActionHandlers(node.actions, actionContext);
  }, [node.actions, actionContext]);

  // 6. Get the actual React component
  const Component = getComponent(node.type);

  // 7. Render with children
  return <Component {...props}>{children}</Component>;
}
```

### The Component Registry

**File:** `src/lib/sdui/component-registry.tsx`

This maps string types to React components:

```typescript
export const componentRegistry: ComponentRegistry = {
  // Layout
  container: Container,
  grid: Grid,
  flex: Flex,
  stack: Stack,

  // Data Display
  text: Text,
  heading: Heading,
  card: Card,

  // Input
  input: Input,
  select: Select,
  checkbox: Checkbox,

  // Navigation
  button: Button,
  link: Link,
  tabs: Tabs,

  // Domain-Specific
  usageWidget: UsageWidget,
  planCard: PlanCard,
  // ...
};

export function getComponent(type: ComponentType): ReactComponentType | null {
  return componentRegistry[type] || null;
}
```

---

## Your First Changes

Let's make some changes to understand how everything works.

### Exercise 1: Modify a Template String

**Goal:** Change the greeting text on the dashboard.

1. Open `src/lib/sdui/schemas/dashboard.ts`
2. Find the `welcome-text` component (around line 43):

```typescript
{
  id: "welcome-text",
  type: "text",
  props: {
    text: "Welcome back,",
    variant: "small",
    color: "secondary",
  },
},
```

3. Change the text:

```typescript
{
  id: "welcome-text",
  type: "text",
  props: {
    text: "Good to see you,",  // Changed!
    variant: "small",
    color: "secondary",
  },
},
```

4. Save and check http://localhost:3000/dashboard

The text should update immediately (hot reload).

### Exercise 2: Add Conditional Rendering

**Goal:** Show a special message only for prepaid users.

1. In `dashboard.ts`, find the `header-container` component
2. Add a new child component with a condition:

```typescript
{
  id: "prepaid-notice",
  type: "alert",
  props: {
    variant: "info",
    title: "Prepaid User",
    description: "Top up your account to keep enjoying our services!"
  },
  conditions: {
    field: "user.plan.type",
    operator: "eq",
    value: "prepaid"
  }
}
```

3. To test, modify the mock user in `src/lib/sdui/store.ts`:

```typescript
const initialMockUser: SDUIContextData["user"] = {
  // ...
  plan: {
    type: "prepaid",  // Change from "postpaid" to "prepaid"
    name: "Basic",
    price: 19.99,
  },
  // ...
};
```

4. Refresh the dashboard - you should see the alert.
5. Change back to "postpaid" - the alert disappears.

### Exercise 3: Add a Click Action

**Goal:** Add a button that shows a toast notification.

1. In `dashboard.ts`, add a new button to the quick actions section:

```typescript
{
  id: "action-test-toast",
  type: "button",
  props: {
    variant: "outline",
    text: "Test Toast",
    className: "w-full justify-start",
  },
  actions: [
    {
      trigger: "click",
      type: "showToast",
      payload: {
        type: "success",
        title: "It works!",
        message: "You successfully triggered an action."
      }
    }
  ]
}
```

2. Click the button on the dashboard - a toast should appear.

### Exercise 4: Create a New Component

**Goal:** Add a simple "InfoBox" component to the registry.

1. Create `src/components/ui/info-box.tsx`:

```typescript
import { cn } from "@/lib/utils/cn";

interface InfoBoxProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function InfoBox({ title, children, className, icon }: InfoBoxProps) {
  return (
    <div className={cn(
      "rounded-lg border border-blue-200 bg-blue-50 p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        {icon && <div className="text-blue-500">{icon}</div>}
        <div>
          <h4 className="font-medium text-blue-900">{title}</h4>
          {children && (
            <p className="mt-1 text-sm text-blue-700">{children}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

2. Register it in `src/lib/sdui/component-registry.tsx`:

```typescript
import { InfoBox } from "@/components/ui/info-box";

// Add to the registry
export const componentRegistry: ComponentRegistry = {
  // ... existing components
  infoBox: InfoBox,
};
```

3. Add the type to `src/types/sdui.ts`:

```typescript
export const ComponentTypeSchema = z.enum([
  // ... existing types
  "infoBox",
]);
```

4. Use it in a screen schema:

```typescript
{
  id: "my-info-box",
  type: "infoBox",
  props: {
    title: "Did you know?",
    children: "You can customize this SDUI framework!"
  }
}
```

---

## Development Workflow

### Making Schema Changes

1. **Edit the schema** in `src/lib/sdui/schemas/` or via the database
2. **Hot reload** shows changes immediately
3. **Test conditions** by modifying mock data in `store.ts`
4. **Debug** using browser DevTools and `console.log`

### Making Framework Changes

1. **Edit core files** in `src/lib/sdui/`
2. **TypeScript** catches most errors immediately
3. **Test with existing screens** to verify nothing broke
4. **Add new types** to `src/types/sdui.ts` first

### Adding New Components

1. Create the React component in `src/components/ui/`
2. Add to the registry in `component-registry.tsx`
3. Add the type to `sdui.ts`
4. (Optional) Export from `src/components/ui/index.ts`

### Database Development

```bash
# Open Prisma Studio (visual database editor)
npm run db:studio

# After changing prisma/schema.prisma
npm run db:generate  # Regenerate client
npm run db:push      # Push changes to database
```

---

## Common Gotchas

### 1. Template strings not resolving

**Symptom:** You see `{{user.name}}` literally instead of the value.

**Cause:** The path doesn't exist in the context.

**Fix:** Check that the data exists in `store.ts` mock data or context.

### 2. Component not rendering

**Symptom:** Component doesn't appear.

**Causes:**
- Condition evaluates to false
- Component type not in registry
- Parent has `children: []` instead of nested children

**Fix:** Check console for warnings, verify conditions, check registry.

### 3. Actions not firing

**Symptom:** Click/submit doesn't do anything.

**Causes:**
- Wrong trigger (e.g., `submit` instead of `click`)
- Action type misspelled
- Missing payload

**Fix:** Add `console.log` in `action-dispatcher.ts` to debug.

### 4. TypeScript errors after adding component

**Symptom:** Type errors about component type.

**Cause:** Type not added to `ComponentTypeSchema` in `sdui.ts`.

**Fix:** Add the new type to the enum.

---

## Next Steps

Now that you have the project running and made your first changes:

1. **[SDUI Core](./02-sdui-core.md)** - Deep dive into how the renderer works
2. **[Actions System](./03-actions-system.md)** - Understand all action types
3. **[Components](./04-components.md)** - Build production-quality components
