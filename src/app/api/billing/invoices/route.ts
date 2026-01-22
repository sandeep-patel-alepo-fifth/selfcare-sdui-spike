import { NextRequest, NextResponse } from "next/server";
import { InvoiceListResponse, InvoiceSummary, InvoiceStatus } from "@/types/billing";

// Mock invoice data - in production this would come from a real API
const mockInvoices: InvoiceSummary[] = [
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
  {
    id: "inv-004",
    invoiceNumber: "INV-2025-010",
    date: "2025-10-01",
    dueDate: "2025-10-15",
    amount: 95.75,
    currency: "USD",
    status: "paid",
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-2025-009",
    date: "2025-09-01",
    dueDate: "2025-09-15",
    amount: 112.25,
    currency: "USD",
    status: "overdue",
  },
];

export async function GET(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as InvoiceStatus | null;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  let filteredInvoices = [...mockInvoices];

  // Filter by status
  if (status) {
    filteredInvoices = filteredInvoices.filter((inv) => inv.status === status);
  }

  // Filter by date range
  if (startDate) {
    const start = new Date(startDate);
    filteredInvoices = filteredInvoices.filter(
      (inv) => new Date(inv.date) >= start
    );
  }
  if (endDate) {
    const end = new Date(endDate);
    filteredInvoices = filteredInvoices.filter(
      (inv) => new Date(inv.date) <= end
    );
  }

  // Sort by date descending (most recent first)
  filteredInvoices.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Paginate
  const total = filteredInvoices.length;
  const startIndex = (page - 1) * limit;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + limit);

  const response: InvoiceListResponse = {
    invoices: paginatedInvoices,
    total,
    page,
    limit,
    hasMore: startIndex + limit < total,
  };

  return NextResponse.json(response);
}
