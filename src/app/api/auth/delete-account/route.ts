import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { password, confirmText } = body || {};

    // Validation
    if (!password) {
      return NextResponse.json(
        { error: "Password is required to delete account." },
        { status: 400 },
      );
    }

    if (confirmText !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: 'Please confirm by typing "DELETE MY ACCOUNT".' },
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

    // Verify password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Incorrect password. Account deletion cancelled." },
        { status: 401 },
      );
    }

    // Delete the user using the admin API
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id,
    );

    if (deleteError) {
      console.error("Delete user error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Your account has been permanently deleted.",
      success: true,
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
