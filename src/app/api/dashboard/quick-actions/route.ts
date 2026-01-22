import { NextResponse } from "next/server";
import { QuickAction } from "@/types/dashboard";

// Mock quick actions data - in production this would come from a real API
const mockQuickActions: QuickAction[] = [
  {
    id: "pay-bill",
    label: "Pay Bill",
    icon: "payment",
    action: "pay_bill",
    primary: true,
    disabled: false,
  },
  {
    id: "buy-data",
    label: "Buy Data",
    icon: "data_usage",
    action: "buy_data",
    primary: false,
    disabled: false,
  },
  {
    id: "view-usage",
    label: "View Usage",
    icon: "trending_up",
    href: "/usage",
    primary: false,
    disabled: false,
  },
  {
    id: "support",
    label: "Get Support",
    icon: "support",
    href: "/support",
    primary: false,
    disabled: false,
  },
];

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(mockQuickActions);
}
