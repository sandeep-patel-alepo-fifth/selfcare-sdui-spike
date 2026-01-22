import { NextRequest, NextResponse } from "next/server";
import {
  PaymentHistoryResponse,
  Payment,
  PaymentStatus,
  PaymentResponse,
  PaymentRequest,
} from "@/types/billing";

// Mock payment data - in production this would come from a real API
const mockPayments: Payment[] = [
  {
    id: "pay-001",
    amount: 125.99,
    currency: "USD",
    method: "card",
    status: "completed",
    date: "2026-01-15",
    reference: "REF-001",
    description: "Invoice INV-2026-001",
  },
  {
    id: "pay-002",
    amount: 89.50,
    currency: "USD",
    method: "bank",
    status: "completed",
    date: "2026-01-10",
    reference: "REF-002",
    description: "Invoice INV-2025-012",
  },
  {
    id: "pay-003",
    amount: 50.00,
    currency: "USD",
    method: "cashapp",
    status: "pending",
    date: "2026-01-08",
    reference: "REF-003",
  },
  {
    id: "pay-004",
    amount: 75.25,
    currency: "USD",
    method: "card",
    status: "failed",
    date: "2026-01-05",
    reference: "REF-004",
    description: "Payment retry needed",
  },
  {
    id: "pay-005",
    amount: 200.00,
    currency: "USD",
    method: "mobile_money",
    status: "completed",
    date: "2025-12-28",
    reference: "REF-005",
  },
];

export async function GET(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as PaymentStatus | null;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  let filteredPayments = [...mockPayments];

  // Filter by status
  if (status) {
    filteredPayments = filteredPayments.filter((p) => p.status === status);
  }

  // Sort by date descending (most recent first)
  filteredPayments.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Paginate
  const total = filteredPayments.length;
  const startIndex = (page - 1) * limit;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + limit);

  const response: PaymentHistoryResponse = {
    payments: paginatedPayments,
    total,
    page,
    limit,
    hasMore: startIndex + limit < total,
  };

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const body: PaymentRequest = await request.json();

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    if (!body.paymentMethodType) {
      return NextResponse.json(
        { success: false, error: "Payment method is required" },
        { status: 400 }
      );
    }

    // Simulate payment processing
    const paymentId = `pay-${Date.now()}`;
    const reference = `REF-${Date.now()}`;

    const payment: Payment = {
      id: paymentId,
      amount: body.amount,
      currency: body.currency || "USD",
      method: body.paymentMethodType,
      status: "completed", // Mock successful payment
      date: new Date().toISOString().split("T")[0],
      reference,
      description: `Payment via ${body.paymentMethodType}`,
    };

    const response: PaymentResponse = {
      success: true,
      payment,
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
