import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching active user:", error);
    return NextResponse.json(
      { error: "Internal server error fetching session user." },
      { status: 500 }
    );
  }
}
