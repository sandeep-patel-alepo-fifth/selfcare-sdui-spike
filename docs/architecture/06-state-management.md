# State Management with Zustand

This document covers the state management layer - how the Zustand store works and best practices for managing state in the SDUI framework.

## Table of Contents

1. [Overview](#overview)
2. [Store Structure](#store-structure)
3. [State Types](#state-types)
4. [Using the Store](#using-the-store)
5. [Form State](#form-state)
6. [Flow State](#flow-state)
7. [Best Practices](#best-practices)
8. [Exercises](#exercises)

---

## Overview

**File:** `src/lib/sdui/store.ts`

The SDUI framework uses Zustand for state management. Zustand was chosen for:

- **Simplicity**: No boilerplate (unlike Redux)
- **Performance**: Fine-grained subscriptions
- **Flexibility**: Works outside React components
- **Size**: Tiny bundle footprint

### The Store at a Glance

```typescript
const useSDUIStore = create<SDUIStore>((set, get) => ({
  // Application context (user, tenant)
  context: { user: mockUser, tenant: mockTenant },
  setContext: (ctx) => set((s) => ({ context: { ...s.context, ...ctx } })),

  // Screen-local state (resets on navigation)
  screenState: {},
  setScreenState: (updates) => set((s) => ({ screenState: { ...s.screenState, ...updates } })),

  // Persistent state (survives navigation)
  state: {},
  setState: (updates) => set((s) => ({ state: { ...s.state, ...updates } })),

  // Form state
  formState: { values: {}, errors: {}, touched: {} },
  setFormValue: (field, value) => { /* ... */ },

  // Flow state
  currentFlow: null,
  currentStep: 0,
  nextStep: () => { /* ... */ },

  // Modal state
  activeModals: [],
  openModal: (id, data) => { /* ... */ },

  // Loading state
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

---

## Store Structure

### State Categories

The store manages five categories of state:

| Category | Persists? | Purpose |
|----------|-----------|---------|
| `context` | Session | User data, tenant config |
| `state` | Across screens | Persistent app state |
| `screenState` | Current screen only | Screen-local state |
| `formState` | Current form | Form values and errors |
| `apiData` | Until cleared | API response cache |

### Visual Hierarchy

```
SDUIStore
├── context          # Read-mostly user/tenant data
│   ├── user
│   └── tenant
│
├── state            # Persistent state across screens
│   └── {...}        # Any app-wide state
│
├── screenState      # Resets on screen change
│   └── {...}        # Screen-specific state
│
├── formState        # Form management
│   ├── values       # Field values
│   ├── errors       # Validation errors
│   └── touched      # Which fields were touched
│
├── apiData          # API response cache
│   └── {...}        # Keyed by resultKey
│
├── currentFlow      # Multi-step flow data
├── currentStep      # Current step index
│
├── activeModals[]   # Modal stack
│
└── screens{}        # Screen cache
```

---

## State Types

### Context State

User and tenant data that rarely changes:

```typescript
interface SDUIContextData {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    plan?: {
      type: "prepaid" | "postpaid";
      name: string;
      price: number;
    };
    usage?: {
      data: { used: number; total: number; unit: string };
      voice: { used: number; total: number; unit: string };
      sms: { used: number; total: number; unit: string };
    };
    balance?: number;
  };
  tenant?: {
    id: string;
    name: string;
    logo?: string;
    theme?: string;
  };
  [key: string]: unknown;  // Extensible
}
```

**Usage:**
```typescript
// In component
const { context, setContext } = useSDUIStore();

// In schema
props: {
  text: "Hello, {{user.firstName}}!"
}
```

### Screen State vs Persistent State

**Screen State** - Resets when navigating:
```typescript
// Good for: tabs, toggles, temporary UI state
screenState: {
  activeTab: "overview",
  showFilters: false,
  sortOrder: "desc"
}
```

**Persistent State** - Survives navigation:
```typescript
// Good for: user preferences, flow data, selected items
state: {
  selectedPlanId: "plan-123",
  onboardingData: { step1: {...}, step2: {...} },
  recentSearches: ["data", "billing"]
}
```

### Form State

```typescript
interface SDUIFormState {
  values: Record<string, unknown>;  // { email: "...", phone: "..." }
  errors: Record<string, string>;   // { email: "Invalid email" }
  touched: Record<string, boolean>; // { email: true, phone: false }
}
```

---

## Using the Store

### In React Components

```typescript
"use client";

import { useSDUIStore } from "@/lib/sdui/store";

function MyComponent() {
  // Select specific state
  const user = useSDUIStore((state) => state.context.user);
  const setScreenState = useSDUIStore((state) => state.setScreenState);

  // Use in component
  return (
    <div>
      <p>Hello, {user?.firstName}</p>
      <button onClick={() => setScreenState({ showModal: true })}>
        Open Modal
      </button>
    </div>
  );
}
```

### Selective Subscriptions

Zustand re-renders only when selected state changes:

```typescript
// Good - only re-renders when user changes
const user = useSDUIStore((state) => state.context.user);

// Bad - re-renders on ANY state change
const store = useSDUIStore();
```

### Multiple Selections

```typescript
// Select multiple values
const { user, tenant } = useSDUIStore((state) => ({
  user: state.context.user,
  tenant: state.context.tenant,
}));

// Or use shallow comparison for objects
import { shallow } from "zustand/shallow";

const { user, tenant } = useSDUIStore(
  (state) => ({ user: state.context.user, tenant: state.context.tenant }),
  shallow
);
```

### Outside React Components

```typescript
// Get current state
const currentUser = useSDUIStore.getState().context.user;

// Update state
useSDUIStore.getState().setScreenState({ loading: true });

// Subscribe to changes
const unsubscribe = useSDUIStore.subscribe(
  (state) => state.context.user,
  (user) => console.log("User changed:", user)
);
```

---

## Form State

### How Form State Works

The renderer automatically wires input components to form state:

```typescript
// In renderer.tsx
const inputProps = useMemo(() => {
  if (!["input", "select", "checkbox"].includes(node.type)) return {};

  const fieldName = node.props?.name || node.id;
  return {
    value: formState.values[fieldName] ?? "",
    error: formState.errors[fieldName],
    onChange: (e) => setFormValue(fieldName, e.target.value),
  };
}, [node, formState]);
```

### Form Actions

**Set a single field:**
```typescript
setFormValue("email", "user@example.com");
```

**Set multiple fields:**
```typescript
setFormValues({
  email: "user@example.com",
  phone: "555-1234"
});
```

**Set an error:**
```typescript
setFormError("email", "Invalid email format");
```

**Mark as touched:**
```typescript
setFormTouched("email");
```

**Reset form:**
```typescript
resetForm();  // Clears values, errors, and touched
```

### Form State in Schemas

Actions can access and modify form state:

```typescript
// Access form value in action
actions: [
  {
    trigger: "click",
    type: "apiCall",
    payload: {
      endpoint: "/api/register",
      body: {
        email: "{{form.email}}",
        phone: "{{form.phone}}"
      }
    }
  }
]

// Update form field via action
actions: [
  {
    trigger: "click",
    type: "setField",
    payload: {
      field: "country",
      value: "US"
    }
  }
]
```

---

## Flow State

For multi-step processes like onboarding.

### Flow Structure

```typescript
interface Flow {
  id: string;
  steps: FlowStep[];
  initialStep?: string;
  onComplete?: Action[];
}

interface FlowStep {
  id: string;
  screenId: string;
  title?: string;
  conditions?: RenderCondition;
  onEnter?: Action[];
  onExit?: Action[];
}
```

### Flow Actions

```typescript
// Start a flow
setCurrentFlow(onboardingFlow);

// Navigate steps
nextStep();     // currentStep + 1
prevStep();     // currentStep - 1
setCurrentStep(2);  // Go to specific step

// End flow
setCurrentFlow(null);
```

### Flow in Schemas

```typescript
// Next step button
{
  type: "button",
  props: { text: "Continue" },
  actions: [
    { trigger: "click", type: "nextStep" }
  ]
}

// Previous step button
{
  type: "button",
  props: { text: "Back" },
  actions: [
    { trigger: "click", type: "prevStep" }
  ]
}

// Skip to specific step
{
  type: "button",
  props: { text: "Skip to Review" },
  actions: [
    { trigger: "click", type: "goToStep", payload: { step: 3 } }
  ]
}
```

### Storing Flow Data

Use persistent state to store data across flow steps:

```typescript
// Step 1: Store personal info
actions: [
  {
    trigger: "click",
    type: "setPersistentState",
    payload: {
      onboardingData: {
        ...state.onboardingData,
        personalInfo: {
          firstName: "{{form.firstName}}",
          lastName: "{{form.lastName}}"
        }
      }
    }
  },
  { trigger: "click", type: "nextStep" }
]

// Step 3: Access all collected data
props: {
  firstName: "{{state.onboardingData.personalInfo.firstName}}",
  planId: "{{state.onboardingData.selectedPlan.id}}"
}
```

---

## Modal State

### Modal Stack

Modals are managed as a stack (LIFO):

```typescript
activeModals: [
  { id: "confirm-dialog", data: { title: "Confirm?" } },
  { id: "details-modal", data: { itemId: "123" } }  // Top of stack
]
```

### Modal Actions

```typescript
// Open modal
openModal("confirm-dialog", { itemId: "123" });

// Close specific modal
closeModal("confirm-dialog");

// Close topmost modal
closeModal();  // No ID = pop from stack
```

### Modal in Schemas

```typescript
// Open modal
{
  type: "button",
  props: { text: "Delete" },
  actions: [
    {
      trigger: "click",
      type: "openModal",
      payload: {
        modalId: "confirm-delete",
        data: { itemId: "{{state.selectedItemId}}" }
      }
    }
  ]
}

// Close modal (from within modal)
{
  type: "button",
  props: { text: "Cancel" },
  actions: [
    { trigger: "click", type: "closeModal" }
  ]
}
```

---

## Best Practices

### 1. Use the Right State Type

| Use Case | State Type |
|----------|------------|
| User session data | `context` |
| Tab selection | `screenState` |
| Selected item for multi-screen flow | `state` |
| Form input values | `formState` |
| API response | `apiData` |

### 2. Keep State Minimal

```typescript
// Good - store only what you need
screenState: { selectedTab: "billing" }

// Avoid - storing derived data
screenState: {
  selectedTab: "billing",
  isBillingSelected: true,  // Redundant
  tabCount: 3               // Can be computed
}
```

### 3. Use Selective Subscriptions

```typescript
// Good - specific selection
const user = useSDUIStore((s) => s.context.user);

// Avoid - entire store
const store = useSDUIStore();
```

### 4. Initialize Screen State

When a screen has `initialState`, it's applied on mount:

```typescript
// In schema
{
  id: "dashboard",
  initialState: {
    activeTab: "overview",
    showWelcome: true
  },
  components: [...]
}
```

The `ScreenPage` component handles this:

```typescript
useEffect(() => {
  if (screen?.initialState) {
    initializeScreenState(screen.initialState);
  }
}, [screen]);
```

### 5. Clean Up on Navigation

Screen state resets automatically, but you may need to clean persistent state:

```typescript
// Before navigating away
actions: [
  {
    trigger: "click",
    type: "setPersistentState",
    payload: { temporaryData: null }
  },
  {
    trigger: "click",
    type: "navigate",
    payload: { route: "/" }
  }
]
```

### 6. Debug with Store Inspection

```typescript
// In browser console
console.log(useSDUIStore.getState());

// Or add to window for easy access
if (typeof window !== "undefined") {
  window.sduiStore = useSDUIStore;
}
// Then: sduiStore.getState()
```

---

## Exercises

### Exercise 1: Add a Toast Queue

Extend the store to manage a toast notification queue:

```typescript
interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
}

// Add to store
toasts: Toast[];
addToast: (toast: Omit<Toast, "id">) => void;
removeToast: (id: string) => void;
```

### Exercise 2: Add Undo/Redo

Implement undo/redo for state changes:

```typescript
history: {
  past: State[];
  future: State[];
};
undo: () => void;
redo: () => void;
```

### Exercise 3: Persist State to localStorage

Add persistence for user preferences:

```typescript
// Use zustand/middleware
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      preferences: { theme: "light" },
      setPreferences: (prefs) => set({ preferences: prefs }),
    }),
    { name: "sdui-preferences" }
  )
);
```

### Exercise 4: Add State Selectors

Create reusable selectors:

```typescript
// selectors.ts
export const selectUser = (state: SDUIStore) => state.context.user;
export const selectIsAuthenticated = (state: SDUIStore) => !!state.context.user;
export const selectFormValue = (field: string) =>
  (state: SDUIStore) => state.formState.values[field];

// Usage
const user = useSDUIStore(selectUser);
const email = useSDUIStore(selectFormValue("email"));
```

---

## Next Steps

- **[Extending](./07-extending.md)** - Implementing unfinished features
- **[Troubleshooting](./08-troubleshooting.md)** - Common issues and solutions
