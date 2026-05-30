import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { currentPassword, newPassword, confirmPassword } = body || {};

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          error:
            "Current password, new password, and confirmation are required.",
        },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: "Service temporarily unavailable." },
        { status: 503 },
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    const token = authHeader.slice(7);

    // Verify the current session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 },
      );
    }

    // Verify current password by attempting to sign in with it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 },
      );
    }

    // Update the password using the admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword },
    );

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update password. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Password updated successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
