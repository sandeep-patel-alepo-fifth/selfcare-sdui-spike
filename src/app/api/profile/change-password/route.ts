import { NextResponse } from "next/server";
import { PasswordChangeResponse, PasswordChangeSchema } from "@/types/profile";
import { ZodError } from "zod";

export async function POST(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const body = await request.json();

    // Validate request body using Zod schema
    // This validates: min 8 chars, uppercase, lowercase, number, passwords match, new != current
    const validatedData = PasswordChangeSchema.parse(body);
    const { currentPassword } = validatedData;

    // In production, verify current password and update in database
    // For now, we'll simulate a successful password change
    // unless the current password is "wrong"
    if (currentPassword === "wrong") {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const response: PasswordChangeResponse = {
      success: true,
      message: "Password changed successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { success: false, message: firstError.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to change password" },
      { status: 500 }
    );
  }
}
