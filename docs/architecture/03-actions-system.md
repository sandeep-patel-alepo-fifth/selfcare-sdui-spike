# Actions System

This document explains how actions work - the mechanism for handling form submissions, navigation, and API calls.

## Overview

Actions are **named handlers** that execute when users interact with the UI. Unlike inline logic, named actions keep schemas simple and logic server-side.

```typescript
interface ActionConfig {
  type: 'api' | 'navigate' | 'setState' | 'openModal';
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  route?: string;
  payload?: Record<string, unknown>;
  onSuccess?: ActionConfig;
  onError?: ActionConfig;
}

interface ActionResult {
  success: boolean;
  data?: Record<string, unknown>;
  errors?: Record<string, string>;
  navigate?: string;
  toast?: { type: 'success' | 'error'; message: string };
}
```

---

## Action Types

### 1. API Actions

Call backend endpoints:

```json
{
  "submit": {
    "type": "api",
    "endpoint": "/api/billing/pay",
    "method": "POST",
    "onSuccess": {
      "type": "navigate",
      "route": "/billing/confirmation"
    }
  }
}
```

### 2. Navigation Actions

Navigate between pages:

```json
{
  "viewPlans": {
    "type": "navigate",
    "route": "/plans"
  }
}
```

### 3. State Actions

Update local state:

```json
{
  "showDetails": {
    "type": "setState",
    "payload": { "showDetails": true }
  }
}
```

### 4. Modal Actions

Open modals/dialogs:

```json
{
  "confirmCancel": {
    "type": "openModal",
    "payload": {
      "modal": "confirm",
      "title": "Cancel Subscription?",
      "message": "This action cannot be undone."
    }
  }
}
```

---

## Action Execution

```typescript
// lib/sdui/actions.ts
export async function executeAction(
  action: ActionConfig,
  context: ActionContext
): Promise<ActionResult> {
  const { tenant, data, router } = context;

  switch (action.type) {
    case 'api':
      return executeApiAction(action, { tenant, data });

    case 'navigate':
      router.push(action.route!);
      return { success: true };

    case 'setState':
      return { success: true, data: action.payload };

    case 'openModal':
      return { success: true, data: { modal: action.payload } };

    default:
      return { success: false, errors: { _form: 'Unknown action type' } };
  }
}

async function executeApiAction(
  action: ActionConfig,
  context: { tenant: TenantConfig; data: Record<string, unknown> }
): Promise<ActionResult> {
  const { tenant, data } = context;

  const response = await fetch(action.endpoint!, {
    method: action.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenant.id,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      errors: result.errors || { _form: 'Request failed' },
    };
  }

  return {
    success: true,
    data: result.data,
    navigate: result.navigate,
    toast: result.toast,
  };
}
```

---

## Using Actions in Components

### With ScreenLoader

```tsx
function PaymentPage() {
  const router = useRouter();

  const handleActionComplete = (result: ActionResult) => {
    if (result.navigate) {
      router.push(result.navigate);
    }
    if (result.toast) {
      showToast(result.toast);
    }
  };

  return (
    <ScreenLoader
      screen={paymentScreen}
      onActionComplete={handleActionComplete}
    />
  );
}
```

### Manual Action Trigger

```tsx
function QuickPayButton() {
  const tenant = useTenant();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const result = await executeAction(
      { type: 'api', endpoint: '/api/billing/quick-pay', method: 'POST' },
      { tenant, data: { amount: 50 } }
    );
    setLoading(false);

    if (result.success) {
      showToast({ type: 'success', message: 'Payment successful!' });
    }
  };

  return (
    <Button onClick={handleClick} loading={loading}>
      Quick Pay $50
    </Button>
  );
}
```

---

## Action Chains

Chain actions for complex flows:

```json
{
  "submitAndNavigate": {
    "type": "api",
    "endpoint": "/api/profile/update",
    "method": "PUT",
    "onSuccess": {
      "type": "navigate",
      "route": "/profile/success"
    },
    "onError": {
      "type": "openModal",
      "payload": {
        "modal": "error",
        "title": "Update Failed"
      }
    }
  }
}
```

---

## Best Practices

1. **Use named actions** - Keep logic out of schemas
2. **Handle errors gracefully** - Always define `onError`
3. **Show loading states** - Users need feedback
4. **Validate server-side** - Return field-level errors

---

## API Response Format

Standardize API responses for actions:

```typescript
// Success
{
  "success": true,
  "data": { "transactionId": "abc123" },
  "toast": { "type": "success", "message": "Payment complete!" },
  "navigate": "/billing/receipt/abc123"
}

// Error
{
  "success": false,
  "errors": {
    "amount": "Insufficient balance",
    "_form": "Payment failed"
  }
}
```

---

## Next Steps

- [Components](./04-components.md) - Build UI components
- [API Layer](./05-api-layer.md) - Create endpoints
- [State Management](./06-state-management.md) - Manage state
