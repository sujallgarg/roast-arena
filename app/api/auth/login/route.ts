import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, email, password } = body;
    const loginTarget = (identifier || email || "").trim().toLowerCase();

    if (!loginTarget || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required." },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginTarget },
          { username: loginTarget },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email or username." },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password. Please check your credentials." },
        { status: 401 }
      );
    }

    const userPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      points: user.points,
      level: user.level,
    };

    const cookieStore = await cookies();
    cookieStore.set("user_session", JSON.stringify({ id: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: `Welcome back to Arena, ${user.name || user.username}! 🔥`,
      user: userPayload,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return NextResponse.json(
      { error: `Internal server error during user login: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
