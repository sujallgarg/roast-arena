import { NextRequest, NextResponse } from "next/server";
import { createOrGetGoogleUser, setUserSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      request.nextUrl.origin;
    const returnTo = request.nextUrl.searchParams.get("returnTo") || "/battles";

    if (clientId) {
      const redirectUri =
        process.env.GOOGLE_REDIRECT_URI ||
        `${baseUrl}/api/auth/google/callback`;
      const scope = encodeURIComponent("openid email profile");
      const state = encodeURIComponent(returnTo);
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account&state=${state}`;

      // Check if client expects JSON configuration check
      if (
        request.headers.get("accept")?.includes("application/json") ||
        request.nextUrl.searchParams.get("format") === "json"
      ) {
        return NextResponse.json({ configured: true, authUrl: googleAuthUrl });
      }

      return NextResponse.redirect(googleAuthUrl);
    }

    return NextResponse.json({
      configured: false,
      message:
        "GOOGLE_CLIENT_ID is not configured in environment variables. Instant Google session is supported via POST.",
    });
  } catch (error) {
    console.error("Error in Google Auth GET handler:", error);
    return NextResponse.json(
      { error: "Internal server error initiating Google Auth." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let email = body.email;
    let name = body.name;
    let avatarUrl = body.avatarUrl;

    // Handle Google Identity Services JWT credential if present
    if (body.credential && typeof body.credential === "string") {
      try {
        const parts = body.credential.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString("utf-8")
          );
          if (payload.email) {
            email = payload.email;
            name = payload.name || name;
            avatarUrl = payload.picture || avatarUrl;
          }
        }
      } catch (e) {
        console.error("Failed to decode Google ID Token payload:", e);
      }
    }

    // Default fallback for demo / instant testing
    if (!email) {
      email = "google.voter@arena.com";
      name = name || "Google Voter";
      avatarUrl =
        avatarUrl ||
        "https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleVoter";
    }

    const user = await createOrGetGoogleUser({
      email,
      name,
      avatarUrl,
    });

    await setUserSessionCookie(user.id);

    return NextResponse.json({
      success: true,
      message: `Signed in with Google as ${user.name || user.username}! 🔥`,
      user,
    });
  } catch (error) {
    console.error("Error processing Google sign-in:", error);
    return NextResponse.json(
      {
        error: `Internal server error during Google sign-in: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
