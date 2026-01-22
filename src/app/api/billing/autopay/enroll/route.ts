import { NextRequest, NextResponse } from "next/server";
import {
  AutopayConfig,
  AutopayResponse,
  AutopayEnrollRequest,
} from "@/types/billing";

// Mock payment methods for looking up details
const mockPaymentMethods: Record<string, { label: string; type: "card" | "bank" | "cashapp" | "mobile_money" }> = {
  "pm-001": { label: "Visa ending in 4242", type: "card" },
  "pm-002": { label: "Mastercard ending in 5555", type: "card" },
  "pm-003": { label: "Bank of America", type: "bank" },
};

export async function POST(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const body: AutopayEnrollRequest = await request.json();

    // Validate required fields
    if (!body.paymentMethodId) {
      return NextResponse.json(
        { success: false, error: "Payment method is required" },
        { status: 400 }
      );
    }

    if (!body.scheduleType) {
      return NextResponse.json(
        { success: false, error: "Schedule type is required" },
        { status: 400 }
      );
    }

    // Validate schedule-specific requirements
    if (body.scheduleType === "day_of_month") {
      if (!body.dayOfMonth) {
        return NextResponse.json(
          { success: false, error: "Day of month is required for day_of_month schedule" },
          { status: 400 }
        );
      }
      if (body.dayOfMonth < 1 || body.dayOfMonth > 28) {
        return NextResponse.json(
          { success: false, error: "Day of month must be between 1 and 28" },
          { status: 400 }
        );
      }
    }

    if (body.scheduleType === "threshold") {
      if (!body.thresholdAmount) {
        return NextResponse.json(
          { success: false, error: "Threshold amount is required for threshold schedule" },
          { status: 400 }
        );
      }
      if (body.thresholdAmount <= 0) {
        return NextResponse.json(
          { success: false, error: "Threshold amount must be positive" },
          { status: 400 }
        );
      }
    }

    // Validate max payment amount if provided
    if (body.maxPaymentAmount !== undefined && body.maxPaymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Maximum payment amount must be positive" },
        { status: 400 }
      );
    }

    // Look up payment method details (mock)
    const paymentMethod = mockPaymentMethods[body.paymentMethodId] || {
      label: `Payment Method ${body.paymentMethodId}`,
      type: "card" as const,
    };

    const now = new Date().toISOString();

    // Calculate next scheduled date
    let nextScheduledDate: string | null = null;
    if (body.scheduleType === "day_of_month" && body.dayOfMonth) {
      const today = new Date();
      let nextDate = new Date(today.getFullYear(), today.getMonth(), body.dayOfMonth);
      if (nextDate <= today) {
        nextDate = new Date(today.getFullYear(), today.getMonth() + 1, body.dayOfMonth);
      }
      nextScheduledDate = nextDate.toISOString().split("T")[0];
    } else if (body.scheduleType === "due_date") {
      // Set to next billing cycle due date (mock: 30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      nextScheduledDate = dueDate.toISOString().split("T")[0];
    }

    const autopayConfig: AutopayConfig = {
      enabled: true,
      paymentMethodId: body.paymentMethodId,
      scheduleType: body.scheduleType,
      dayOfMonth: body.dayOfMonth || null,
      thresholdAmount: body.thresholdAmount || null,
      maxPaymentAmount: body.maxPaymentAmount || null,
      paymentMethodLabel: paymentMethod.label,
      paymentMethodType: paymentMethod.type,
      lastPaymentDate: null,
      lastPaymentAmount: null,
      nextScheduledDate,
      createdAt: now,
      updatedAt: now,
    };

    const response: AutopayResponse = {
      success: true,
      autopay: autopayConfig,
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to enroll in autopay" },
      { status: 500 }
    );
  }
}
