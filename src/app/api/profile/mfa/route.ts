import { NextResponse } from "next/server";
import { MfaSettings, MfaToggleResponse } from "@/types/profile";

// Mock MFA settings
let mockMfaSettings: MfaSettings = {
  enabled: false,
  method: "sms",
  phone: "+1234567890",
  email: "john.doe@example.com",
};

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json({ mfa: mockMfaSettings });
}

export async function PUT(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const body = await request.json();
    const { enabled, method } = body;

    // In production, this would:
    // 1. If enabling MFA, send verification code
    // 2. Wait for user to verify
    // 3. Update database

    mockMfaSettings = {
      ...mockMfaSettings,
      enabled: enabled ?? mockMfaSettings.enabled,
      method: method ?? mockMfaSettings.method,
    };

    const response: MfaToggleResponse = {
      success: true,
      enabled: mockMfaSettings.enabled,
      message: mockMfaSettings.enabled
        ? "Two-factor authentication enabled successfully"
        : "Two-factor authentication disabled",
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, enabled: mockMfaSettings.enabled, message: "Failed to update MFA settings" },
      { status: 500 }
    );
  }
}
