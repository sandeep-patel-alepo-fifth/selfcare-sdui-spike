import { NextResponse } from "next/server";
import { Service, ServicesResponse } from "@/types/usage";

// Mock services data - in production this would come from a real API
const mockServices: Service[] = [
  {
    id: "svc-001",
    name: "Premium Data Plan",
    type: "plan",
    description: "50GB High Speed Data with unlimited throttled",
    usage: 15,
    total: 50,
    unit: "GB",
    status: "active",
    renewDate: "2026-02-01",
    price: 29.99,
    currency: "USD",
  },
  {
    id: "svc-002",
    name: "International Roaming",
    type: "addon",
    description: "Unlimited roaming in 50+ countries",
    status: "active",
    renewDate: "2026-02-01",
    price: 9.99,
    currency: "USD",
  },
  {
    id: "svc-003",
    name: "Caller ID",
    type: "feature",
    description: "Display caller information on incoming calls",
    status: "active",
    renewDate: null,
    price: 2.99,
    currency: "USD",
  },
  {
    id: "svc-004",
    name: "Family Bundle",
    type: "bundle",
    description: "Shared 100GB data for up to 4 lines",
    usage: 45,
    total: 100,
    unit: "GB",
    status: "active",
    renewDate: "2026-02-15",
    price: 79.99,
    currency: "USD",
  },
  {
    id: "svc-005",
    name: "Voicemail Plus",
    type: "feature",
    description: "Visual voicemail with transcription",
    status: "suspended",
    renewDate: null,
    price: 4.99,
    currency: "USD",
  },
];

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response: ServicesResponse = {
    services: mockServices,
  };

  return NextResponse.json(response);
}
