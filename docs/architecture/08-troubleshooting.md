# Troubleshooting Guide

This document covers common issues and how to debug them.

## Quick Fixes

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `lsof -i :3000 && kill -9 <PID>` |
| Prisma types stale | `npm run db:generate` |
| Tenant not found | Check `config/tenants/` or set `DEFAULT_TENANT_ID` |
| Auth failing | Clear cookies, check token expiry |
| Styles not loading | Clear `.next` cache: `rm -rf .next` |

---

## Debugging Tools

### Browser DevTools

**Console Tab:**
- Check for errors and warnings
- Look for API call failures
- Watch for React hydration errors

**Network Tab:**
- Verify API calls include `X-Tenant-ID` header
- Check response payloads
- Look for 401/403 errors

**React DevTools:**
- Inspect component props
- Check context values
- Watch state changes

### VS Code

**Debugging:**
1. Add `debugger;` statement
2. Run `npm run dev`
3. Open Chrome DevTools → Sources

**TypeScript Errors:**
- `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

---

## Common Issues

### Tenant Not Resolving

**Symptoms:**
- 404 on all pages
- "Tenant not found" error

**Solutions:**

1. Check tenant config exists:
```bash
ls config/tenants/
```

2. Set default tenant in `.env`:
```env
DEFAULT_TENANT_ID=demo
```

3. Verify middleware:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  console.log('Tenant ID:', request.headers.get('x-tenant-id'));
  // ...
}
```

### Authentication Failures

**Symptoms:**
- Redirected to login constantly
- 401 errors on API calls

**Solutions:**

1. Check token in cookies/storage:
```javascript
console.log(document.cookie);
console.log(localStorage.getItem('accessToken'));
```

2. Verify token expiry:
```typescript
import jwt from 'jsonwebtoken';
const decoded = jwt.decode(token);
console.log('Expires:', new Date(decoded.exp * 1000));
```

3. Check auth context:
```tsx
function Debug() {
  const auth = useAuth();
  console.log('Auth state:', auth);
  return null;
}
```

### JSON Forms Not Rendering

**Symptoms:**
- Blank form
- Console errors about renderers

**Solutions:**

1. Check schema is valid JSON Schema:
```typescript
import Ajv from 'ajv';
const ajv = new Ajv();
const valid = ajv.validateSchema(schema);
console.log('Valid:', valid, ajv.errors);
```

2. Verify renderers are imported:
```tsx
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';

<JsonForms
  renderers={materialRenderers}  // Must include this
  cells={materialCells}
  // ...
/>
```

3. Check uiSchema scopes match schema:
```json
// Schema has "phone"
{ "properties": { "phone": { ... } } }

// uiSchema must reference it correctly
{ "scope": "#/properties/phone" }  // Correct
{ "scope": "#/phone" }             // Wrong!
```

### MUI Theme Not Applied

**Symptoms:**
- Default blue theme instead of tenant colors
- Wrong text direction (LTR/RTL)

**Solutions:**

1. Verify TenantProvider wraps app:
```tsx
// app/layout.tsx
<TenantProvider tenant={tenant}>
  {children}
</TenantProvider>
```

2. Check tenant config has branding:
```json
{
  "branding": {
    "primaryColor": "#6366f1",
    "theme": "light"
  }
}
```

3. Verify theme is created:
```tsx
const theme = useTheme();
console.log('Primary color:', theme.palette.primary.main);
```

### API Calls Failing

**Symptoms:**
- 500 errors
- Timeouts
- CORS errors

**Solutions:**

1. Check tenant header is sent:
```typescript
const api = useApi();
// api.get() automatically includes X-Tenant-ID
```

2. Verify API route exists:
```bash
ls src/app/api/
```

3. Check server logs:
```bash
# In terminal running `npm run dev`
# Look for error stack traces
```

4. Test API directly:
```bash
curl -X GET http://localhost:3000/api/billing/balance \
  -H "X-Tenant-ID: demo" \
  -H "Authorization: Bearer <token>"
```

### Database Connection Issues

**Symptoms:**
- Prisma errors
- "Connection refused"
- Timeout errors

**Solutions:**

1. Check MongoDB is running:
```bash
mongosh  # Should connect
```

2. Verify DATABASE_URL:
```bash
echo $DATABASE_URL
# Should be: mongodb://localhost:27017/selfcare
```

3. Regenerate Prisma client:
```bash
npm run db:generate
npm run db:push
```

4. Check Prisma Studio:
```bash
npm run db:studio
```

---

## Performance Issues

### Slow Page Loads

1. Check for unnecessary re-renders:
```tsx
import { Profiler } from 'react';

<Profiler id="MyComponent" onRender={(id, phase, duration) => {
  console.log(`${id} ${phase}: ${duration}ms`);
}}>
  <MyComponent />
</Profiler>
```

2. Memoize expensive components:
```tsx
const ExpensiveWidget = memo(function ExpensiveWidget(props) {
  // ...
});
```

3. Use React Query for data fetching:
```tsx
const { data, isLoading } = useQuery(['balance'], () => api.get('/billing/balance'));
```

### Large Bundle Size

1. Analyze bundle:
```bash
npm run build
npx @next/bundle-analyzer
```

2. Dynamic imports for heavy components:
```tsx
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
});
```

---

## Logging

### Add Debug Logging

```typescript
// lib/core/logger.ts
export function debug(module: string, message: string, data?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${module}] ${message}`, data);
  }
}

// Usage
debug('auth', 'Login attempt', { phone });
```

### API Request Logging

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  console.log(`[${request.method}] ${request.nextUrl.pathname}`);
  console.log('Tenant:', request.headers.get('x-tenant-id'));
  // ...
}
```

---

## Getting Help

1. **Check existing docs** - Many answers are in this documentation
2. **Search codebase** - `grep -r "error message"`
3. **Check git history** - `git log --oneline -20`
4. **Ask with context** - Include error messages, steps to reproduce

---

## Useful Commands

```bash
# Clear all caches
rm -rf .next node_modules/.cache

# Reinstall dependencies
rm -rf node_modules && npm install

# Check for outdated packages
npm outdated

# Type check without building
npx tsc --noEmit

# Lint and fix
npm run lint -- --fix

# Run specific test
npm run test -- --filter="VoucherForm"
```
