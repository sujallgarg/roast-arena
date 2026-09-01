import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureLiveBattle } from "@/lib/battle-service";
import { getAuthenticatedUser } from "@/lib/auth";
import { BattleStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const battle = await ensureLiveBattle();

    if (battle.status === BattleStatus.ENDED) {
      return NextResponse.json(
        { error: "This battle has already ended. Joining is closed." },
        { status: 400 }
      );
    }

    // MANDATORY AUTHENTICATION: User must be logged in to join the battle
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "You must log in or create an account to join the battle!",
          requireAuth: true,
        },
        { status: 401 }
      );
    }

    // Check if user has already joined
    const existing = await prisma.battleParticipant.findFirst({
      where: {
        battleId: battle.id,
        userId: user.id,
      },
    });

    const currentJoinedCount = await prisma.battleParticipant.count({
      where: { battleId: battle.id },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You have already joined this battle.",
        hasJoined: true,
        joinedCount: currentJoinedCount,
      });
    }

    // Create participant in PostgreSQL linked directly to the authenticated user
    await prisma.battleParticipant.create({
      data: {
        battleId: battle.id,
        userId: user.id,
        ipHash: `user-${user.id}`,
      },
    });

    const newJoinedCount = await prisma.battleParticipant.count({
      where: { battleId: battle.id },
    });

    await prisma.battle.update({
      where: { id: battle.id },
      data: {
        joinedCount: newJoinedCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined the battle! You are now eligible to vote.",
      hasJoined: true,
      joinedCount: newJoinedCount,
    });
  } catch (error) {
    console.error("Error joining battle:", error);
    return NextResponse.json(
      { error: "Failed to join battle. Please try again." },
      { status: 500 }
    );
  }
}
