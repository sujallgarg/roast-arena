import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureLiveBattle } from "@/lib/battle-service";
import { getAuthenticatedUser } from "@/lib/auth";
import { awardXP } from "@/lib/xp-service";
import { recordQuestProgress } from "@/lib/quest-service";
import crypto from "crypto";
import { ReactionType, BattleStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const battle = await ensureLiveBattle();

    if (battle.status === BattleStatus.ENDED) {
      return NextResponse.json(
        { error: "This battle has ended. Voting is closed." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { brand } = body; // "NIKE" or "ADIDAS"

    if (brand !== "NIKE" && brand !== "ADIDAS") {
      return NextResponse.json(
        { error: "Invalid brand vote selection." },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "You must log in or create an account to vote! Please log in first.",
          requireAuth: true,
        },
        { status: 401 }
      );
    }

    // 1. CHECK IF USER HAS JOINED THE BATTLE
    const participant = await prisma.battleParticipant.findFirst({
      where: { battleId: battle.id, userId: user.id },
    });

    if (!participant) {
      return NextResponse.json(
        {
          error: "You must join the battle first before you can vote! Click 'Join Battle' to participate.",
          requireJoin: true,
        },
        { status: 403 }
      );
    }

    // 2. CHECK IF USER HAS ALREADY VOTED
    const existingVote = await prisma.vote.findFirst({
      where: { battleId: battle.id, userId: user.id },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already cast your vote in this battle round." },
        { status: 400 }
      );
    }

    // 3. TARGET BRAND
    const chosenBrandId =
      brand === "NIKE" ? battle.brandAId : battle.brandBId;

    // 4. RECORD VOTE AND UPDATE DATABASE COUNTS
    const [, updatedBattle] = await prisma.$transaction([
      prisma.vote.create({
        data: {
          battleId: battle.id,
          chosenBrandId,
          reactionType: ReactionType.SAVAGE,
          ipHash: `user-${user.id}`,
          userId: user.id,
        },
      }),
      prisma.battle.update({
        where: { id: battle.id },
        data: {
          votesCountA: brand === "NIKE" ? { increment: 1 } : undefined,
          votesCountB: brand === "ADIDAS" ? { increment: 1 } : undefined,
        },
        select: {
          votesCountA: true,
          votesCountB: true,
        },
      }),
    ]);

    // 5. Award XP and record quest progress via centralized gamification engine
    let xpResult = null;
    if (user?.id) {
      xpResult = await awardXP(user.id, "VOTE", {
        sourceId: battle.id,
        description: `Voted for ${brand} in ${battle.title}`,
      });
      await recordQuestProgress(user.id, "VOTE");
    }

    const totalVotes = updatedBattle.votesCountA + updatedBattle.votesCountB;
    const percentA = totalVotes > 0 ? Math.round((updatedBattle.votesCountA / totalVotes) * 100) : 50;
    const percentB = 100 - percentA;

    return NextResponse.json({
      success: true,
      message: `Vote registered for ${brand}! ${xpResult?.amountAwarded ? `+${xpResult.amountAwarded} XP awarded.` : ""}`,
      brand,
      votesCountA: updatedBattle.votesCountA,
      votesCountB: updatedBattle.votesCountB,
      totalVotes,
      percentA,
      percentB,
      xpAwarded: xpResult?.amountAwarded || 0,
      leveledUp: xpResult?.leveledUp || false,
      newLevel: xpResult?.newLevel,
      newTitle: xpResult?.newTitle,
      newlyUnlockedBadges: xpResult?.newlyUnlockedBadges || [],
    });
  } catch (error) {
    console.error("Error casting vote:", error);
    return NextResponse.json(
      { error: "Failed to record vote. Please try again." },
      { status: 500 }
    );
  }
}
