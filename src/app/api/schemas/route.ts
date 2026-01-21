import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ScreenSchema } from "@/types/sdui";
import { z } from "zod";

// ============================================================================
// GET /api/schemas - List all screens
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenantId");
    const tags = searchParams.get("tags")?.split(",");
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (active !== null) {
      where.isActive = active === "true";
    }

    const screens = await prisma.screen.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        screenId: true,
        name: true,
        description: true,
        version: true,
        isActive: true,
        tags: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ screens });
  } catch (error) {
    console.error("Error fetching screens:", error);
    return NextResponse.json(
      { error: "Failed to fetch screens" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/schemas - Create a new screen
// ============================================================================

const CreateScreenSchema = z.object({
  screenId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  schema: ScreenSchema,
  tenantId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateScreenSchema.parse(body);

    // Check if screenId already exists
    const existing = await prisma.screen.findUnique({
      where: { screenId: validated.screenId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Screen with this ID already exists" },
        { status: 409 }
      );
    }

    const screen = await prisma.screen.create({
      data: {
        screenId: validated.screenId,
        name: validated.name,
        description: validated.description,
        schema: validated.schema as object,
        tenantId: validated.tenantId,
        tags: validated.tags || [],
        version: validated.schema.version,
      },
    });

    return NextResponse.json({ screen }, { status: 201 });
  } catch (error) {
    console.error("Error creating screen:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create screen" },
      { status: 500 }
    );
  }
}
