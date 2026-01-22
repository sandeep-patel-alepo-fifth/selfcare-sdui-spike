import { NextResponse } from "next/server";
import { ServicesSummaryData } from "@/types/dashboard";

// Mock services data - in production this would come from a real API
const mockServicesData: ServicesSummaryData = {
  planName: "Unlimited Plus",
  renewalDate: "2026-02-01",
  services: [
    { type: "data", label: "Data", used: 12.5, total: 20, unit: "GB", unlimited: false },
    { type: "voice", label: "Voice", used: 350, total: 500, unit: "min", unlimited: false },
    { type: "sms", label: "SMS", used: 45, total: 100, unit: "texts", unlimited: false },
  ],
};

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockServicesData);
}
