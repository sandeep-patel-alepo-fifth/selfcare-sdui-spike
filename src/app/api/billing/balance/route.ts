import { NextResponse } from "next/server";
import { BillingAccount, InvoiceSummary } from "@/types/billing";

// Mock billing account data - in production this would come from a real API
const mockBillingAccount: BillingAccount = {
  balance: 125.99,
  currency: "USD",
  dueDate: "2026-01-15",
  accountType: "postpaid",
  autopay: {
    enabled: true,
    paymentMethodId: "pm-123",
    lastFourDigits: "4242",
    paymentType: "card",
  },
  lastPaymentDate: "2025-12-15",
  lastPaymentAmount: 89.5,
};

const mockRecentInvoices: InvoiceSummary[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2026-001",
    date: "2026-01-01",
    dueDate: "2026-01-15",
    amount: 125.99,
    currency: "USD",
    status: "pending",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2025-012",
    date: "2025-12-01",
    dueDate: "2025-12-15",
    amount: 89.5,
    currency: "USD",
    status: "paid",
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2025-011",
    date: "2025-11-01",
    dueDate: "2025-11-15",
    amount: 150.0,
    currency: "USD",
    status: "paid",
  },
];

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    account: mockBillingAccount,
    recentInvoices: mockRecentInvoices,
  });
}
