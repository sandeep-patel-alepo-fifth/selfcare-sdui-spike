import { NextRequest, NextResponse } from "next/server";

// Mock user database
const users = new Map<string, Record<string, unknown>>();

// Plan details for the mock
const planDetails: Record<string, Record<string, unknown>> = {
  // Postpaid plans
  basic: { name: "Basic", price: 29.99, data: 10, voice: 200, sms: 50 },
  premium: { name: "Premium Plus", price: 49.99, data: 25, voice: 500, sms: 1000 },
  unlimited: { name: "Unlimited", price: 79.99, data: -1, voice: -1, sms: -1 },
  // Prepaid plans
  starter: { name: "Starter", price: 15, data: 5, voice: 100, sms: 50 },
  value: { name: "Value Pack", price: 30, data: 15, voice: 300, sms: 100 },
  super: { name: "Super Saver", price: 50, data: 30, voice: -1, sms: -1 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, firstName, lastName, email, plan, planType } = body;

    // Validate required fields
    const missingFields = [];
    if (!phone) missingFields.push("phone");
    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (!email) missingFields.push("email");
    if (!plan) missingFields.push("plan");
    if (!planType) missingFields.push("planType");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const cleanPhone = phone.replace(/\D/g, "");
    if (users.has(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "An account with this phone number already exists" },
        { status: 409 }
      );
    }

    // Get plan details
    const selectedPlan = planDetails[plan];
    if (!selectedPlan) {
      return NextResponse.json(
        { success: false, error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create user
    const userId = `user-${Date.now()}`;
    const user = {
      id: userId,
      phone: cleanPhone,
      firstName,
      lastName,
      email,
      plan: {
        id: plan,
        type: planType,
        name: selectedPlan.name,
        price: selectedPlan.price,
      },
      usage: {
        data: { used: 0, total: selectedPlan.data === -1 ? 999 : selectedPlan.data, unit: "GB" },
        voice: { used: 0, total: selectedPlan.voice === -1 ? 9999 : selectedPlan.voice, unit: "min" },
        sms: { used: 0, total: selectedPlan.sms === -1 ? 9999 : selectedPlan.sms, unit: "SMS" },
      },
      balance: planType === "prepaid" ? selectedPlan.price : 0,
      createdAt: new Date().toISOString(),
    };

    // Store user
    users.set(cleanPhone, user);

    console.log(`[MOCK API] User registered:`, { userId, phone, plan, planType });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: userId,
        firstName,
        lastName,
        email,
        phone,
        plan: user.plan,
        usage: user.usage,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user (for demo)
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ users: Array.from(users.values()) });
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const user = users.get(cleanPhone);

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, user });
}
