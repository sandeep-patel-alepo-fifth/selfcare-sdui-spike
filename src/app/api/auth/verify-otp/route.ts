import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "@/lib/auth/otp-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;
    const tenantId = request.headers.get("x-tenant-id") || "default";

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone number and verification code are required" },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code format" },
        { status: 400 }
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Verify OTP
    const result = otpStore.verify(phone, otp);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    console.log(`[MOCK API] OTP verified for ${phone}`);

    // Return mock user data for existing user login
    const user = {
      id: `user_${Date.now()}`,
      tenantId,
      phone,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      accountType: "postpaid" as const,
      status: "active" as const,
      roles: ["user"],
      mfaEnabled: true,
      lastLoginAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
      verified: true,
      user,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
