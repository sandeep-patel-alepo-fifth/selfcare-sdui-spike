import { NextResponse } from "next/server";
import { UserPreferences } from "@/types/profile";

// Mock preferences data
let mockPreferences: UserPreferences = {
  language: "en",
  theme: "auto",
  notifications: {
    email: true,
    sms: true,
    push: false,
  },
};

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json({ preferences: mockPreferences });
}

export async function PUT(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const body = await request.json();

    // In production, validate and save to database
    mockPreferences = {
      language: body.language || mockPreferences.language,
      theme: body.theme || mockPreferences.theme,
      notifications: {
        email: body.notifications?.email ?? mockPreferences.notifications.email,
        sms: body.notifications?.sms ?? mockPreferences.notifications.sms,
        push: body.notifications?.push ?? mockPreferences.notifications.push,
      },
    };

    return NextResponse.json({ preferences: mockPreferences });
  } catch {
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 400 }
    );
  }
}
