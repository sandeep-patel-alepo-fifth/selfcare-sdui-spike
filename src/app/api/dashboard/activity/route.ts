import { NextResponse } from "next/server";
import { ActivityFeedData } from "@/types/dashboard";

// Mock activity data - in production this would come from a real API
const mockActivityData: ActivityFeedData = {
  activities: [
    {
      id: "1",
      type: "payment",
      title: "Payment received",
      description: "Thank you for your payment",
      amount: "$45.99",
      timestamp: "2026-01-20T10:30:00Z",
    },
    {
      id: "2",
      type: "usage",
      title: "Data usage spike",
      description: "Your data usage increased significantly",
      amount: "2.5 GB",
      timestamp: "2026-01-19T14:15:00Z",
    },
    {
      id: "3",
      type: "plan",
      title: "Plan renewed",
      description: "Your monthly plan has been renewed",
      amount: "$49.99/mo",
      timestamp: "2026-01-15T09:00:00Z",
    },
    {
      id: "4",
      type: "topup",
      title: "Data top-up purchased",
      description: "5GB data pack added",
      amount: "$10.00",
      timestamp: "2026-01-10T16:45:00Z",
    },
  ],
  hasMore: true,
};

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockActivityData);
}
