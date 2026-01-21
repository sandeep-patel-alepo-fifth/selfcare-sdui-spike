# API Layer: Routes, Database, and Prisma

This document covers the backend API layer - routes, database models, and Prisma ORM usage.

## Table of Contents

1. [Architecture](#architecture)
2. [API Routes](#api-routes)
3. [Database Models](#database-models)
4. [Prisma Usage](#prisma-usage)
5. [Creating New Endpoints](#creating-new-endpoints)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Exercises](#exercises)

---

## Architecture

The API layer uses Next.js App Router's route handlers with Prisma ORM for database access.

```
src/app/api/
├── screens/
│   └── [screenId]/
│       └── route.ts        # GET /api/screens/:screenId
└── schemas/
    └── route.ts            # GET, POST /api/schemas

prisma/
└── schema.prisma           # Database schema

src/lib/db/
└── prisma.ts               # Prisma client instance
```

### Request Flow

```
Client Request
      │
      ▼
┌─────────────────┐
│  Next.js API    │
│  Route Handler  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prisma Client  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    MongoDB      │
└─────────────────┘
```

---

## API Routes

### GET /api/screens/[screenId]

**File:** `src/app/api/screens/[screenId]/route.ts`

Fetches a screen schema by ID.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{ screenId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { screenId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenantId");

    // Try database first
    try {
      const dbScreen = await prisma.screen.findFirst({
        where: {
          screenId,
          isActive: true,
          ...(tenantId ? { tenantId } : {}),
        },
      });

      if (dbScreen) {
        return NextResponse.json({
          screen: dbScreen.schema,
          source: "database",
          version: dbScreen.version,
        });
      }
    } catch {
      console.log("Database not available, using mock screens");
    }

    // Fall back to mock screens
    const mockScreen = mockScreens[screenId];
    if (mockScreen) {
      return NextResponse.json({
        screen: mockScreen,
        source: "mock",
        version: mockScreen.version,
      });
    }

    return NextResponse.json(
      { error: "Screen not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching screen:", error);
    return NextResponse.json(
      { error: "Failed to fetch screen" },
      { status: 500 }
    );
  }
}
```

**Key Features:**
- Async params in Next.js 15
- Tenant filtering via query param
- Graceful fallback to mock screens
- Proper error handling

**Usage:**
```bash
# Basic
GET /api/screens/dashboard

# With tenant filter
GET /api/screens/dashboard?tenantId=tenant-001
```

### GET /api/schemas

Lists all available screen schemas.

```typescript
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenantId");
    const tags = searchParams.get("tags")?.split(",");
    const isActive = searchParams.get("isActive") !== "false";

    const screens = await prisma.screen.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        ...(tags ? { tags: { hasSome: tags } } : {}),
        isActive,
      },
      select: {
        id: true,
        screenId: true,
        name: true,
        description: true,
        version: true,
        tags: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ screens });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch schemas" },
      { status: 500 }
    );
  }
}
```

### POST /api/schemas

Creates a new screen schema.

```typescript
import { ScreenSchema } from "@/types/sdui";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const parseResult = ScreenSchema.safeParse(body.schema);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid schema", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const screen = await prisma.screen.create({
      data: {
        screenId: body.screenId,
        name: body.name,
        description: body.description,
        schema: body.schema,
        tenantId: body.tenantId,
        tags: body.tags || [],
        createdBy: body.createdBy,
      },
    });

    return NextResponse.json({ screen }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Screen ID already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create schema" },
      { status: 500 }
    );
  }
}
```

---

## Database Models

**File:** `prisma/schema.prisma`

### Screen Model

Stores UI screen definitions:

```prisma
model Screen {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  screenId    String   @unique // e.g., "dashboard"
  version     String   @default("1.0")
  tenantId    String?  @db.ObjectId
  name        String
  description String?
  schema      Json     // The full screen JSON
  isActive    Boolean  @default(true)
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?

  tenant      Tenant?  @relation(fields: [tenantId], references: [id])
  versions    ScreenVersion[]

  @@index([tenantId])
  @@index([tags])
}
```

**Key Fields:**
- `screenId` - Human-readable unique identifier
- `schema` - The complete screen JSON (stored as BSON in MongoDB)
- `tenantId` - For multi-tenant isolation
- `isActive` - Soft delete support
- `tags` - For categorization and filtering

### ScreenVersion Model

Maintains version history:

```prisma
model ScreenVersion {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  screenId    String   @db.ObjectId
  version     String
  schema      Json
  changelog   String?
  createdAt   DateTime @default(now())
  createdBy   String?

  screen      Screen   @relation(fields: [screenId], references: [id], onDelete: Cascade)

  @@index([screenId])
}
```

### Flow Model

Multi-step flows (like onboarding):

```prisma
model Flow {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  flowId      String   @unique
  version     String   @default("1.0")
  tenantId    String?  @db.ObjectId
  name        String
  description String?
  schema      Json
  isActive    Boolean  @default(true)
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?

  tenant      Tenant?  @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
}
```

### Theme Model

Design tokens for theming:

```prisma
model Theme {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  themeId     String   @unique
  name        String
  description String?
  colors      Json     // Color tokens
  typography  Json?    // Typography tokens
  spacing     Json?    // Spacing tokens
  shadows     Json?
  borderRadius Json?
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenants     Tenant[]
}
```

### Tenant Model

Multi-tenant configuration:

```prisma
model Tenant {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  tenantId    String   @unique
  name        String
  logo        String?
  favicon     String?
  themeId     String?  @db.ObjectId
  features    Json?    // Feature flags
  customCss   String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  theme       Theme?   @relation(fields: [themeId], references: [id])
  screens     Screen[]
  flows       Flow[]
}
```

### Experiment Model (A/B Testing)

```prisma
model Experiment {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  experimentId String  @unique
  name        String
  description String?
  screenId    String?
  flowId      String?
  variants    Json     // Variant definitions
  traffic     Json     // Traffic allocation
  status      ExperimentStatus @default(DRAFT)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
}

enum ExperimentStatus {
  DRAFT
  RUNNING
  PAUSED
  COMPLETED
}
```

### AuditLog Model

Track all changes:

```prisma
model AuditLog {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  action      String   // e.g., "CREATE_SCREEN"
  entityType  String   // e.g., "Screen"
  entityId    String
  userId      String?
  tenantId    String?
  changes     Json?    // Diff of changes
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId])
  @@index([tenantId])
  @@index([createdAt])
}
```

---

## Prisma Usage

### Client Initialization

**File:** `src/lib/db/prisma.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Why the global pattern?**
- In development, Next.js hot reloading creates new modules
- Without global, each reload creates a new Prisma client
- This leads to connection pool exhaustion
- The global pattern reuses the client across reloads

### Common Operations

**Find One:**
```typescript
const screen = await prisma.screen.findFirst({
  where: { screenId: "dashboard", isActive: true },
});

const screen = await prisma.screen.findUnique({
  where: { screenId: "dashboard" },
});
```

**Find Many:**
```typescript
const screens = await prisma.screen.findMany({
  where: { tenantId: "tenant-001" },
  orderBy: { updatedAt: "desc" },
  take: 10,
  skip: 0,
});
```

**Create:**
```typescript
const screen = await prisma.screen.create({
  data: {
    screenId: "new-screen",
    name: "New Screen",
    schema: { ... },
  },
});
```

**Update:**
```typescript
const screen = await prisma.screen.update({
  where: { screenId: "dashboard" },
  data: {
    schema: updatedSchema,
    version: "1.1",
  },
});
```

**Delete (soft):**
```typescript
await prisma.screen.update({
  where: { id: screenId },
  data: { isActive: false },
});
```

**With Relations:**
```typescript
const screen = await prisma.screen.findFirst({
  where: { screenId: "dashboard" },
  include: {
    tenant: true,
    versions: {
      orderBy: { createdAt: "desc" },
      take: 5,
    },
  },
});
```

---

## Creating New Endpoints

### Step 1: Define the Route

Create `src/app/api/flows/[flowId]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{ flowId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { flowId } = await params;

    const flow = await prisma.flow.findFirst({
      where: { flowId, isActive: true },
    });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ flow: flow.schema });
  } catch (error) {
    console.error("Error fetching flow:", error);
    return NextResponse.json(
      { error: "Failed to fetch flow" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { flowId } = await params;
    const body = await request.json();

    // Validate the schema
    // ...

    const flow = await prisma.flow.update({
      where: { flowId },
      data: {
        schema: body.schema,
        version: body.version,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ flow });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update flow" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { flowId } = await params;

    // Soft delete
    await prisma.flow.update({
      where: { flowId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete flow" },
      { status: 500 }
    );
  }
}
```

### Step 2: Add Validation

```typescript
import { FlowSchema } from "@/types/sdui";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate schema
  const parseResult = FlowSchema.safeParse(body.schema);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Invalid flow schema",
        details: parseResult.error.errors.map(e => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Create flow...
}
```

### Step 3: Add Audit Logging

```typescript
async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  changes?: unknown,
  userId?: string,
  tenantId?: string
) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      changes: changes ? JSON.parse(JSON.stringify(changes)) : null,
      userId,
      tenantId,
    },
  });
}

// In your route handler
const flow = await prisma.flow.create({ data: {...} });
await logAudit("CREATE_FLOW", "Flow", flow.id, flow.schema, userId);
```

---

## Error Handling

### Prisma Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| P2002 | Unique constraint violation | 409 Conflict |
| P2025 | Record not found | 404 Not Found |
| P2003 | Foreign key constraint | 400 Bad Request |

### Error Handler Pattern

```typescript
function handlePrismaError(error: unknown): NextResponse {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          { error: "Resource already exists" },
          { status: 409 }
        );
      case "P2025":
        return NextResponse.json(
          { error: "Resource not found" },
          { status: 404 }
        );
      case "P2003":
        return NextResponse.json(
          { error: "Related resource not found" },
          { status: 400 }
        );
    }
  }

  console.error("Database error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

---

## Best Practices

### 1. Always Use Try-Catch

```typescript
export async function GET(request: NextRequest) {
  try {
    // ... logic
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "..." }, { status: 500 });
  }
}
```

### 2. Validate Input

```typescript
// Use Zod for validation
const parseResult = Schema.safeParse(body);
if (!parseResult.success) {
  return NextResponse.json({ error: "Invalid input" }, { status: 400 });
}
```

### 3. Use Soft Deletes

```typescript
// Don't delete, deactivate
await prisma.screen.update({
  where: { id },
  data: { isActive: false },
});
```

### 4. Include Pagination

```typescript
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "20");

const screens = await prisma.screen.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
```

### 5. Select Only What You Need

```typescript
// Good - only fetch needed fields
const screens = await prisma.screen.findMany({
  select: {
    id: true,
    screenId: true,
    name: true,
  },
});

// Avoid - fetches everything including large schema
const screens = await prisma.screen.findMany();
```

---

## Exercises

### Exercise 1: Add Theme Endpoints

Create CRUD endpoints for themes:

```
GET    /api/themes         - List themes
GET    /api/themes/:id     - Get theme
POST   /api/themes         - Create theme
PUT    /api/themes/:id     - Update theme
DELETE /api/themes/:id     - Delete theme
```

### Exercise 2: Add Version History Endpoint

```
GET /api/screens/:screenId/versions
```

Return the version history for a screen with pagination.

### Exercise 3: Add Search Endpoint

```
GET /api/search?q=dashboard&type=screen
```

Search across screens and flows by name, description, or tags.

### Exercise 4: Add Bulk Operations

```
POST /api/screens/bulk-update
{
  "screenIds": ["screen-1", "screen-2"],
  "update": { "isActive": false }
}
```

---

## Next Steps

- **[State Management](./06-state-management.md)** - Zustand store patterns
- **[Extending](./07-extending.md)** - Implementing future features
