import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { awardXP } from "@/lib/xp-service";
import { recordQuestProgress } from "@/lib/quest-service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: battleId } = await context.params;
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Battle shared!",
        xpAwarded: 0,
      });
    }

    // Increment battlesShared in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        battlesShared: { increment: 1 },
      },
    });

    // Centralized XP award with daily limit (max 2/day)
    const xpResult = await awardXP(user.id, "SHARE", {
      sourceId: battleId,
      description: "Shared battle duel with friends",
    });

    // Record daily quest progress
    const questResult = await recordQuestProgress(user.id, "SHARE");

    return NextResponse.json({
      success: true,
      message: xpResult.amountAwarded > 0 ? `Battle shared! +${xpResult.amountAwarded} XP` : "Battle shared!",
      xpAwarded: xpResult.amountAwarded,
      newTotalXP: xpResult.newTotalXP,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel,
      newTitle: xpResult.newTitle,
      newlyUnlockedBadges: xpResult.newlyUnlockedBadges,
      completedQuest: questResult.completedQuest,
    });
  } catch (error) {
    console.error("Error handling battle share:", error);
    return NextResponse.json(
      { error: "Failed to record share." },
      { status: 500 }
    );
  }
}
