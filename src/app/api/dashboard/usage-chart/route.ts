import { NextRequest, NextResponse } from "next/server";
import { UsageChartData } from "@/types/dashboard";

// Generate mock usage data based on period
function generateMockData(period: string): UsageChartData {
  const now = new Date();
  const dataPoints = [];

  let numPoints: number;
  let dateOffset: (i: number) => Date;

  switch (period) {
    case "weekly":
      numPoints = 4;
      dateOffset = (i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (3 - i) * 7);
        return d;
      };
      break;
    case "monthly":
      numPoints = 6;
      dateOffset = (i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (5 - i));
        return d;
      };
      break;
    default: // daily
      numPoints = 7;
      dateOffset = (i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return d;
      };
  }

  for (let i = 0; i < numPoints; i++) {
    const date = dateOffset(i);
    dataPoints.push({
      date: date.toISOString().split("T")[0],
      data: Math.round((Math.random() * 3 + 0.5) * 10) / 10,
      voice: Math.round(Math.random() * 80 + 20),
      sms: Math.round(Math.random() * 20 + 5),
    });
  }

  return {
    period: period as "daily" | "weekly" | "monthly",
    dataPoints,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "daily";

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const data = generateMockData(period);
  return NextResponse.json(data);
}
