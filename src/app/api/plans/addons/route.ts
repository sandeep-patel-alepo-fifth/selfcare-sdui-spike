import { NextRequest, NextResponse } from "next/server";
import { AddonListResponse, Addon, AddonType } from "@/types/plans";

// Mock addon data
const mockAddons: Addon[] = [
  {
    id: "addon-001",
    name: "Extra Data 5GB",
    description: "Add 5GB of additional high-speed data to your plan",
    price: 9.99,
    currency: "USD",
    type: "data",
    value: "5GB",
    duration: "30 days",
    recurring: false,
  },
  {
    id: "addon-002",
    name: "Extra Data 10GB",
    description: "Add 10GB of additional high-speed data to your plan",
    price: 14.99,
    currency: "USD",
    type: "data",
    value: "10GB",
    duration: "30 days",
    recurring: false,
  },
  {
    id: "addon-003",
    name: "Unlimited Data Day Pass",
    description: "Unlimited high-speed data for 24 hours",
    price: 5.99,
    currency: "USD",
    type: "data",
    value: "Unlimited",
    duration: "24 hours",
    recurring: false,
  },
  {
    id: "addon-004",
    name: "Voice Pack 100",
    description: "100 additional voice minutes",
    price: 4.99,
    currency: "USD",
    type: "voice",
    value: "100 mins",
    duration: "30 days",
    recurring: false,
  },
  {
    id: "addon-005",
    name: "International Calls",
    description: "60 minutes of international calling to 50+ countries",
    price: 12.99,
    currency: "USD",
    type: "voice",
    value: "60 mins",
    duration: "30 days",
    recurring: true,
  },
  {
    id: "addon-006",
    name: "SMS Bundle",
    description: "500 additional SMS messages",
    price: 2.99,
    currency: "USD",
    type: "sms",
    value: "500 SMS",
    duration: "30 days",
    recurring: false,
  },
  {
    id: "addon-007",
    name: "International Roaming",
    description: "Use your phone in 50+ countries with data, voice, and SMS",
    price: 19.99,
    currency: "USD",
    type: "roaming",
    value: "5GB data + 100 mins",
    duration: "7 days",
    recurring: false,
  },
  {
    id: "addon-008",
    name: "Streaming Pass",
    description: "Stream HD video without using your data allowance",
    price: 14.99,
    currency: "USD",
    type: "entertainment",
    value: null,
    duration: "30 days",
    recurring: true,
  },
  {
    id: "addon-009",
    name: "Music Pass",
    description: "Listen to music without using your data allowance",
    price: 9.99,
    currency: "USD",
    type: "entertainment",
    value: null,
    duration: "30 days",
    recurring: true,
  },
  {
    id: "addon-010",
    name: "Mobile Security",
    description: "Anti-virus, VPN, and identity theft protection",
    price: 7.99,
    currency: "USD",
    type: "security",
    value: null,
    duration: "30 days",
    recurring: true,
  },
];

export async function GET(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as AddonType | null;
  const recurring = searchParams.get("recurring");

  let filteredAddons = [...mockAddons];

  // Filter by addon type
  if (type) {
    filteredAddons = filteredAddons.filter((addon) => addon.type === type);
  }

  // Filter by recurring
  if (recurring !== null) {
    const isRecurring = recurring === "true";
    filteredAddons = filteredAddons.filter((addon) => addon.recurring === isRecurring);
  }

  // Sort by price ascending
  filteredAddons.sort((a, b) => a.price - b.price);

  const response: AddonListResponse = {
    addons: filteredAddons,
    total: filteredAddons.length,
  };

  return NextResponse.json(response);
}
