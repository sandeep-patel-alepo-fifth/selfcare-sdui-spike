# SDUI Core: Simplified Server-Driven UI

This document explains the simplified SDUI system using JSON Forms and MUI.

## Overview

Our SDUI approach prioritizes simplicity:

1. **JSON Forms** handles form rendering and validation
2. **MUI** provides the component library
3. **Screen configurations** define page structure
4. **Server resolves** dynamic data before sending to client

---

## Screen Types

### 1. Form Screens

Use JSON Forms for data collection with built-in validation.

```typescript
interface FormScreen {
  id: string;
  type: 'form';
  title: string;
  description?: string;
  form: {
    schema: JsonSchema;
    uiSchema?: UISchemaElement;
    initialData?: object;
  };
  actions: Record<string, ActionConfig>;
}
```

**Example: Login Form**

```json
{
  "id": "login",
  "type": "form",
  "title": "Sign In",
  "form": {
    "schema": {
      "type": "object",
      "required": ["phone", "password"],
      "properties": {
        "phone": {
          "type": "string",
          "title": "Phone Number",
          "pattern": "^\\+?[1-9]\\d{9,14}$"
        },
        "password": {
          "type": "string",
          "title": "Password",
          "minLength": 8
        }
      }
    },
    "uiSchema": {
      "type": "VerticalLayout",
      "elements": [
        {
          "type": "Control",
          "scope": "#/properties/phone"
        },
        {
          "type": "Control",
          "scope": "#/properties/password",
          "options": { "format": "password" }
        }
      ]
    }
  },
  "actions": {
    "submit": {
      "type": "api",
      "endpoint": "/api/auth/login",
      "method": "POST"
    }
  }
}
```

### 2. Layout Screens

Compose MUI components for non-form pages.

```typescript
interface LayoutScreen {
  id: string;
  type: 'layout';
  title: string;
  layout: {
    components: ComponentConfig[];
  };
}
```

### 3. Dashboard Screens

Widget-based layouts with data fetching.

```json
{
  "id": "dashboard",
  "type": "dashboard",
  "title": "Dashboard",
  "layout": {
    "components": [
      {
        "id": "balance",
        "type": "BalanceWidget",
        "props": { "dataSource": "/api/billing/balance" }
      },
      {
        "id": "usage-chart",
        "type": "UsageChart",
        "props": { "dataSource": "/api/usage/summary" }
      }
    ]
  }
}
```

---

## JSON Forms Integration

### Basic Usage

```tsx
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';

function MyForm({ schema, uiSchema, onSubmit }) {
  const [data, setData] = useState({});

  return (
    <JsonForms
      schema={schema}
      uischema={uiSchema}
      data={data}
      renderers={materialRenderers}
      cells={materialCells}
      onChange={({ data }) => setData(data)}
    />
  );
}
```

### JSON Schema Features

```json
{
  "type": "object",
  "required": ["email", "amount"],
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    },
    "amount": {
      "type": "number",
      "minimum": 1,
      "maximum": 10000
    },
    "paymentMethod": {
      "type": "string",
      "oneOf": [
        { "const": "card", "title": "Credit Card" },
        { "const": "bank", "title": "Bank Transfer" }
      ]
    }
  }
}
```

### Conditional Fields (UI Schema Rules)

```json
{
  "type": "Control",
  "scope": "#/properties/cardDetails",
  "rule": {
    "effect": "SHOW",
    "condition": {
      "scope": "#/properties/paymentMethod",
      "schema": { "const": "card" }
    }
  }
}
```

---

## Screen Loader

The `ScreenLoader` component renders screens based on type.

```tsx
// lib/sdui/screen-loader.tsx
export function ScreenLoader({ screen, initialData, onActionComplete }) {
  const tenant = useTenant();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleAction = async (actionName: string) => {
    const actionConfig = screen.actions?.[actionName];
    if (!actionConfig) return;

    setLoading(true);
    try {
      const result = await executeAction(actionConfig, { tenant, data });
      if (result.errors) setErrors(result.errors);
      onActionComplete?.(result);
    } finally {
      setLoading(false);
    }
  };

  switch (screen.type) {
    case 'form':
      return <FormScreen screen={screen} data={data} onSubmit={() => handleAction('submit')} />;
    case 'layout':
      return <LayoutScreen screen={screen} />;
    case 'dashboard':
      return <DashboardScreen screen={screen} />;
    default:
      return <Alert severity="error">Unknown screen type</Alert>;
  }
}
```

---

## Custom Renderers

Extend JSON Forms with custom inputs:

```tsx
import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, formatIs } from '@jsonforms/core';
import { TextField, InputAdornment } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';

const PhoneInput = ({ data, handleChange, path, label, errors }) => (
  <TextField
    label={label}
    value={data || ''}
    onChange={(e) => handleChange(path, e.target.value)}
    error={!!errors}
    helperText={errors}
    InputProps={{
      startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>,
    }}
    fullWidth
  />
);

export const phoneInputTester = rankWith(3, formatIs('phone'));
export const PhoneInputRenderer = withJsonFormsControlProps(PhoneInput);

// Register
const customRenderers = [
  ...materialRenderers,
  { tester: phoneInputTester, renderer: PhoneInputRenderer },
];
```

---

## Best Practices

1. **Keep schemas flat** - Avoid deep nesting
2. **Use UI Schema for layout** - Separate structure from validation
3. **Validate on server too** - Client validation is for UX only
4. **Use named actions** - Not inline logic

---

## Next Steps

- [Actions System](./03-actions-system.md) - Handle submissions
- [Components](./04-components.md) - Build widgets
- [API Layer](./05-api-layer.md) - Create endpoints
