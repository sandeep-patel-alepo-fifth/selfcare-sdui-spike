import { NextRequest, NextResponse } from "next/server";
import {
  AddonSubscribeRequest,
  AddonSubscribeResponse,
  AddonSubscribeRequestSchema,
} from "@/types/plans";

export async function POST(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  try {
    const body = await request.json();

    // Validate request body
    const parseResult = AddonSubscribeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        } as AddonSubscribeResponse,
        { status: 400 }
      );
    }

    const subscribeRequest: AddonSubscribeRequest = parseResult.data;

    // Simulate validation - check if addon exists (mock)
    const validAddonIds = [
      "addon-001", "addon-002", "addon-003", "addon-004", "addon-005",
      "addon-006", "addon-007", "addon-008", "addon-009", "addon-010",
    ];

    if (!validAddonIds.includes(subscribeRequest.addonId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Add-on not found",
        } as AddonSubscribeResponse,
        { status: 404 }
      );
    }

    // Calculate expiry date (mock - 30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Mock successful response
    const response: AddonSubscribeResponse = {
      success: true,
      message: "Add-on subscribed successfully",
      subscriptionId: `sub-${Date.now()}`,
      expiryDate: expiryDate.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      } as AddonSubscribeResponse,
      { status: 500 }
    );
  }
}
