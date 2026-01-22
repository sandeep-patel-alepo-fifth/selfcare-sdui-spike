import { NextResponse } from "next/server";
import { SessionsApiResponse } from "@/types/profile";
import { mockSessions } from "./mockSessions";

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response: SessionsApiResponse = {
    sessions: mockSessions,
  };

  return NextResponse.json(response);
}

export async function DELETE() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // This is for bulk delete - individual delete is handled by [sessionId]/route.ts
  // In production, delete all non-current sessions for the authenticated user
  // For mock purposes, we just return success

  return NextResponse.json({ success: true, message: "All other sessions logged out" });
}
