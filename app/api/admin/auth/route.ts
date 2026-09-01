import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPasskey,
  verifyAdminSession,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from "@/lib/admin-auth";

export async function GET() {
  try {
    const isAuthed = await verifyAdminSession();
    return NextResponse.json({ success: true, authenticated: isAuthed });
  } catch {
    return NextResponse.json({ success: false, authenticated: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { passkey } = body;

    if (!verifyAdminPasskey(passkey)) {
      return NextResponse.json(
        { success: false, error: "Invalid Super Admin Master Passkey" },
        { status: 401 }
      );
    }

    await setAdminSessionCookie();
    return NextResponse.json({ success: true, message: "Super Admin authenticated" });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to authenticate" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearAdminSessionCookie();
    return NextResponse.json({ success: true, message: "Logged out" });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
