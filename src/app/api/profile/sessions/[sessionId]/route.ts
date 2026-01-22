import { NextResponse } from "next/server";
import { mockSessionIds } from "../mockSessions";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { sessionId } = await params;

  // PRODUCTION TODO: In a real application, you must verify that the authenticated
  // user owns the session being terminated. This requires:
  // 1. Getting the authenticated user ID from the request (e.g., from JWT or session)
  // 2. Looking up the session in the database
  // 3. Verifying that session.userId matches the authenticated user's ID
  // 4. Only then proceeding with the deletion
  // Failure to do this allows any authenticated user to terminate any other user's sessions.

  // Don't allow deleting the current session
  if (sessionId === "current") {
    return NextResponse.json(
      { success: false, message: "Cannot logout current session" },
      { status: 400 }
    );
  }

  // Mock validation: Check if sessionId exists in our mock sessions
  if (!mockSessionIds.has(sessionId)) {
    return NextResponse.json(
      { success: false, message: "Session not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Session ${sessionId} logged out successfully`,
  });
}
