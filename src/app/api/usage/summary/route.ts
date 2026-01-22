import { NextResponse } from "next/server";
import { UsageSummary } from "@/types/usage";

// Mock usage summary data - in production this would come from a real API
const mockUsageSummary: UsageSummary = {
  billingPeriod: {
    start: "2026-01-01",
    end: "2026-01-31",
  },
  items: [
    {
      type: "data",
      used: 15,
      total: 50,
      unit: "GB",
      percentage: 30,
      cost: 25.0,
      currency: "USD",
    },
    {
      type: "voice",
      used: 120,
      total: 500,
      unit: "minutes",
      percentage: 24,
      cost: 15.0,
      currency: "USD",
    },
    {
      type: "sms",
      used: 50,
      total: 200,
      unit: "messages",
      percentage: 25,
      cost: 5.0,
      currency: "USD",
    },
  ],
  totalCost: 45.0,
  currency: "USD",
};

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(mockUsageSummary);
}
