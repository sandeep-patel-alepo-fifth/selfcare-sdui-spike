import { NextRequest, NextResponse } from "next/server";
import {
  DataPassPurchaseRequest,
  DataPassPurchaseResponse,
  DataPass,
  DataPassPurchaseRequestSchema,
} from "@/types/usage";

// Mock available passes for validation
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

export async function POST(request: NextRequest) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const body = await request.json();

    // Validate request
    const validationResult = DataPassPurchaseRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const response: DataPassPurchaseResponse = {
        success: false,
        error: "Invalid request data",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { dataPassId }: DataPassPurchaseRequest = validationResult.data;

    // Find the data pass
    const dataPass = mockAvailablePasses.find((p) => p.id === dataPassId);
    if (!dataPass) {
      const response: DataPassPurchaseResponse = {
        success: false,
        error: "Data pass not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Simulate purchase processing
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + dataPass.validity);

    const purchasedPass: DataPass = {
      ...dataPass,
      status: "active",
      dataUsed: 0,
      purchaseDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
    };

    const response: DataPassPurchaseResponse = {
      success: true,
      dataPass: purchasedPass,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: DataPassPurchaseResponse = {
      success: false,
      error: "Failed to process purchase",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
