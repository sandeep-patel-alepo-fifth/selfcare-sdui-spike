# Actions System

This document explains how the action system works - the mechanism that handles user interactions like clicks, form submissions, and state changes.

## Table of Contents

1. [Overview](#overview)
2. [Action Structure](#action-structure)
3. [Action Types](#action-types)
4. [Triggers](#triggers)
5. [Action Execution Flow](#action-execution-flow)
6. [Conditional Actions](#conditional-actions)
7. [Action Chains](#action-chains)
8. [Adding Custom Actions](#adding-custom-actions)
9. [Best Practices](#best-practices)
10. [Exercises](#exercises)

---

## Overview

Actions define what happens when users interact with components. They're declarative - you describe what should happen, not how to do it.

**File:** `src/lib/sdui/action-dispatcher.ts`

### Example Action

```typescript
{
  id: "submit-button",
  type: "button",
  props: { text: "Submit" },
  actions: [
    {
      trigger: "click",
      type: "showToast",
      payload: {
        type: "success",
        title: "Submitted!",
        message: "Your form has been submitted."
      }
    }
  ]
}
```

When the button is clicked, a success toast appears.

---

## Action Structure

Every action has this structure:

```typescript
interface Action {
  id?: string;                              // Optional identifier
  trigger: ActionTrigger;                   // When to fire
  type: ActionType;                         // What to do
  payload?: Record<string, unknown>;        // Data for the action
  condition?: RenderCondition | ConditionGroup;  // Optional guard
  onSuccess?: Action[];                     // Actions on success
  onError?: Action[];                       // Actions on failure
}
```

### Triggers

```typescript
type ActionTrigger =
  | "click"    // Mouse click / tap
  | "submit"   // Form submission
  | "change"   // Input value change
  | "blur"     // Focus lost
  | "focus"    // Focus gained
  | "mount"    // Component mounted (not yet implemented)
  | "unmount"; // Component unmounted (not yet implemented)
```

### Action Types

```typescript
type ActionType =
  | "navigate"           // Go to a route
  | "navigateBack"       // Go back
  | "apiCall"            // Call an API
  | "setState"           // Update screen state
  | "setPersistentState" // Update persistent state
  | "setField"           // Update a form field
  | "showToast"          // Show a notification
  | "openModal"          // Open a modal
  | "closeModal"         // Close a modal
  | "nextStep"           // Go to next flow step
  | "prevStep"           // Go to previous step
  | "goToStep"           // Go to specific step
  | "submit"             // Submit the form
  | "validate"           // Validate the form
  | "custom";            // Custom handler
```

---

## Action Types

### navigate

Navigate to a different route.

```typescript
{
  trigger: "click",
  type: "navigate",
  payload: {
    route: "/dashboard",    // Required: destination route
    replace: false          // Optional: replace vs push (default: false)
  }
}
```

**With dynamic route:**
```typescript
{
  trigger: "click",
  type: "navigate",
  payload: {
    route: "/users/{{user.id}}"  // Template string resolved at runtime
  }
}
```

**With replace (no back button):**
```typescript
{
  trigger: "click",
  type: "navigate",
  payload: {
    route: "/login",
    replace: true  // Can't go back
  }
}
```

### navigateBack

Go back to the previous page.

```typescript
{
  trigger: "click",
  type: "navigateBack"
  // No payload needed
}
```

### setState

Update screen-local state (resets when screen changes).

```typescript
{
  trigger: "click",
  type: "setState",
  payload: {
    selectedTab: "billing",
    showDetails: true
  }
}
```

**With dynamic values:**
```typescript
{
  trigger: "click",
  type: "setState",
  payload: {
    selectedPlan: "{{api.plans[0].id}}"
  }
}
```

### setPersistentState

Update state that survives across screens.

```typescript
{
  trigger: "click",
  type: "setPersistentState",
  payload: {
    onboardingComplete: true,
    selectedPlanId: "plan-123"
  }
}
```

**Use Case:** Store data needed in later screens (e.g., during onboarding flow).

### setField

Update a specific form field value.

```typescript
{
  trigger: "click",
  type: "setField",
  payload: {
    field: "country",     // Field name
    value: "US"           // New value
  }
}
```

**Use Case:** Pre-fill form fields, clear inputs, or set defaults.

### showToast

Display a toast notification.

```typescript
{
  trigger: "click",
  type: "showToast",
  payload: {
    type: "success",           // success | error | warning | info | default
    title: "Success!",         // Optional: toast title
    message: "Operation done"  // Toast message
  }
}
```

**Types and Styling:**

| Type | Use Case |
|------|----------|
| `success` | Operation completed successfully |
| `error` | Something went wrong |
| `warning` | Needs attention |
| `info` | Informational message |
| `default` | Neutral notification |

### openModal

Open a modal dialog.

```typescript
{
  trigger: "click",
  type: "openModal",
  payload: {
    modalId: "confirm-delete",
    data: {
      itemId: "{{selectedItem.id}}",
      itemName: "{{selectedItem.name}}"
    }
  }
}
```

**Note:** The modal component needs to exist and listen for this modal ID.

### closeModal

Close a modal dialog.

```typescript
// Close a specific modal
{
  trigger: "click",
  type: "closeModal",
  payload: {
    modalId: "confirm-delete"
  }
}

// Close the topmost modal
{
  trigger: "click",
  type: "closeModal"
  // No payload = close the most recent modal
}
```

### nextStep / prevStep / goToStep

Navigate multi-step flows.

```typescript
// Go to next step
{
  trigger: "click",
  type: "nextStep"
}

// Go to previous step
{
  trigger: "click",
  type: "prevStep"
}

// Go to specific step (0-indexed)
{
  trigger: "click",
  type: "goToStep",
  payload: {
    step: 2
  }
}
```

**Note:** These only work within a flow context (FlowPage component).

### submit

Trigger form submission.

```typescript
{
  trigger: "click",
  type: "submit"
  // Calls the submitForm handler from ScreenPage
}
```

### validate

Validate the current form.

```typescript
{
  trigger: "blur",
  type: "validate"
  // Returns true if no errors, false otherwise
}
```

### apiCall

Make an API request.

```typescript
{
  trigger: "click",
  type: "apiCall",
  payload: {
    endpoint: "/api/users/{{user.id}}",
    method: "GET",                    // GET | POST | PUT | DELETE
    body: {                           // For POST/PUT
      name: "{{form.name}}",
      email: "{{form.email}}"
    },
    headers: {                        // Optional headers
      "X-Custom-Header": "value"
    },
    resultKey: "userData"             // Store result in api.userData
  },
  onSuccess: [
    {
      trigger: "click",  // Trigger is inherited but required
      type: "showToast",
      payload: { type: "success", message: "Data loaded!" }
    }
  ],
  onError: [
    {
      trigger: "click",
      type: "showToast",
      payload: { type: "error", message: "Failed to load data" }
    }
  ]
}
```

**Key Points:**
- `endpoint` can use template strings
- `resultKey` stores the response in `apiData` for later use
- `onSuccess` and `onError` are action chains that run based on result

### custom

Execute a custom handler function.

```typescript
{
  trigger: "click",
  type: "custom",
  payload: {
    handler: "handleSpecialAction",  // Handler name
    someData: "{{user.id}}"          // Additional data
  }
}
```

**To use custom handlers:**

1. Define the handler in your page component:

```typescript
// In ScreenPage or a wrapper component
const customHandlers = {
  handleSpecialAction: async (payload) => {
    console.log("Custom action!", payload);
    // Do something special
  }
};

// Pass to ScreenRenderer
<ScreenRenderer
  // ... other props
  customHandlers={customHandlers}
/>
```

---

## Triggers

Triggers determine when actions fire.

### click

Fires on mouse click or touch tap.

```typescript
{
  trigger: "click",
  type: "navigate",
  payload: { route: "/dashboard" }
}
```

### submit

Fires on form submission (typically from a form element).

```typescript
{
  trigger: "submit",
  type: "apiCall",
  payload: {
    endpoint: "/api/register",
    method: "POST",
    body: { email: "{{form.email}}" }
  }
}
```

### change

Fires when an input value changes.

```typescript
{
  trigger: "change",
  type: "setState",
  payload: {
    searchQuery: "{{form.search}}"
  }
}
```

**Use Case:** Live search, dynamic filtering, dependent dropdowns.

### blur

Fires when an element loses focus.

```typescript
{
  trigger: "blur",
  type: "validate"
}
```

**Use Case:** Validate field when user moves away.

### focus

Fires when an element gains focus.

```typescript
{
  trigger: "focus",
  type: "setState",
  payload: { inputFocused: true }
}
```

---

## Action Execution Flow

**File:** `src/lib/sdui/action-dispatcher.ts`

### Creating Handlers

```typescript
export function createActionHandlers(
  actions: Action[] | undefined,
  actionContext: ActionContext
): Record<string, (event?: unknown) => void> {
  if (!actions || actions.length === 0) return {};

  const handlers: Record<string, (event?: unknown) => void> = {};

  // Group actions by trigger
  const actionsByTrigger = actions.reduce((acc, action) => {
    const trigger = action.trigger;
    if (!acc[trigger]) acc[trigger] = [];
    acc[trigger].push(action);
    return acc;
  }, {} as Record<string, Action[]>);

  // Map triggers to React event handlers
  const triggerToHandler: Record<string, string> = {
    click: "onClick",
    submit: "onSubmit",
    change: "onChange",
    blur: "onBlur",
    focus: "onFocus",
  };

  for (const [trigger, triggerActions] of Object.entries(actionsByTrigger)) {
    const handlerName = triggerToHandler[trigger];
    if (handlerName) {
      handlers[handlerName] = async (event?: unknown) => {
        await executeActions(triggerActions, actionContext, event);
      };
    }
  }

  return handlers;
}
```

**Key Points:**
1. Actions are grouped by trigger
2. Triggers map to React event names (click → onClick)
3. All actions for a trigger execute when fired

### Executing Actions

```typescript
export async function executeAction(
  action: Action,
  actionContext: ActionContext,
  event?: unknown
): Promise<boolean> {
  // 1. Check condition if present
  if (action.condition) {
    const shouldExecute = evaluateConditions(action.condition, {
      ...actionContext.context,
      state: actionContext.state,
      form: actionContext.form,
      api: actionContext.api,
    });
    if (!shouldExecute) return true; // Skip but don't fail
  }

  // 2. Resolve template strings in payload
  const resolvedPayload = action.payload
    ? (resolveAllTemplates(action.payload, {
        ...actionContext.context,
        state: actionContext.state,
        form: actionContext.form,
        api: actionContext.api,
        event,  // Event data is available in templates
      }) as Record<string, unknown>)
    : {};

  // 3. Execute based on type
  try {
    switch (action.type) {
      case "navigate":
        actionContext.navigate(resolvedPayload.route as string, ...);
        break;
      // ... other cases
    }
    return true;
  } catch (error) {
    // 4. Run onError actions if available
    if (action.onError) {
      for (const errorAction of action.onError) {
        await executeAction(errorAction, actionContext, error);
      }
    }
    return false;
  }
}
```

### Execution Order

Multiple actions for the same trigger execute **sequentially**:

```typescript
export async function executeActions(
  actions: Action[],
  actionContext: ActionContext,
  event?: unknown
): Promise<boolean> {
  for (const action of actions) {
    const success = await executeAction(action, actionContext, event);
    if (!success) return false;  // Stop on failure
  }
  return true;
}
```

**Important:** If one action fails, subsequent actions don't run.

---

## Conditional Actions

Actions can have conditions that must pass before execution:

```typescript
{
  trigger: "click",
  type: "navigate",
  payload: { route: "/premium-feature" },
  condition: {
    field: "user.isPremium",
    operator: "eq",
    value: true
  }
}
```

**Use Case:** Prevent non-premium users from accessing premium features.

### Multiple Conditional Actions

```typescript
actions: [
  // For premium users
  {
    trigger: "click",
    type: "navigate",
    payload: { route: "/premium-feature" },
    condition: {
      field: "user.isPremium",
      operator: "eq",
      value: true
    }
  },
  // For non-premium users
  {
    trigger: "click",
    type: "showToast",
    payload: {
      type: "warning",
      message: "Upgrade to premium to access this feature"
    },
    condition: {
      field: "user.isPremium",
      operator: "eq",
      value: false
    }
  }
]
```

Both actions have the same trigger, but only the one whose condition passes will execute.

---

## Action Chains

### onSuccess / onError

Chain actions based on results:

```typescript
{
  trigger: "click",
  type: "apiCall",
  payload: {
    endpoint: "/api/orders",
    method: "POST",
    body: { items: "{{state.cart}}" }
  },
  onSuccess: [
    {
      trigger: "click",
      type: "setState",
      payload: { cart: [] }  // Clear cart
    },
    {
      trigger: "click",
      type: "showToast",
      payload: { type: "success", message: "Order placed!" }
    },
    {
      trigger: "click",
      type: "navigate",
      payload: { route: "/orders/{{api.result.orderId}}" }
    }
  ],
  onError: [
    {
      trigger: "click",
      type: "showToast",
      payload: { type: "error", message: "Failed to place order" }
    }
  ]
}
```

**Flow:**
1. API call is made
2. If successful: clear cart → show toast → navigate to order
3. If failed: show error toast

### Sequential Actions

Multiple actions on the same trigger run in order:

```typescript
actions: [
  {
    trigger: "click",
    type: "setState",
    payload: { isLoading: true }
  },
  {
    trigger: "click",
    type: "apiCall",
    payload: { endpoint: "/api/data" }
  },
  {
    trigger: "click",
    type: "setState",
    payload: { isLoading: false }
  }
]
```

**Note:** The third action won't wait for the API call. Use `onSuccess` for sequenced operations.

**Correct approach:**

```typescript
actions: [
  {
    trigger: "click",
    type: "setState",
    payload: { isLoading: true }
  },
  {
    trigger: "click",
    type: "apiCall",
    payload: { endpoint: "/api/data" },
    onSuccess: [
      {
        trigger: "click",
        type: "setState",
        payload: { isLoading: false }
      }
    ],
    onError: [
      {
        trigger: "click",
        type: "setState",
        payload: { isLoading: false }
      }
    ]
  }
]
```

---

## Adding Custom Actions

### Step 1: Add the Action Type

Edit `src/types/sdui.ts`:

```typescript
export const ActionTypeSchema = z.enum([
  // ... existing types
  "copyToClipboard",  // New action type
]);
```

### Step 2: Implement the Handler

Edit `src/lib/sdui/action-dispatcher.ts`:

```typescript
// In the executeAction function's switch statement
case "copyToClipboard":
  if (resolvedPayload.text) {
    try {
      await navigator.clipboard.writeText(resolvedPayload.text as string);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
      return false;
    }
  }
  break;
```

### Step 3: Use in Schema

```typescript
{
  id: "copy-code-button",
  type: "button",
  props: { text: "Copy Code" },
  actions: [
    {
      trigger: "click",
      type: "copyToClipboard",
      payload: {
        text: "{{api.referralCode}}"
      }
    }
  ]
}
```

### Example: Add a Delay Action

```typescript
// In sdui.ts
export const ActionTypeSchema = z.enum([
  // ... existing
  "delay",
]);

// In action-dispatcher.ts
case "delay":
  const ms = (resolvedPayload.ms as number) || 1000;
  await new Promise(resolve => setTimeout(resolve, ms));
  break;
```

**Usage:**
```typescript
actions: [
  {
    trigger: "click",
    type: "showToast",
    payload: { message: "Starting..." }
  },
  {
    trigger: "click",
    type: "delay",
    payload: { ms: 2000 }
  },
  {
    trigger: "click",
    type: "showToast",
    payload: { message: "Done!" }
  }
]
```

---

## Best Practices

### 1. Use Appropriate Triggers

| Trigger | Best For |
|---------|----------|
| `click` | Buttons, links, cards |
| `submit` | Form submission |
| `change` | Live filtering, search-as-you-type |
| `blur` | Field validation |
| `focus` | Show hints, clear errors |

### 2. Handle Errors

Always provide `onError` for `apiCall` actions:

```typescript
{
  type: "apiCall",
  // ...
  onError: [
    { type: "showToast", payload: { type: "error", message: "Something went wrong" } }
  ]
}
```

### 3. Use Conditions for Permissions

```typescript
{
  type: "navigate",
  payload: { route: "/admin" },
  condition: {
    field: "user.role",
    operator: "eq",
    value: "admin"
  }
}
```

### 4. Keep Actions Simple

Prefer multiple simple actions over one complex action:

```typescript
// Good: Clear intent
actions: [
  { type: "setState", payload: { isLoading: true } },
  { type: "apiCall", payload: {...}, onSuccess: [...] }
]

// Avoid: Complex logic in payloads
actions: [
  { type: "custom", payload: { doEverything: true } }
]
```

### 5. Use Template Strings for Dynamic Values

```typescript
// Good: Dynamic routing
payload: { route: "/users/{{user.id}}" }

// Good: Include current state
payload: { items: "{{state.selectedItems}}" }

// Good: Form data
payload: { body: { email: "{{form.email}}" } }
```

### 6. Prefer setState Over setPersistentState

Use `setState` (screen-local) unless you need data across screens:

```typescript
// Screen-local (resets on navigation)
{ type: "setState", payload: { showModal: true } }

// Persistent (survives navigation)
{ type: "setPersistentState", payload: { completedSteps: [...] } }
```

---

## Exercises

### Exercise 1: Create a Confirmation Flow

Create a delete button that:
1. Shows a confirmation modal
2. On confirm, calls delete API
3. On success, shows toast and navigates away

```typescript
// Delete button
{
  id: "delete-btn",
  type: "button",
  props: { text: "Delete", variant: "destructive" },
  actions: [
    {
      trigger: "click",
      type: "openModal",
      payload: { modalId: "confirm-delete" }
    }
  ]
}

// In the modal's confirm button:
actions: [
  {
    trigger: "click",
    type: "apiCall",
    payload: {
      endpoint: "/api/items/{{state.selectedItemId}}",
      method: "DELETE"
    },
    onSuccess: [
      { trigger: "click", type: "closeModal" },
      { trigger: "click", type: "showToast", payload: { type: "success", message: "Deleted!" } },
      { trigger: "click", type: "navigate", payload: { route: "/items" } }
    ],
    onError: [
      { trigger: "click", type: "showToast", payload: { type: "error", message: "Delete failed" } }
    ]
  }
]
```

### Exercise 2: Add a Download Action

1. Add `download` to ActionTypeSchema
2. Implement handler that triggers file download
3. Test with a download button

### Exercise 3: Create Action Debugging

Add a debug mode that logs all action executions:

```typescript
// At the start of executeAction
if (process.env.NODE_ENV === 'development') {
  console.group(`Action: ${action.type}`);
  console.log('Trigger:', action.trigger);
  console.log('Payload:', resolvedPayload);
  console.log('Condition:', action.condition);
  console.groupEnd();
}
```

### Exercise 4: Build a Multi-Step Form

Create a 3-step form using flow actions:

1. Step 1: Personal info → nextStep
2. Step 2: Address → nextStep (with validation)
3. Step 3: Review → submit

---

## Next Steps

- **[Components](./04-components.md)** - Building components that respond to actions
- **[State Management](./06-state-management.md)** - Understanding the Zustand store
