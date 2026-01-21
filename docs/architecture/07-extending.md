# Extending the Framework

This document provides guidance on implementing features that are defined but not yet fully wired up in the codebase.

## Table of Contents

1. [Feature Status Overview](#feature-status-overview)
2. [Implementing Authentication](#implementing-authentication)
3. [Custom Component Registration](#custom-component-registration)
4. [A/B Testing (Experiments)](#ab-testing-experiments)
5. [Theme System](#theme-system)
6. [Audit Logging](#audit-logging)
7. [Real API Integration](#real-api-integration)
8. [Validation System](#validation-system)

---

## Feature Status Overview

| Feature | Schema/Types | Database | API | UI | Status |
|---------|--------------|----------|-----|----|-|
| Screen rendering | Yes | Yes | Yes | Yes | **Complete** |
| Actions system | Yes | N/A | N/A | Yes | **Complete** |
| Conditions | Yes | N/A | N/A | Yes | **Complete** |
| Data binding | Yes | N/A | N/A | Yes | **Complete** |
| Multi-tenant | Yes | Yes | Partial | No | Needs work |
| Themes | Yes | Yes | No | No | Needs work |
| A/B Testing | Yes | Yes | No | No | Needs work |
| Auth | No | No | No | No | Not started |
| Audit logging | No | Yes | No | No | Needs work |
| Custom components | Yes | Yes | No | No | Needs work |
| Form validation | Yes | N/A | N/A | Partial | Needs work |

---

## Implementing Authentication

The codebase doesn't have authentication yet. Here's how to add it.

### Step 1: Choose an Auth Provider

Options:
- **NextAuth.js** - Full-featured, supports many providers
- **Clerk** - Managed auth service
- **Auth0** - Enterprise-grade
- **Custom JWT** - Full control

### Step 2: Add Auth Middleware

Create `src/middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the auth token from cookies
  const token = request.cookies.get("auth-token")?.value;

  // Protected routes
  const protectedPaths = ["/dashboard", "/admin", "/api/schemas"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    // Redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/:path*"],
};
```

### Step 3: Add User Context

Update `src/lib/sdui/store.ts`:

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Add to store
isAuthenticated: false,
login: (token, user) => set({
  isAuthenticated: true,
  context: { ...get().context, user },
  // Store token in cookie/localStorage
}),
logout: () => set({
  isAuthenticated: false,
  context: { ...get().context, user: null },
}),
```

### Step 4: Protect Screens

Use the `meta.requiresAuth` field:

```typescript
// In screen-page.tsx
if (screen.meta?.requiresAuth && !isAuthenticated) {
  router.push("/login");
  return null;
}
```

### Step 5: Add Role-Based Access

```typescript
// In screen schema
{
  meta: {
    requiresAuth: true,
    roles: ["admin", "manager"]
  }
}

// In screen-page.tsx
const userRole = context.user?.role;
const allowedRoles = screen.meta?.roles || [];

if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
  router.push("/unauthorized");
  return null;
}
```

---

## Custom Component Registration

The database has a `ComponentDefinition` model but it's not wired up.

### Step 1: Create the API

Create `src/app/api/components/route.ts`:

```typescript
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const components = await prisma.componentDefinition.findMany({
    orderBy: { category: "asc" },
  });
  return NextResponse.json({ components });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const component = await prisma.componentDefinition.create({
    data: {
      type: body.type,
      name: body.name,
      description: body.description,
      category: body.category,
      propsSchema: body.propsSchema,
      defaultProps: body.defaultProps,
      examples: body.examples,
      isBuiltIn: false,
    },
  });

  return NextResponse.json({ component }, { status: 201 });
}
```

### Step 2: Dynamic Component Loading

Create `src/lib/sdui/dynamic-registry.ts`:

```typescript
import { componentRegistry } from "./component-registry";

let customComponents: Record<string, React.ComponentType> = {};

export async function loadCustomComponents() {
  try {
    const response = await fetch("/api/components");
    const { components } = await response.json();

    // For now, custom components would need to be pre-compiled
    // A full solution would need a component compiler/bundler
    console.log("Custom components:", components);
  } catch (error) {
    console.error("Failed to load custom components:", error);
  }
}

export function getComponent(type: string): React.ComponentType | null {
  // Check custom first, then built-in
  return customComponents[type] || componentRegistry[type] || null;
}
```

### Step 3: Admin UI for Component Management

Create an admin page to:
1. List all registered components
2. Add new component definitions
3. Preview components with example props

### Future: Remote Component Loading

For truly dynamic components, you'd need:
1. Component code storage (S3, database)
2. Runtime bundling (esbuild, webpack)
3. Sandboxed execution (iframe, web workers)

This is complex and may not be worth the security risks.

---

## A/B Testing (Experiments)

The `Experiment` model exists but needs wiring.

### Step 1: Create Experiment API

Create `src/app/api/experiments/route.ts`:

```typescript
export async function GET() {
  const experiments = await prisma.experiment.findMany({
    where: { status: "RUNNING" },
  });
  return NextResponse.json({ experiments });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const experiment = await prisma.experiment.create({
    data: {
      experimentId: body.experimentId,
      name: body.name,
      description: body.description,
      screenId: body.screenId,
      variants: body.variants,
      traffic: body.traffic,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ experiment }, { status: 201 });
}
```

### Step 2: Variant Assignment

Create `src/lib/sdui/experiments.ts`:

```typescript
interface Experiment {
  id: string;
  variants: { id: string; screenId: string; weight: number }[];
}

export function assignVariant(
  experiment: Experiment,
  userId: string
): string {
  // Consistent hashing - same user always gets same variant
  const hash = hashString(`${experiment.id}-${userId}`);
  const normalized = hash / 0xffffffff;  // 0 to 1

  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (normalized < cumulative) {
      return variant.id;
    }
  }

  return experiment.variants[0].id;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
```

### Step 3: Integrate with Screen Loading

```typescript
// In screen-page.tsx or API route
async function getScreenWithExperiment(
  screenId: string,
  userId: string
): Promise<Screen> {
  // Check for active experiment
  const experiment = await prisma.experiment.findFirst({
    where: { screenId, status: "RUNNING" },
  });

  if (!experiment) {
    return getScreen(screenId);
  }

  // Assign variant
  const variantId = assignVariant(experiment, userId);
  const variant = experiment.variants.find((v) => v.id === variantId);

  // Return variant screen
  return getScreen(variant.screenId);
}
```

### Step 4: Track Results

```typescript
// Track which variant user saw
await prisma.experimentEvent.create({
  data: {
    experimentId: experiment.id,
    variantId,
    userId,
    event: "view",
  },
});

// Track conversions
await prisma.experimentEvent.create({
  data: {
    experimentId,
    variantId,
    userId,
    event: "conversion",
  },
});
```

---

## Theme System

Themes are defined in the database but not applied.

### Step 1: Create Theme API

```typescript
// GET /api/themes/:themeId
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { themeId } = await params;

  const theme = await prisma.theme.findUnique({
    where: { themeId },
  });

  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  return NextResponse.json({ theme });
}
```

### Step 2: CSS Variable Generator

Create `src/lib/sdui/theme-generator.ts`:

```typescript
interface Theme {
  colors: Record<string, string>;
  typography?: {
    fontFamily?: string;
    fontSize?: Record<string, string>;
  };
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
}

export function generateCSSVariables(theme: Theme): string {
  const vars: string[] = [];

  // Colors
  for (const [name, value] of Object.entries(theme.colors)) {
    vars.push(`--color-${name}: ${value};`);
  }

  // Typography
  if (theme.typography?.fontFamily) {
    vars.push(`--font-family: ${theme.typography.fontFamily};`);
  }
  if (theme.typography?.fontSize) {
    for (const [name, value] of Object.entries(theme.typography.fontSize)) {
      vars.push(`--font-size-${name}: ${value};`);
    }
  }

  // Spacing
  if (theme.spacing) {
    for (const [name, value] of Object.entries(theme.spacing)) {
      vars.push(`--spacing-${name}: ${value};`);
    }
  }

  return `:root {\n  ${vars.join("\n  ")}\n}`;
}
```

### Step 3: Apply Theme in Layout

```typescript
// In layout.tsx or a ThemeProvider
"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeCSS, setThemeCSS] = useState("");

  useEffect(() => {
    async function loadTheme() {
      const response = await fetch("/api/themes/default");
      const { theme } = await response.json();
      setThemeCSS(generateCSSVariables(theme));
    }
    loadTheme();
  }, []);

  return (
    <>
      {themeCSS && <style>{themeCSS}</style>}
      {children}
    </>
  );
}
```

### Step 4: Use CSS Variables in Components

```typescript
// In Tailwind config or component styles
.button-primary {
  background-color: var(--color-primary);
  font-family: var(--font-family);
}
```

---

## Audit Logging

The `AuditLog` model exists but isn't populated.

### Step 1: Create Logging Utility

Create `src/lib/audit.ts`:

```typescript
import { prisma } from "@/lib/db/prisma";

interface AuditLogInput {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  tenantId?: string;
  changes?: unknown;
  metadata?: unknown;
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        userId: input.userId,
        tenantId: input.tenantId,
        changes: input.changes ? JSON.parse(JSON.stringify(input.changes)) : null,
        metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging shouldn't break the main operation
  }
}

// Compute diff between old and new values
export function computeDiff(
  oldValue: Record<string, unknown>,
  newValue: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const diff: Record<string, { old: unknown; new: unknown }> = {};

  const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

  for (const key of allKeys) {
    if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
      diff[key] = { old: oldValue[key], new: newValue[key] };
    }
  }

  return diff;
}
```

### Step 2: Add to API Routes

```typescript
// In POST /api/schemas
const screen = await prisma.screen.create({ data: {...} });

await logAudit({
  action: "CREATE_SCREEN",
  entityType: "Screen",
  entityId: screen.id,
  userId: getCurrentUserId(),  // From auth
  changes: screen.schema,
});

// In PUT /api/screens/:id
const oldScreen = await prisma.screen.findUnique({ where: { id } });
const newScreen = await prisma.screen.update({ where: { id }, data: {...} });

await logAudit({
  action: "UPDATE_SCREEN",
  entityType: "Screen",
  entityId: screen.id,
  userId: getCurrentUserId(),
  changes: computeDiff(oldScreen.schema, newScreen.schema),
});
```

### Step 3: Create Audit Log API

```typescript
// GET /api/audit-logs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({ logs });
}
```

---

## Real API Integration

Currently, the framework uses mock data. Here's how to integrate real APIs.

### Step 1: API Configuration

Create `src/lib/api-config.ts`:

```typescript
export const apiConfig = {
  baseUrl: process.env.BACKEND_API_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
```

### Step 2: Replace Mock Context

```typescript
// In screen-page.tsx
useEffect(() => {
  async function loadUserData() {
    try {
      const userData = await apiClient<User>("/api/user/me");
      setContext({ user: userData });
    } catch (error) {
      console.error("Failed to load user:", error);
      // Fall back to mock or redirect to login
    }
  }
  loadUserData();
}, []);
```

### Step 3: Wire API Actions

The `apiCall` action already supports real APIs:

```typescript
{
  trigger: "click",
  type: "apiCall",
  payload: {
    endpoint: "/api/plans",
    method: "GET",
    resultKey: "plans"
  }
}
```

Ensure `callApi` in screen-page.tsx points to your backend.

---

## Validation System

Validation rules are defined in types but not fully implemented.

### Step 1: Validation Rules

Already defined in `src/types/sdui.ts`:

```typescript
export const ValidationRuleSchema = z.object({
  type: z.enum([
    "required",
    "email",
    "phone",
    "minLength",
    "maxLength",
    "min",
    "max",
    "pattern",
    "custom",
  ]),
  value: z.any().optional(),
  message: z.string(),
});
```

### Step 2: Validation Function

Create `src/lib/sdui/validation.ts`:

```typescript
interface ValidationRule {
  type: string;
  value?: unknown;
  message: string;
}

export function validateField(
  value: unknown,
  rules: ValidationRule[]
): string | null {
  for (const rule of rules) {
    const error = validateRule(value, rule);
    if (error) return error;
  }
  return null;
}

function validateRule(value: unknown, rule: ValidationRule): string | null {
  switch (rule.type) {
    case "required":
      if (!value || (typeof value === "string" && !value.trim())) {
        return rule.message;
      }
      break;

    case "email":
      if (typeof value === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return rule.message;
      }
      break;

    case "phone":
      if (typeof value === "string" && !/^\+?[\d\s-()]{10,}$/.test(value)) {
        return rule.message;
      }
      break;

    case "minLength":
      if (typeof value === "string" && value.length < (rule.value as number)) {
        return rule.message;
      }
      break;

    case "maxLength":
      if (typeof value === "string" && value.length > (rule.value as number)) {
        return rule.message;
      }
      break;

    case "min":
      if (typeof value === "number" && value < (rule.value as number)) {
        return rule.message;
      }
      break;

    case "max":
      if (typeof value === "number" && value > (rule.value as number)) {
        return rule.message;
      }
      break;

    case "pattern":
      if (typeof value === "string") {
        const regex = new RegExp(rule.value as string);
        if (!regex.test(value)) {
          return rule.message;
        }
      }
      break;
  }

  return null;
}
```

### Step 3: Integrate with Renderer

```typescript
// In renderer.tsx, when handling input changes
const inputProps = useMemo(() => {
  // ... existing logic

  return {
    // ... existing props
    onBlur: () => {
      // Validate on blur
      if (node.validation) {
        const error = validateField(
          formState.values[fieldName],
          node.validation
        );
        if (error) {
          setFormError(fieldName, error);
        }
      }
    },
  };
}, [...]);
```

### Step 4: Form-Level Validation

```typescript
// In screen-page.tsx
const validateForm = useCallback(() => {
  let isValid = true;

  // Get all input components from screen
  const inputs = findAllInputs(screen.components);

  for (const input of inputs) {
    if (input.validation) {
      const fieldName = input.props?.name || input.id;
      const value = formState.values[fieldName];
      const error = validateField(value, input.validation);

      if (error) {
        setFormError(fieldName, error);
        isValid = false;
      }
    }
  }

  return isValid;
}, [screen, formState.values]);
```

---

## Next Steps

- **[Troubleshooting](./08-troubleshooting.md)** - Common issues and debugging
