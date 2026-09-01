import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import crypto from "crypto";
import { ReactionType } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: battleId } = await params;

    const battle = await prisma.battle.findFirst({
      where: {
        OR: [{ id: battleId }, { slug: battleId }],
      },
      select: {
        id: true,
        votesCountA: true,
        votesCountB: true,
        brandAId: true,
        brandBId: true,
      },
    });

    if (!battle) {
      return NextResponse.json({ error: "Battle not found" }, { status: 404 });
    }

    const totalVotes = battle.votesCountA + battle.votesCountB;
    const percentA = totalVotes > 0 ? Math.round((battle.votesCountA / totalVotes) * 100) : 50;
    const percentB = 100 - percentA;

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const rawIp = forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";
    const ipHash = crypto
      .createHash("sha256")
      .update(`${rawIp}-${battle.id}`)
      .digest("hex");

    const existingVote = await prisma.vote.findFirst({
      where: { battleId: battle.id, ipHash },
      select: { chosenBrandId: true, reactionType: true },
    });

    return NextResponse.json({
      success: true,
      votesCountA: battle.votesCountA,
      votesCountB: battle.votesCountB,
      totalVotes,
      percentA,
      percentB,
      userVote: existingVote || null,
    });
  } catch (error) {
    console.error("Error fetching vote status:", error);
    return NextResponse.json(
      { error: `Internal server error fetching vote status: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "You must be logged in to cast a vote! Please log in or create an account.",
          requireAuth: true,
        },
        { status: 401 }
      );
    }

    const { id: battleId } = await params;
    const body = await request.json();
    const { chosenBrandId, reactionType = "SAVAGE" } = body;

    if (!chosenBrandId) {
      return NextResponse.json(
        { error: "chosenBrandId is required" },
        { status: 400 }
      );
    }

    // Extract client IP for anonymized hash deduplication
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const rawIp = forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";
    
    // Hash IP address with SHA-256 for privacy & rate limiting
    const ipHash = crypto
      .createHash("sha256")
      .update(`${rawIp}-${battleId}`)
      .digest("hex");

    // Fetch target battle
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        brandA: true,
        brandB: true,
      },
    });

    if (!battle) {
      return NextResponse.json(
        { error: "Battle not found" },
        { status: 404 }
      );
    }

    // Verify chosen brand belongs to this battle
    if (
      chosenBrandId !== battle.brandAId &&
      chosenBrandId !== battle.brandBId
    ) {
      return NextResponse.json(
        { error: "Invalid chosen brand for this battle" },
        { status: 400 }
      );
    }

    // Check existing vote by this IP hash
    const existingVote = await prisma.vote.findFirst({
      where: {
        battleId,
        ipHash,
      },
    });

    const validatedReaction: ReactionType =
      reactionType === "MID" || reactionType === "CRINGE" ? reactionType : "SAVAGE";

    let updatedBattle;

    if (existingVote) {
      // If user already voted for the exact same brand & reaction, acknowledge without double counting
      if (existingVote.chosenBrandId === chosenBrandId) {
        return NextResponse.json({
          success: true,
          message: "Vote already recorded for this brand",
          alreadyVotedSame: true,
          votesCountA: battle.votesCountA,
          votesCountB: battle.votesCountB,
          chosenBrandId,
          reactionType: existingVote.reactionType,
        });
      }

      // Switch vote from Brand A to Brand B or vice versa in a transaction
      const isSwitchingToA = chosenBrandId === battle.brandAId;

      updatedBattle = await prisma.$transaction(async (tx) => {
        // Update existing vote
        await tx.vote.update({
          where: { id: existingVote.id },
          data: {
            chosenBrandId,
            reactionType: validatedReaction,
          },
        });

        // Update vote counts atomically
        return await tx.battle.update({
          where: { id: battleId },
          data: {
            votesCountA: isSwitchingToA
              ? { increment: 1 }
              : { decrement: Math.min(1, battle.votesCountA) },
            votesCountB: isSwitchingToA
              ? { decrement: Math.min(1, battle.votesCountB) }
              : { increment: 1 },
          },
        });
      });
    } else {
      // New vote creation in a transaction
      const isBrandA = chosenBrandId === battle.brandAId;

      updatedBattle = await prisma.$transaction(async (tx) => {
        await tx.vote.create({
          data: {
            battleId,
            chosenBrandId,
            reactionType: validatedReaction,
            ipHash,
          },
        });

        return await tx.battle.update({
          where: { id: battleId },
          data: {
            votesCountA: isBrandA ? { increment: 1 } : battle.votesCountA,
            votesCountB: !isBrandA ? { increment: 1 } : battle.votesCountB,
          },
        });
      });
    }

    const totalVotes = updatedBattle.votesCountA + updatedBattle.votesCountB;
    const percentA = totalVotes > 0 ? Math.round((updatedBattle.votesCountA / totalVotes) * 100) : 50;
    const percentB = 100 - percentA;

    return NextResponse.json({
      success: true,
      votesCountA: updatedBattle.votesCountA,
      votesCountB: updatedBattle.votesCountB,
      totalVotes,
      percentA,
      percentB,
      chosenBrandId,
      reactionType: validatedReaction,
    });
  } catch (error) {
    console.error("Error casting vote:", error);
    return NextResponse.json(
      { error: "Internal server error casting vote" },
      { status: 500 }
    );
  }
}
