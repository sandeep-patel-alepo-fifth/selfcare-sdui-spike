# Architecture Overview

This document provides a mental model for understanding the selfcare-sdui-spike project - a Server-Driven UI (SDUI) framework for telecommunications self-care applications.

## Table of Contents

1. [What is Server-Driven UI?](#what-is-server-driven-ui)
2. [The Big Picture](#the-big-picture)
3. [Core Concepts](#core-concepts)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
6. [Project Structure](#project-structure)
7. [Key Design Decisions](#key-design-decisions)

---

## What is Server-Driven UI?

Server-Driven UI (SDUI) is an architectural pattern where the server controls what the UI displays by sending structured data (usually JSON) that describes the interface. The client interprets this data and renders the appropriate components.

### Traditional vs SDUI Approach

**Traditional Approach:**
```
Server: "Here's user data: {name: 'John', balance: 100}"
Client: "I'll render my hardcoded Dashboard component with this data"
```

**SDUI Approach:**
```
Server: "Render a Card with a Heading showing {{user.name}}, then a Text showing {{user.balance|currency}}"
Client: "I'll interpret this schema and render whatever components you specify"
```

### Why SDUI?

1. **Instant Updates**: Change the UI without deploying new client code
2. **A/B Testing**: Serve different screen layouts to different users
3. **Multi-tenant**: Different customers get different UIs from the same codebase
4. **Rapid Iteration**: Product teams can modify screens without engineering releases
5. **Consistency**: Single source of truth for UI across platforms

### The Trade-off

SDUI adds complexity. You're essentially building a mini-framework that interprets schemas. This is worthwhile when:
- You need frequent UI changes without deployments
- You support multiple tenants with different requirements
- You want non-engineers to modify screens

It's overkill when:
- Your UI rarely changes
- You have a single tenant
- You prioritize development speed over flexibility

---

## The Big Picture

Here's how the system works at a high level:

```
┌─────────────────────────────────────────────────────────────────────┐
│                           DATABASE                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Screens  │  │  Flows   │  │  Themes  │  │ Tenants  │            │
│  │  (JSON)  │  │  (JSON)  │  │  (JSON)  │  │ (config) │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
└───────┼─────────────┼─────────────┼─────────────┼───────────────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Routes    │
                    │ /api/screens/x  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   ScreenPage    │
                    │   Component     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌────────▼────────┐   ┌──────▼──────┐
│ Zustand Store │   │ Screen Renderer │   │   Context   │
│  (state mgmt) │   │  (interprets)   │   │ (user data) │
└───────┬───────┘   └────────┬────────┘   └──────┬──────┘
        │                    │                   │
        └────────────────────┼───────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
      ┌───────▼───────┐ ┌────▼────┐ ┌──────▼──────┐
      │  Conditions   │ │  Data   │ │   Actions   │
      │  Evaluator    │ │ Binding │ │ Dispatcher  │
      └───────┬───────┘ └────┬────┘ └──────┬──────┘
              │              │             │
              └──────────────┼─────────────┘
                             │
                    ┌────────▼────────┐
                    │    Component    │
                    │    Registry     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  React Render   │
                    │   (actual UI)   │
                    └─────────────────┘
```

### The Flow in Words

1. **User visits a page** (e.g., `/dashboard`)
2. **Page component requests screen schema** from API
3. **API returns JSON schema** describing the UI structure
4. **ScreenRenderer processes the schema:**
   - Evaluates conditions (should this component render?)
   - Resolves data bindings (replace `{{user.name}}` with "John")
   - Creates action handlers (what happens on click?)
5. **Component Registry maps types to React components**
6. **React renders the actual UI**
7. **User interacts** → Actions fire → State updates → Re-render

---

## Core Concepts

### 1. Screen Schema

A Screen is a JSON document that describes a page's UI:

```typescript
{
  version: "1.0",
  id: "dashboard",
  type: "screen",
  meta: { title: "Dashboard", requiresAuth: true },
  layout: { type: "grid", columns: 12, gap: 8 },
  components: [
    // Array of component nodes (the actual UI structure)
  ],
  initialState: { showModal: false }
}
```

### 2. Component Node

Each component in the tree is a node with this structure:

```typescript
{
  id: "greeting",           // Unique identifier
  type: "heading",          // Component type (maps to registry)
  props: {                  // Props passed to the component
    text: "Hello, {{user.firstName}}",
    level: 2
  },
  className: "mb-4",        // CSS classes
  conditions: {...},        // When to render
  actions: [...],           // What happens on interaction
  dataBinding: {...},       // Dynamic data sources
  children: [...]           // Nested components
}
```

### 3. Data Binding

Data binding connects component props to runtime data:

```typescript
// Template strings - inline in props
props: { text: "Balance: {{user.balance|currency}}" }

// Data binding objects - more control
dataBinding: {
  value: {
    source: "form",        // context | state | form | api
    path: "email",         // dot notation path
    transform: "lowercase", // optional transform
    fallback: ""           // default value
  }
}
```

### 4. Conditions

Conditions control when components render:

```typescript
// Simple condition
conditions: {
  field: "user.plan.type",
  operator: "eq",
  value: "postpaid"
}

// Complex conditions (AND/OR groups)
conditions: {
  operator: "and",
  conditions: [
    { field: "user.isVerified", operator: "eq", value: true },
    { field: "user.balance", operator: "gt", value: 0 }
  ]
}
```

### 5. Actions

Actions define what happens when users interact:

```typescript
actions: [
  {
    trigger: "click",       // click | submit | change | blur | focus
    type: "navigate",       // Action type
    payload: { route: "/plans" },
    condition: {...},       // Optional: only fire if condition met
    onSuccess: [...],       // Actions to run on success
    onError: [...]          // Actions to run on error
  }
]
```

### 6. Flows

Flows are multi-step processes (like onboarding):

```typescript
{
  id: "onboarding",
  type: "flow",
  steps: [
    { id: "welcome", screenId: "onboarding-welcome" },
    { id: "register", screenId: "onboarding-registration" },
    { id: "plan", screenId: "onboarding-plan-selection" }
  ],
  onComplete: [{ type: "navigate", payload: { route: "/dashboard" }}]
}
```

---

## Data Flow

Understanding data flow is crucial. Here's what happens for a single component:

```
┌─────────────────────────────────────────────────────────────┐
│                    RENDERING PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CONDITION CHECK                                          │
│     ┌─────────────┐     ┌──────────────────┐                │
│     │ conditions  │ ──▶ │ evaluateConditions│ ──▶ render?   │
│     └─────────────┘     └──────────────────┘                │
│                                                              │
│  2. DATA BINDING                                             │
│     ┌─────────────┐     ┌──────────────────┐                │
│     │ dataBinding │ ──▶ │ resolveBindings  │ ──▶ values     │
│     └─────────────┘     └──────────────────┘                │
│                                                              │
│  3. TEMPLATE RESOLUTION                                      │
│     ┌─────────────┐     ┌──────────────────┐                │
│     │   props     │ ──▶ │ resolveTemplates │ ──▶ props      │
│     └─────────────┘     └──────────────────┘                │
│                                                              │
│  4. ACTION HANDLERS                                          │
│     ┌─────────────┐     ┌──────────────────┐                │
│     │  actions    │ ──▶ │ createHandlers   │ ──▶ onClick,   │
│     └─────────────┘     └──────────────────┘     onChange   │
│                                                              │
│  5. COMPONENT LOOKUP                                         │
│     ┌─────────────┐     ┌──────────────────┐                │
│     │    type     │ ──▶ │ getComponent     │ ──▶ Component  │
│     └─────────────┘     └──────────────────┘                │
│                                                              │
│  6. RENDER                                                   │
│     ┌─────────────────────────────────────────────┐         │
│     │ <Component {...props} {...handlers}>        │         │
│     │   {children.map(child => render(child))}    │         │
│     │ </Component>                                 │         │
│     └─────────────────────────────────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Context Sources

Data comes from four sources:

| Source | Description | Example Path |
|--------|-------------|--------------|
| `context` | User/tenant data | `user.firstName`, `tenant.name` |
| `state` | Persistent + screen state | `state.selectedPlan` |
| `form` | Form field values | `form.email`, `form.phone` |
| `api` | API response data | `api.plans`, `api.result` |

---

## Technology Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Next.js 15** | React framework | App router, API routes, server components |
| **React 19** | UI library | Latest features, concurrent rendering |
| **TypeScript** | Type safety | Catch errors early, better DX |
| **Tailwind CSS 4** | Styling | Utility-first, fast prototyping |
| **Zustand** | State management | Simple, lightweight, no boilerplate |
| **Prisma** | Database ORM | Type-safe queries, great DX |
| **MongoDB** | Database | Flexible JSON storage for schemas |
| **Zod** | Validation | Runtime type checking, schema validation |

---

## Project Structure

```
src/
├── app/                      # Next.js app router
│   ├── api/                  # API routes
│   │   ├── screens/[screenId]/  # GET screen by ID
│   │   └── schemas/          # CRUD for schemas
│   ├── dashboard/            # Dashboard page
│   ├── onboarding/           # Onboarding flow page
│   └── admin/                # Admin panel
│
├── components/
│   ├── sdui/                 # SDUI-specific components
│   │   └── screen-page.tsx   # Screen rendering wrapper
│   └── ui/                   # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
│
├── lib/
│   ├── sdui/                 # SDUI Framework Core
│   │   ├── renderer.tsx      # Dynamic component renderer
│   │   ├── component-registry.tsx  # Type-to-component mapping
│   │   ├── action-dispatcher.ts    # Action execution
│   │   ├── condition-evaluator.ts  # Condition logic
│   │   ├── data-binding.ts   # Template resolution
│   │   ├── store.ts          # Zustand state store
│   │   └── schemas/          # Mock screen definitions
│   ├── db/
│   │   └── prisma.ts         # Prisma client
│   └── utils/
│       └── cn.ts             # Class name utility
│
├── types/
│   └── sdui.ts               # TypeScript + Zod schemas
│
prisma/
└── schema.prisma             # Database models
```

---

## Key Design Decisions

### Why Zustand over Redux?

Zustand was chosen for its simplicity. Compare:

```typescript
// Zustand - minimal boilerplate
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));

// Redux - more ceremony
// actions.ts, reducers.ts, store.ts, selectors.ts...
```

For this project's needs (screen state, form state, modal state), Zustand provides enough power without the complexity.

### Why MongoDB?

Screen schemas are JSON documents. MongoDB stores JSON natively, making it natural to:
- Store complete screen schemas as documents
- Query by tenant, tags, or any field
- Support schema evolution without migrations

Relational databases would work, but you'd serialize/deserialize JSON constantly.

### Why Template Strings AND Data Binding?

Both exist because they serve different needs:

**Template strings** are simple and readable:
```typescript
text: "Hello, {{user.firstName}}!"
```

**Data binding** offers more control:
```typescript
dataBinding: {
  userName: {
    source: "context",
    path: "user.firstName",
    transform: "uppercase",
    fallback: "Guest"
  }
}
```

Use template strings for simple cases, data binding when you need transforms or fallbacks.

### Why Safe Expression Evaluation?

The `data-binding.ts` file includes a custom safe expression parser instead of using JavaScript's built-in code execution methods. This custom parser:

- Parses arithmetic: `{{state.count + 1}}`
- Parses ternaries: `{{user.isActive ? 'Active' : 'Inactive'}}`
- Parses comparisons: `{{user.balance > 100}}`

The custom parser prevents code injection vulnerabilities while still allowing useful expressions. See `safeEvaluateExpression()` in `data-binding.ts` for the implementation.

---

## Next Steps

Now that you understand the big picture:

1. **[Getting Started](./01-getting-started.md)** - Set up your development environment
2. **[SDUI Core](./02-sdui-core.md)** - Deep dive into the renderer
3. **[Actions System](./03-actions-system.md)** - How actions work
4. **[Components](./04-components.md)** - Building new components
5. **[API Layer](./05-api-layer.md)** - Backend and database
6. **[State Management](./06-state-management.md)** - Zustand patterns
7. **[Extending](./07-extending.md)** - Future features
8. **[Troubleshooting](./08-troubleshooting.md)** - Common issues

---

## Quick Reference

### File Locations

| What | Where |
|------|-------|
| Add a new screen | `src/lib/sdui/schemas/` or database |
| Add a new component | `src/components/ui/` + register in `component-registry.tsx` |
| Add a new action type | `src/lib/sdui/action-dispatcher.ts` |
| Add a new transform | `src/lib/sdui/data-binding.ts` |
| Add a new condition operator | `src/lib/sdui/condition-evaluator.ts` |
| Add a new API route | `src/app/api/` |
| Modify state structure | `src/lib/sdui/store.ts` |
| Add new types | `src/types/sdui.ts` |

### Common Tasks

| Task | Steps |
|------|-------|
| Create a new page | 1. Create screen schema, 2. Add to mock screens or DB, 3. Create page component using `ScreenPage` |
| Add form validation | Add `validation` array to input component nodes |
| Show/hide based on data | Add `conditions` to component node |
| Navigate on click | Add action with `type: "navigate"` |
| Call API on click | Add action with `type: "apiCall"` |
