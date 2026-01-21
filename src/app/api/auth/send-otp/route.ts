import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "@/lib/auth/otp-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP (use "123456" for easy demo testing)
    const otp = "123456"; // Fixed for demo - easy to remember

    // Store OTP with 5-minute expiry
    otpStore.set(cleanPhone, otp, 5);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log(`[MOCK API] OTP sent to ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
      // Include OTP hint for demo
      hint: "Use 123456 for demo",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
