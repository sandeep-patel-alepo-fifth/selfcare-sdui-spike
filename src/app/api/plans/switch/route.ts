import { NextRequest, NextResponse } from "next/server";
import { PlanSwitchRequest, PlanSwitchResponse, PlanSwitchRequestSchema } from "@/types/plans";

export async function POST(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const body = await request.json();

    // Validate request body
    const parseResult = PlanSwitchRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        } as PlanSwitchResponse,
        { status: 400 }
      );
    }

    const switchRequest: PlanSwitchRequest = parseResult.data;

    // Simulate some validation logic
    if (switchRequest.currentPlanId === switchRequest.newPlanId) {
      return NextResponse.json(
        {
          success: false,
          error: "New plan must be different from current plan",
        } as PlanSwitchResponse,
        { status: 400 }
      );
    }

    // Calculate effective date
    const effectiveDate = switchRequest.effectiveDate === "immediate"
      ? new Date().toISOString()
      : getNextBillingCycleDate().toISOString();

    // Mock successful response
    const response: PlanSwitchResponse = {
      success: true,
      message: "Plan switch scheduled successfully",
      switchId: `switch-${Date.now()}`,
      effectiveDate,
      proratedAmount: switchRequest.effectiveDate === "immediate" ? 15.50 : 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      } as PlanSwitchResponse,
      { status: 500 }
    );
  }
}

function getNextBillingCycleDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}
