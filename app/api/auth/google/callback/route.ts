import { NextRequest, NextResponse } from "next/server";
import { createOrGetGoogleUser, setUserSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state") || "/";
    const error = searchParams.get("error");

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      request.nextUrl.origin;

    if (error) {
      console.error("Google OAuth error parameter:", error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, baseUrl)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/login?error=missing_code", baseUrl)
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in env.");
      return NextResponse.redirect(
        new URL("/login?error=oauth_unconfigured", baseUrl)
      );
    }

    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${baseUrl}/api/auth/google/callback`;

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Failed to exchange Google OAuth code:", tokenData);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            tokenData.error_description || "token_exchange_failed"
          )}`,
          baseUrl
        )
      );
    }

    // 2. Fetch user profile from Google UserInfo endpoint
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const profile = await profileRes.json();

    if (!profileRes.ok || !profile.email) {
      console.error("Failed to fetch Google profile:", profile);
      return NextResponse.redirect(
        new URL("/login?error=profile_fetch_failed", baseUrl)
      );
    }

    // 3. Create or find the user in database
    const user = await createOrGetGoogleUser({
      email: profile.email,
      name: profile.name || profile.given_name,
      avatarUrl: profile.picture,
    });

    // 4. Set the HTTP session cookie
    await setUserSessionCookie(user.id);

    // 5. Redirect back to original destination or home dashboard
    const destination =
      state && state !== "/" ? (state.startsWith("/") ? state : `/${state}`) : "/battles";
    return NextResponse.redirect(new URL(destination, baseUrl));
  } catch (err) {
    console.error("Unexpected error in Google OAuth callback:", err);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    return NextResponse.redirect(
      new URL("/login?error=internal_oauth_error", baseUrl)
    );
  }
}
