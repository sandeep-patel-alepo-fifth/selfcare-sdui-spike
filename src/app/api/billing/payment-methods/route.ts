import { NextRequest, NextResponse } from "next/server";
import { PaymentMethodsResponse, SavedPaymentMethod } from "@/types/billing";

// Mock saved payment methods - in production this would come from a real API
const mockPaymentMethods: SavedPaymentMethod[] = [
  {
    id: "pm-001",
    type: "card",
    last4: "4242",
    label: "Visa ending in 4242",
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
  },
  {
    id: "pm-002",
    type: "card",
    last4: "5555",
    label: "Mastercard ending in 5555",
    expiryMonth: 6,
    expiryYear: 2026,
    isDefault: false,
  },
  {
    id: "pm-003",
    type: "bank",
    last4: "9876",
    label: "Bank of America",
    isDefault: false,
  },
];

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const response: PaymentMethodsResponse = {
    methods: mockPaymentMethods,
  };

  return NextResponse.json(response);
}

interface AddPaymentMethodRequest {
  type: "card" | "bank" | "cashapp" | "mobile_money";
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardName?: string;
  accountNumber?: string;
  label?: string;
}

function getCardBrand(cardNumber: string): string {
  if (cardNumber.startsWith("4")) return "Visa";
  if (cardNumber.startsWith("5")) return "Mastercard";
  if (cardNumber.startsWith("3")) return "Amex";
  if (cardNumber.startsWith("6")) return "Discover";
  return "Card";
}

export async function POST(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const body: AddPaymentMethodRequest = await request.json();

    // Validate required fields for card
    if (body.type === "card" && !body.cardNumber) {
      return NextResponse.json(
        { success: false, error: "Card number is required" },
        { status: 400 }
      );
    }

    const methodId = `pm-${Date.now()}`;
    let last4: string;
    let label: string;

    if (body.type === "card" && body.cardNumber) {
      last4 = body.cardNumber.slice(-4);
      const brand = getCardBrand(body.cardNumber);
      label = `${brand} ending in ${last4}`;
    } else if (body.type === "bank" && body.accountNumber) {
      last4 = body.accountNumber.slice(-4);
      label = body.label || `Bank account ending in ${last4}`;
    } else {
      last4 = "0000";
      label = body.label || `${body.type} account`;
    }

    const newMethod: SavedPaymentMethod = {
      id: methodId,
      type: body.type,
      last4,
      label,
      expiryMonth: body.expiryMonth,
      expiryYear: body.expiryYear,
      isDefault: false,
    };

    return NextResponse.json(
      { success: true, method: newMethod },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Payment method ID is required" },
      { status: 400 }
    );
  }

  // In production, this would actually delete from the database
  return NextResponse.json({ success: true });
}
