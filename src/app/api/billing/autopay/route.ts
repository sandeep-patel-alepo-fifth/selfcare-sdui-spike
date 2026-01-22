import { NextRequest, NextResponse } from "next/server";
import {
  AutopayConfig,
  AutopayResponse,
  AutopayUpdateRequest,
} from "@/types/billing";

// Mock autopay configuration - in production this would come from a real API
let mockAutopayConfig: AutopayConfig = {
  enabled: true,
  paymentMethodId: "pm-001",
  scheduleType: "day_of_month",
  dayOfMonth: 15,
  thresholdAmount: null,
  maxPaymentAmount: 500,
  paymentMethodLabel: "Visa ending in 4242",
  paymentMethodType: "card",
  lastPaymentDate: "2026-01-15",
  lastPaymentAmount: 125.99,
  nextScheduledDate: "2026-02-15",
  createdAt: "2025-06-01T00:00:00Z",
  updatedAt: "2026-01-15T00:00:00Z",
};

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const response: AutopayResponse = {
    success: true,
    autopay: mockAutopayConfig,
  };

  return NextResponse.json(response);
}

export async function PUT(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const body: AutopayUpdateRequest = await request.json();

    // Validate day of month
    if (body.dayOfMonth !== undefined) {
      if (body.dayOfMonth < 1 || body.dayOfMonth > 28) {
        return NextResponse.json(
          { success: false, error: "Day of month must be between 1 and 28" },
          { status: 400 }
        );
      }
    }

    // Validate threshold amount
    if (body.thresholdAmount !== undefined && body.thresholdAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Threshold amount must be positive" },
        { status: 400 }
      );
    }

    // Validate max payment amount
    if (body.maxPaymentAmount !== undefined && body.maxPaymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Maximum payment amount must be positive" },
        { status: 400 }
      );
    }

    // Update the config
    const now = new Date().toISOString();

    if (body.paymentMethodId !== undefined) {
      mockAutopayConfig.paymentMethodId = body.paymentMethodId;
      // In production, we'd look up the payment method details
      mockAutopayConfig.paymentMethodLabel = `Payment Method ${body.paymentMethodId}`;
    }

    if (body.scheduleType !== undefined) {
      mockAutopayConfig.scheduleType = body.scheduleType;
    }

    if (body.dayOfMonth !== undefined) {
      mockAutopayConfig.dayOfMonth = body.dayOfMonth;
    }

    if (body.thresholdAmount !== undefined) {
      mockAutopayConfig.thresholdAmount = body.thresholdAmount;
    }

    if (body.maxPaymentAmount !== undefined) {
      mockAutopayConfig.maxPaymentAmount = body.maxPaymentAmount;
    }

    mockAutopayConfig.updatedAt = now;

    // Calculate next scheduled date based on schedule type
    if (mockAutopayConfig.scheduleType === "day_of_month" && mockAutopayConfig.dayOfMonth) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, mockAutopayConfig.dayOfMonth);
      mockAutopayConfig.nextScheduledDate = nextMonth.toISOString().split("T")[0];
    } else if (mockAutopayConfig.scheduleType === "due_date") {
      // Set to next billing cycle due date (mock: 30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      mockAutopayConfig.nextScheduledDate = dueDate.toISOString().split("T")[0];
    } else if (mockAutopayConfig.scheduleType === "threshold") {
      mockAutopayConfig.nextScheduledDate = null;
    }

    const response: AutopayResponse = {
      success: true,
      autopay: mockAutopayConfig,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update autopay settings" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Disable autopay
  mockAutopayConfig = {
    enabled: false,
    paymentMethodId: null,
    scheduleType: "due_date",
    dayOfMonth: null,
    thresholdAmount: null,
    maxPaymentAmount: null,
    paymentMethodLabel: null,
    paymentMethodType: null,
    lastPaymentDate: mockAutopayConfig.lastPaymentDate,
    lastPaymentAmount: mockAutopayConfig.lastPaymentAmount,
    nextScheduledDate: null,
    createdAt: mockAutopayConfig.createdAt,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ success: true });
}
