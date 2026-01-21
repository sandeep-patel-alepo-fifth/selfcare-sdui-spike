import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Screen } from "@/types/sdui";

// Import mock screens for development fallback
import { dashboardScreen } from "@/lib/sdui/schemas/dashboard";
import { onboardingWelcomeScreen, onboardingRegistrationScreen, onboardingPlanSelectionScreen } from "@/lib/sdui/schemas/onboarding";

interface RouteParams {
  params: Promise<{ screenId: string }>;
}

// Mock screens for development
const mockScreens: Record<string, Screen> = {
  dashboard: dashboardScreen,
  "onboarding-welcome": onboardingWelcomeScreen,
  "onboarding-registration": onboardingRegistrationScreen,
  "onboarding-plan-selection": onboardingPlanSelectionScreen,
};

// ============================================================================
// GET /api/screens/[screenId] - Get screen schema for rendering
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { screenId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenantId");

    // Try to fetch from database first
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
          screen: dbScreen.schema as unknown as Screen,
          source: "database",
          version: dbScreen.version,
        });
      }
    } catch {
      // Database not available, fall back to mock
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
