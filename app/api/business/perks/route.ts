import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("brand_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a brand." }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const authorBrandId = sessionData.id;

    const body = await request.json();
    const { battleId, perkTitle, perkCode, perkLink } = body;

    if (!battleId) {
      return NextResponse.json({ error: "Battle ID is required." }, { status: 400 });
    }

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return NextResponse.json({ error: "Battle arena not found." }, { status: 404 });
    }

    if (battle.brandAId !== authorBrandId && battle.brandBId !== authorBrandId) {
      return NextResponse.json(
        { error: "Your brand is not a contender in this battle." },
        { status: 403 }
      );
    }

    const updatedBattle = await prisma.battle.update({
      where: { id: battleId },
      data: {
        perkTitle: perkTitle?.trim() || null,
        perkCode: perkCode?.trim() || null,
        perkLink: perkLink?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Battle perk offer updated successfully!",
      battle: updatedBattle,
    });
  } catch (error) {
    console.error("Error updating battle perk:", error);
    return NextResponse.json(
      { error: "Failed to update battle perk offer." },
      { status: 500 }
    );
  }
}
