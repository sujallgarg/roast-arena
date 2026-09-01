import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("brand_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a brand." }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const authorBrandId = sessionData.id;

    const body = await request.json();
    const { battleId, content, mediaUrl, mediaType, roundNumber } = body;

    if (!battleId || !content || !content.trim()) {
      return NextResponse.json(
        { error: "Battle ID and roast content are required." },
        { status: 400 }
      );
    }

    // Verify that battle exists and brand is a participant
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return NextResponse.json({ error: "Battle arena not found." }, { status: 404 });
    }

    if (battle.brandAId !== authorBrandId && battle.brandBId !== authorBrandId) {
      return NextResponse.json(
        { error: "Your brand is not a registered contender in this battle arena." },
        { status: 403 }
      );
    }

    // Create the roast post
    const newRoast = await prisma.roastPost.create({
      data: {
        battleId,
        authorBrandId,
        content: content.trim(),
        mediaUrl: mediaUrl?.trim() || null,
        mediaType: mediaType || (mediaUrl ? "image" : null),
        roundNumber: Number(roundNumber) || 1,
        likesCount: Math.floor(Math.random() * 50) + 10, // Initial organic traction
      },
      include: {
        authorBrand: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Official roast published live to the battle arena!",
      roast: newRoast,
    });
  } catch (error) {
    console.error("Error creating official roast post:", error);
    return NextResponse.json(
      { error: "Failed to publish official roast post." },
      { status: 500 }
    );
  }
}
