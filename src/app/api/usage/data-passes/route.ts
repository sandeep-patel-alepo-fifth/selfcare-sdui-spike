import { NextResponse } from "next/server";
import { DataPass, DataPassesResponse } from "@/types/usage";

// Mock data passes - in production this would come from a real API
const mockAvailablePasses: DataPass[] = [
  {
    id: "dp-001",
    name: "Weekend Data Boost",
    description: "Extra 10GB for the weekend",
    dataAmount: 10,
    price: 4.99,
    currency: "USD",
    validity: 2,
    status: "available",
    expiryDate: null,
    purchaseDate: null,
  },
  {
    id: "dp-002",
    name: "Weekly Data Pack",
    description: "20GB valid for 7 days",
    dataAmount: 20,
    price: 9.99,
    currency: "USD",
    validity: 7,
    status: "available",
    expiryDate: null,
    purchaseDate: null,
  },
  {
    id: "dp-003",
    name: "Monthly Data Pack",
    description: "50GB valid for 30 days",
    dataAmount: 50,
    price: 19.99,
    currency: "USD",
    validity: 30,
    status: "available",
    expiryDate: null,
    purchaseDate: null,
  },
  {
    id: "dp-004",
    name: "Night Owl Pack",
    description: "Unlimited data from 12AM to 6AM",
    dataAmount: 999,
    price: 2.99,
    currency: "USD",
    validity: 1,
    status: "available",
    expiryDate: null,
    purchaseDate: null,
  },
];

const mockActivePasses: DataPass[] = [
  {
    id: "dp-005",
    name: "Social Media Pack",
    description: "Unlimited social media for 7 days",
    dataAmount: 5,
    dataUsed: 2.3,
    price: 3.99,
    currency: "USD",
    validity: 7,
    status: "active",
    expiryDate: "2026-01-25",
    purchaseDate: "2026-01-18",
  },
];

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response: DataPassesResponse = {
    available: mockAvailablePasses,
    active: mockActivePasses,
  };

  return NextResponse.json(response);
}
