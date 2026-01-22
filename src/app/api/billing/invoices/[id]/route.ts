import { NextRequest, NextResponse } from "next/server";
import { Invoice } from "@/types/billing";

// Mock invoice details data - in production this would come from a real API
const mockInvoiceDetails: Record<string, Invoice> = {
  "inv-001": {
    id: "inv-001",
    invoiceNumber: "INV-2026-001",
    date: "2026-01-01",
    dueDate: "2026-01-15",
    amount: 125.99,
    currency: "USD",
    status: "pending",
    billingPeriod: {
      start: "2025-12-01",
      end: "2025-12-31",
    },
    lineItems: [
      {
        id: "item-1",
        description: "Monthly Data Plan - 10GB",
        quantity: 1,
        unitPrice: 49.99,
        total: 49.99,
        category: "Data",
      },
      {
        id: "item-2",
        description: "Voice Minutes - Unlimited",
        quantity: 1,
        unitPrice: 35.0,
        total: 35.0,
        category: "Voice",
      },
      {
        id: "item-3",
        description: "SMS Bundle - 500 messages",
        quantity: 1,
        unitPrice: 15.0,
        total: 15.0,
        category: "SMS",
      },
      {
        id: "item-4",
        description: "Taxes and Regulatory Fees",
        quantity: 1,
        unitPrice: 26.0,
        total: 26.0,
        category: "Fees",
      },
    ],
    downloadUrl: "/api/billing/invoices/inv-001/download",
  },
  "inv-002": {
    id: "inv-002",
    invoiceNumber: "INV-2025-012",
    date: "2025-12-01",
    dueDate: "2025-12-15",
    amount: 89.5,
    currency: "USD",
    status: "paid",
    billingPeriod: {
      start: "2025-11-01",
      end: "2025-11-30",
    },
    paidDate: "2025-12-10",
    lineItems: [
      {
        id: "item-1",
        description: "Monthly Data Plan - 5GB",
        quantity: 1,
        unitPrice: 29.99,
        total: 29.99,
        category: "Data",
      },
      {
        id: "item-2",
        description: "Voice Minutes - 500 min",
        quantity: 1,
        unitPrice: 25.0,
        total: 25.0,
        category: "Voice",
      },
      {
        id: "item-3",
        description: "SMS Bundle - 200 messages",
        quantity: 1,
        unitPrice: 10.0,
        total: 10.0,
        category: "SMS",
      },
      {
        id: "item-4",
        description: "Taxes and Regulatory Fees",
        quantity: 1,
        unitPrice: 24.51,
        total: 24.51,
        category: "Fees",
      },
    ],
    downloadUrl: "/api/billing/invoices/inv-002/download",
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { id } = await params;
  const invoice = mockInvoiceDetails[id];

  if (!invoice) {
    return NextResponse.json(
      { error: "Invoice not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(invoice);
}
