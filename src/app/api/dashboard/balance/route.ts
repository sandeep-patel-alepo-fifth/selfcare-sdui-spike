import { NextResponse } from "next/server";
import { BalanceData } from "@/types/dashboard";

// Mock balance data - in production this would come from a real API
const mockBalanceData: BalanceData = {
  current: 45.99,
  currency: "USD",
  accountType: "postpaid",
  dueDate: "2026-02-15",
  creditLimit: 200,
  lastPaymentDate: "2026-01-15",
  lastPaymentAmount: 45.99,
};

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockBalanceData);
}
