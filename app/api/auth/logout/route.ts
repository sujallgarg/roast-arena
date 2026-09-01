import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Explicit cookie names used across auth, voting, and session
    const knownCookies = [
      "user_session",
      "coroast_guest_token",
      "coroast_vote_token",
      "coroast_has_voted",
      "coroast_verified",
      "coroast_voter_session",
      "coroast_user",
      "business_session",
    ];

    // Clear all existing cookies in the store
    const all = cookieStore.getAll();
    for (const c of all) {
      cookieStore.set(c.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
      cookieStore.delete(c.name);
    }

    for (const name of knownCookies) {
      cookieStore.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
      cookieStore.delete(name);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully. All cookies cleared.",
    });

    // Send Set-Cookie response headers to ensure browser expiries
    for (const name of knownCookies) {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }

    return response;
  } catch (error) {
    console.error("Error logging out user:", error);
    return NextResponse.json(
      { error: "Internal server error during logout." },
      { status: 500 }
    );
  }
}
