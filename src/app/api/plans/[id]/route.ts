import { NextRequest, NextResponse } from "next/server";
import { Plan } from "@/types/plans";

// Mock plan data with full details
const mockPlans: Plan[] = [
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
    features: [
      { name: "5G Access", included: true, limit: null },
      { name: "Mobile Hotspot", included: true, limit: "5GB" },
      { name: "International Texting", included: true, limit: null },
      { name: "Premium Streaming", included: false, limit: null },
      { name: "Priority Support", included: false, limit: null },
    ],
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
    features: [
      { name: "5G Access", included: true, limit: null },
      { name: "Mobile Hotspot", included: true, limit: "15GB" },
      { name: "International Texting", included: true, limit: null },
      { name: "Premium Streaming", included: true, limit: "720p HD" },
      { name: "Priority Support", included: false, limit: null },
    ],
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
    features: [
      { name: "5G Access", included: true, limit: null },
      { name: "Mobile Hotspot", included: true, limit: "50GB" },
      { name: "International Texting", included: true, limit: null },
      { name: "Premium Streaming", included: true, limit: "4K UHD" },
      { name: "Priority Support", included: true, limit: null },
      { name: "International Roaming", included: true, limit: "10GB/month" },
    ],
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
    features: [
      { name: "5G Access", included: true, limit: null },
      { name: "Mobile Hotspot", included: false, limit: null },
      { name: "International Texting", included: false, limit: null },
      { name: "Rollover Data", included: true, limit: "Up to 5GB" },
    ],
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
    features: [
      { name: "5G Access", included: true, limit: null },
      { name: "Mobile Hotspot", included: true, limit: "5GB" },
      { name: "International Texting", included: true, limit: null },
      { name: "Rollover Data", included: true, limit: "Up to 10GB" },
    ],
  },
];

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const { id } = await params;

  const plan = mockPlans.find((p) => p.id === id);

  if (!plan) {
    return NextResponse.json(
      { error: "Plan not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(plan);
}
