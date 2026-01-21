# Troubleshooting Guide

This document covers common issues and how to debug them.

## Table of Contents

1. [Debugging Basics](#debugging-basics)
2. [Common Issues](#common-issues)
3. [Error Messages](#error-messages)
4. [Performance Issues](#performance-issues)
5. [Development Tips](#development-tips)

---

## Debugging Basics

### Browser DevTools

**Console Tab:**
- Check for errors and warnings
- Look for "Unknown component type" warnings
- Look for action execution errors

**React DevTools:**
- Inspect component props
- Check component hierarchy
- Watch state changes

**Network Tab:**
- Verify API calls to `/api/screens/`
- Check response payloads
- Look for failed requests

### Adding Debug Logging

**In renderer.tsx:**
```typescript
function DynamicComponent({ node, rendererProps }) {
  // Add at the start
  console.log(`Rendering: ${node.type} (${node.id})`, {
    props: node.props,
    conditions: node.conditions,
    shouldRender,
  });

  // ... rest of component
}
```

**In action-dispatcher.ts:**
```typescript
export async function executeAction(action, actionContext, event) {
  console.group(`Action: ${action.type}`);
  console.log("Trigger:", action.trigger);
  console.log("Payload:", action.payload);
  console.log("Resolved:", resolvedPayload);
  console.groupEnd();

  // ... rest of function
}
```

### Store Inspection

```typescript
// In browser console
const store = window.sduiStore?.getState();
console.log("Context:", store.context);
console.log("State:", store.state);
console.log("FormState:", store.formState);

// Add to window (in store.ts)
if (typeof window !== "undefined") {
  window.sduiStore = useSDUIStore;
}
```

---

## Common Issues

### 1. Component Not Rendering

**Symptoms:**
- Component doesn't appear
- No error in console

**Possible Causes:**

**A. Condition evaluates to false:**
```typescript
// Check the condition
conditions: {
  field: "user.plan.type",
  operator: "eq",
  value: "postpaid"  // Is user actually postpaid?
}
```

**Debug:**
```typescript
// In renderer.tsx
console.log("Condition result:", shouldRender, node.conditions);
```

**B. Component type not in registry:**
```typescript
// Check spelling
type: "buton"  // Wrong! Should be "button"
```

**C. Parent component doesn't render children:**
```typescript
// Some components need explicit children handling
{
  type: "container",
  children: [...]  // Make sure parent renders children
}
```

**D. Invalid JSON structure:**
```typescript
// Missing required fields
{
  // Missing id!
  type: "button",
  props: { text: "Click" }
}
```

### 2. Template String Not Resolving

**Symptoms:**
- See `{{user.name}}` literally instead of the value

**Possible Causes:**

**A. Path doesn't exist:**
```typescript
// Check the path exists
text: "{{user.fullName}}"  // Does context.user.fullName exist?
```

**Debug:**
```typescript
// In browser console
const ctx = window.sduiStore.getState().context;
console.log("User:", ctx.user);
```

**B. Wrong source:**
```typescript
// Trying to access state as context
text: "{{selectedPlan}}"  // Should be {{state.selectedPlan}}
```

**C. Syntax error:**
```typescript
// Common mistakes
text: "{{ user.name }}"   // Spaces inside braces
text: "{user.name}"       // Single braces
text: "{{user.name"       // Missing closing braces
```

### 3. Actions Not Firing

**Symptoms:**
- Click/submit does nothing
- No console errors

**Possible Causes:**

**A. Wrong trigger:**
```typescript
// Using submit trigger on a button (should be click)
{
  type: "button",
  actions: [
    { trigger: "submit", type: "navigate" }  // Wrong!
  ]
}
```

**B. Action has failing condition:**
```typescript
{
  trigger: "click",
  type: "navigate",
  condition: {
    field: "user.isPremium",
    operator: "eq",
    value: true  // User might not be premium
  }
}
```

**C. Missing payload:**
```typescript
// Navigate without route
{
  trigger: "click",
  type: "navigate",
  payload: {}  // Missing route!
}
```

**Debug:**
```typescript
// In action-dispatcher.ts
console.log("Executing action:", action.type, resolvedPayload);
```

### 4. Form State Not Updating

**Symptoms:**
- Input shows value but form.values is empty
- Form submission has empty data

**Possible Causes:**

**A. Missing name prop:**
```typescript
{
  type: "input",
  props: {
    // Missing name! Will use id as fallback
    placeholder: "Enter email"
  }
}
```

**B. Component not recognized as input:**
```typescript
// Only these types get auto-wired:
// "input", "textarea", "select", "checkbox", "switch", "otp"

// Custom input components need manual wiring
```

**Debug:**
```typescript
const formState = window.sduiStore.getState().formState;
console.log("Form values:", formState.values);
console.log("Form errors:", formState.errors);
```

### 5. API Call Failing

**Symptoms:**
- Network error in console
- onError actions fire

**Possible Causes:**

**A. Wrong endpoint:**
```typescript
payload: {
  endpoint: "/api/user"  // Does this endpoint exist?
}
```

**B. Missing body for POST:**
```typescript
{
  type: "apiCall",
  payload: {
    endpoint: "/api/submit",
    method: "POST"
    // Missing body!
  }
}
```

**C. CORS issues:**
- Check if API allows requests from your origin
- Check browser Network tab for CORS errors

**Debug:**
```typescript
// In screen-page.tsx callApi function
console.log("API call:", endpoint, options);
```

### 6. State Not Persisting

**Symptoms:**
- State resets on navigation
- Data lost between screens

**Cause:**
Using `setState` (screen-local) instead of `setPersistentState`:

```typescript
// This resets on navigation
{ type: "setState", payload: { selectedPlan: "..." } }

// This persists
{ type: "setPersistentState", payload: { selectedPlan: "..." } }
```

### 7. TypeScript Errors After Adding Component

**Symptoms:**
- Red squiggles in editor
- Build fails with type error

**Fix:**
Add the type to `ComponentTypeSchema` in `src/types/sdui.ts`:

```typescript
export const ComponentTypeSchema = z.enum([
  // ... existing types
  "myNewComponent",  // Add here!
]);
```

---

## Error Messages

### "Unknown component type: xyz"

**Meaning:** Component type not in registry.

**Fix:**
1. Check spelling in schema
2. Add to `componentRegistry` in `component-registry.tsx`
3. Add type to `ComponentTypeSchema` in `sdui.ts`

### "Unknown action type: xyz"

**Meaning:** Action type not implemented.

**Fix:**
1. Check spelling in schema
2. Add handler in `action-dispatcher.ts` switch statement
3. Add type to `ActionTypeSchema` in `sdui.ts`

### "Unknown condition operator: xyz"

**Meaning:** Condition operator not implemented.

**Fix:**
1. Check spelling (e.g., "equals" should be "eq")
2. Add handler in `condition-evaluator.ts`
3. Add to `ConditionOperatorSchema` in `sdui.ts`

### "Unknown transform: xyz"

**Meaning:** Transform function not found.

**Fix:**
1. Check spelling in template string
2. Add to `transforms` object in `data-binding.ts`

### "Screen not found"

**Meaning:** Screen ID doesn't exist in database or mocks.

**Fix:**
1. Check screen ID spelling
2. Verify screen exists in `mockScreens` or database
3. Check if screen is active (`isActive: true`)

### "Database not available"

**Meaning:** Can't connect to MongoDB.

**Fix:**
1. Check `DATABASE_URL` in `.env`
2. Ensure MongoDB is running
3. Run `npm run db:push` if schema changed

### Prisma Error P2002

**Meaning:** Unique constraint violation.

**Fix:**
- The `screenId` or similar unique field already exists
- Use a different ID or update the existing record

### Prisma Error P2025

**Meaning:** Record not found.

**Fix:**
- The record you're trying to update/delete doesn't exist
- Check the ID is correct

---

## Performance Issues

### Slow Initial Render

**Causes:**
- Large screen schema
- Many nested components
- Complex conditions

**Solutions:**

1. **Simplify nesting:**
```typescript
// Instead of deeply nested
{ type: "container", children: [{ type: "container", children: [...] }] }

// Flatten where possible
{ type: "container", children: [...] }
```

2. **Lazy load heavy components:**
```typescript
// In component-registry.tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/ui/chart"), {
  loading: () => <Skeleton />,
});
```

### Frequent Re-renders

**Causes:**
- Subscribing to entire store
- Unstable action handlers
- Missing memoization

**Solutions:**

1. **Selective subscriptions:**
```typescript
// Bad
const store = useSDUIStore();

// Good
const user = useSDUIStore((s) => s.context.user);
```

2. **Stable selectors:**
```typescript
import { shallow } from "zustand/shallow";

const { user, tenant } = useSDUIStore(
  (s) => ({ user: s.context.user, tenant: s.context.tenant }),
  shallow
);
```

### Large Bundle Size

**Causes:**
- Importing entire icon library
- Loading all components upfront

**Solutions:**

1. **Tree-shake icons:**
```typescript
// Bad
import * as Icons from "lucide-react";

// Good
import { Home, Settings, User } from "lucide-react";
```

2. **Code split by route:**
Next.js does this automatically for pages.

---

## Development Tips

### 1. Use Mock Data

The app works without a database:

```typescript
// Mock screens in src/lib/sdui/schemas/
export const myScreen: Screen = {
  // Define screen here
};

// Add to mockScreens in API route
const mockScreens = {
  "my-screen": myScreen,
};
```

### 2. Hot Reload

Edit schema files and see changes instantly - no refresh needed.

### 3. Prisma Studio

Visual database editor:

```bash
npm run db:studio
```

### 4. React DevTools

Install the browser extension to:
- Inspect component props
- See component hierarchy
- Profile renders

### 5. VS Code Snippets

Create snippets for common patterns:

```json
// .vscode/snippets.code-snippets
{
  "SDUI Component": {
    "prefix": "sduicomp",
    "body": [
      "{",
      "  id: \"$1\",",
      "  type: \"$2\",",
      "  props: {",
      "    $3",
      "  }",
      "}"
    ]
  }
}
```

### 6. Schema Validation

Validate schemas before using:

```typescript
import { ScreenSchema } from "@/types/sdui";

const result = ScreenSchema.safeParse(mySchema);
if (!result.success) {
  console.error("Invalid schema:", result.error.errors);
}
```

### 7. Test Actions Interactively

Add a test button to try actions:

```typescript
{
  id: "debug-button",
  type: "button",
  props: { text: "Debug", variant: "outline" },
  actions: [
    {
      trigger: "click",
      type: "showToast",
      payload: {
        type: "info",
        message: "Current state: {{state|json}}"
      }
    }
  ]
}
```

---

## Getting Help

1. **Check this documentation** - Most issues are covered here
2. **Search the codebase** - Use grep/search for similar patterns
3. **Add debug logging** - Console.log is your friend
4. **Simplify** - Remove complexity until it works, then add back
5. **Check types** - TypeScript errors often point to the issue

---

## Checklist for New Features

When adding a new feature, verify:

- [ ] Types added to `sdui.ts`
- [ ] Component added to registry (if new component)
- [ ] Action handler added (if new action)
- [ ] Condition operator added (if new operator)
- [ ] Transform added (if new transform)
- [ ] API route created (if new endpoint)
- [ ] Database model created (if new entity)
- [ ] Works without database (mock fallback)
- [ ] TypeScript compiles without errors
- [ ] Works in development mode
- [ ] Works in production build
