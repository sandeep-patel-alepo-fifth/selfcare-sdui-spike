import { NextRequest, NextResponse } from "next/server";
import { UsageRecord, UsageHistoryResponse, UsageType } from "@/types/usage";

// Mock usage history data - in production this would come from a real API
const mockUsageRecords: UsageRecord[] = [
  {
    id: "rec-001",
    date: "2026-01-15T10:30:00Z",
    type: "data",
    amount: 2.5,
    unit: "GB",
    cost: 5.0,
    currency: "USD",
    description: "Mobile Data Usage",
  },
  {
    id: "rec-002",
    date: "2026-01-14T14:20:00Z",
    type: "voice",
    amount: 45,
    unit: "minutes",
    cost: 2.25,
    currency: "USD",
    description: "Voice Call to USA",
  },
  {
    id: "rec-003",
    date: "2026-01-13T09:15:00Z",
    type: "sms",
    amount: 10,
    unit: "messages",
    cost: 0.5,
    currency: "USD",
    description: "SMS Messages",
  },
  {
    id: "rec-004",
    date: "2026-01-12T16:45:00Z",
    type: "data",
    amount: 1.8,
    unit: "GB",
    cost: 3.6,
    currency: "USD",
    description: "Mobile Data Usage",
  },
  {
    id: "rec-005",
    date: "2026-01-11T11:00:00Z",
    type: "roaming",
    amount: 0.5,
    unit: "GB",
    cost: 10.0,
    currency: "USD",
    description: "Roaming Data - Canada",
  },
  {
    id: "rec-006",
    date: "2026-01-10T08:30:00Z",
    type: "voice",
    amount: 30,
    unit: "minutes",
    cost: 1.5,
    currency: "USD",
    description: "Voice Call",
  },
  {
    id: "rec-007",
    date: "2026-01-09T15:20:00Z",
    type: "data",
    amount: 3.2,
    unit: "GB",
    cost: 6.4,
    currency: "USD",
    description: "Mobile Data Usage",
  },
  {
    id: "rec-008",
    date: "2026-01-08T12:10:00Z",
    type: "sms",
    amount: 5,
    unit: "messages",
    cost: 0.25,
    currency: "USD",
    description: "SMS Messages",
  },
];

export async function GET(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as UsageType | null;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  let filteredRecords = [...mockUsageRecords];

  // Filter by type
  if (type) {
    filteredRecords = filteredRecords.filter((rec) => rec.type === type);
  }

  // Filter by date range
  if (startDate) {
    const start = new Date(startDate);
    filteredRecords = filteredRecords.filter(
      (rec) => new Date(rec.date) >= start
    );
  }
  if (endDate) {
    const end = new Date(endDate);
    filteredRecords = filteredRecords.filter(
      (rec) => new Date(rec.date) <= end
    );
  }

  // Sort by date descending (most recent first)
  filteredRecords.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Paginate
  const total = filteredRecords.length;
  const startIndex = (page - 1) * limit;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + limit);

  const response: UsageHistoryResponse = {
    records: paginatedRecords,
    total,
    page,
    limit,
    hasMore: startIndex + limit < total,
  };

  return NextResponse.json(response);
}
