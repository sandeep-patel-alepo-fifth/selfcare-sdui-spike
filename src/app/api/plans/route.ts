import { NextRequest, NextResponse } from "next/server";
import { PlanListResponse, PlanSummary, PlanType } from "@/types/plans";

// Mock plan data - in production this would come from a real API
const mockPlans: PlanSummary[] = [
  {
    id: "plan-001",
    name: "Basic",
    description: "Great for everyday use with essential features",
    price: 29.99,
    currency: "USD",
    billingCycle: "monthly",
    type: "postpaid",
    category: "basic",
    data: "10GB",
    voice: "500 mins",
    sms: "100 SMS",
    popular: false,
  },
  {
    id: "plan-002",
    name: "Standard",
    description: "Our most popular plan with great value",
    price: 49.99,
    currency: "USD",
    billingCycle: "monthly",
    type: "postpaid",
    category: "standard",
    data: "25GB",
    voice: "Unlimited",
    sms: "Unlimited",
    popular: true,
  },
  {
    id: "plan-003",
    name: "Premium",
    description: "Unlimited everything for power users",
    price: 79.99,
    currency: "USD",
    billingCycle: "monthly",
    type: "postpaid",
    category: "premium",
    data: "Unlimited",
    voice: "Unlimited",
    sms: "Unlimited",
    popular: false,
  },
  {
    id: "plan-004",
    name: "Prepaid Basic",
    description: "Pay as you go with no commitments",
    price: 19.99,
    currency: "USD",
    billingCycle: "monthly",
    type: "prepaid",
    category: "basic",
    data: "5GB",
    voice: "200 mins",
    sms: "50 SMS",
    popular: false,
  },
  {
    id: "plan-005",
    name: "Prepaid Plus",
    description: "More data for prepaid customers",
    price: 34.99,
    currency: "USD",
    billingCycle: "monthly",
    type: "prepaid",
    category: "standard",
    data: "15GB",
    voice: "500 mins",
    sms: "200 SMS",
    popular: false,
  },
];

export async function GET(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as PlanType | null;
  const category = searchParams.get("category");
  const tenantId = searchParams.get("tenantId");

  let filteredPlans = [...mockPlans];

  // Filter by plan type (prepaid/postpaid)
  if (type) {
    filteredPlans = filteredPlans.filter((plan) => plan.type === type);
  }

  // Filter by category
  if (category) {
    filteredPlans = filteredPlans.filter((plan) => plan.category === category);
  }

  // Sort by price ascending
  filteredPlans.sort((a, b) => a.price - b.price);

  const response: PlanListResponse = {
    plans: filteredPlans,
    total: filteredPlans.length,
  };

  return NextResponse.json(response);
}
