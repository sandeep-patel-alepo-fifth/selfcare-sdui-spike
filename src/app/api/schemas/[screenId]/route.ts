import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ScreenSchema } from "@/types/sdui";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ screenId: string }>;
}

// ============================================================================
// GET /api/schemas/[screenId] - Get a single screen
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { screenId } = await params;

    const screen = await prisma.screen.findUnique({
      where: { screenId },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!screen) {
      return NextResponse.json(
        { error: "Screen not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ screen });
  } catch (error) {
    console.error("Error fetching screen:", error);
    return NextResponse.json(
      { error: "Failed to fetch screen" },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/schemas/[screenId] - Update a screen
// ============================================================================

const UpdateScreenSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  schema: ScreenSchema.optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  changelog: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { screenId } = await params;
    const body = await request.json();
    const validated = UpdateScreenSchema.parse(body);

    const existing = await prisma.screen.findUnique({
      where: { screenId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Screen not found" },
        { status: 404 }
      );
    }

    // If schema is being updated, create a version backup
    if (validated.schema) {
      await prisma.screenVersion.create({
        data: {
          screenId: existing.id,
          version: existing.version,
          schema: existing.schema as object,
          changelog: validated.changelog || `Updated from v${existing.version}`,
        },
      });
    }

    const screen = await prisma.screen.update({
      where: { screenId },
      data: {
        name: validated.name,
        description: validated.description,
        schema: validated.schema as object | undefined,
        version: validated.schema?.version,
        isActive: validated.isActive,
        tags: validated.tags,
      },
    });

    return NextResponse.json({ screen });
  } catch (error) {
    console.error("Error updating screen:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update screen" },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/schemas/[screenId] - Delete a screen
// ============================================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { screenId } = await params;

    const existing = await prisma.screen.findUnique({
      where: { screenId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Screen not found" },
        { status: 404 }
      );
    }

    await prisma.screen.delete({
      where: { screenId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting screen:", error);
    return NextResponse.json(
      { error: "Failed to delete screen" },
      { status: 500 }
    );
  }
}
