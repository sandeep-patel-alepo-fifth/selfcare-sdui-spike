import { NextResponse } from "next/server";
import { Profile, ProfileApiResponse, ProfileUpdateSchema } from "@/types/profile";
import { ZodError } from "zod";

// Mock profile data - in production this would come from a real API
const mockProfile: Profile = {
  id: "user-123",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  address: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
  },
  avatarUrl: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2026-01-20T10:30:00Z",
};

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response: ProfileApiResponse = {
    profile: mockProfile,
    preferences: {
      language: "en",
      theme: "auto",
      notifications: {
        email: true,
        sms: true,
        push: false,
      },
    },
  };

  return NextResponse.json(response);
}

export async function PUT(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const body = await request.json();

    // Validate request body using Zod schema
    const validatedData = ProfileUpdateSchema.parse(body);

    // In production, save validated data to database
    const updatedProfile: Profile = {
      ...mockProfile,
      firstName: validatedData.firstName || mockProfile.firstName,
      lastName: validatedData.lastName || mockProfile.lastName,
      email: validatedData.email ?? mockProfile.email,
      address: validatedData.address || mockProfile.address,
      avatarUrl: validatedData.avatarUrl ?? mockProfile.avatarUrl,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 400 }
    );
  }
}
