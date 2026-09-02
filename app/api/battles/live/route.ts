import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureLiveBattle } from "@/lib/battle-service";
import { getAuthenticatedUser } from "@/lib/auth";
import { recordViewerPresence } from "@/lib/presence";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const battle = await ensureLiveBattle();
    const user = await getAuthenticatedUser();

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const rawIp = forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";
    const ipHash = crypto
      .createHash("sha256")
      .update(`${rawIp}-${battle.id}`)
      .digest("hex");

    // Check if user has joined
    let hasJoined = false;
    let userVote: "NIKE" | "ADIDAS" | null = null;

    if (user?.id) {
      // Authenticated user: find strictly by database userId
      const participant = await prisma.battleParticipant.findFirst({
        where: { battleId: battle.id, userId: user.id },
      });
      hasJoined = !!participant;

      const existingVote = await prisma.vote.findFirst({
        where: { battleId: battle.id, userId: user.id },
        include: { chosenBrand: true },
      });
      if (existingVote) {
        userVote = existingVote.chosenBrand.slug === "nike" ? "NIKE" : "ADIDAS";
      }
    } else {
      // Unauthenticated / logged-out user:
      // Check only if guest has an active guest token cookie
      const guestToken = request.cookies.get("coroast_guest_token")?.value;
      if (guestToken) {
        const participant = await prisma.battleParticipant.findFirst({
          where: { battleId: battle.id, ipHash: guestToken },
        });
        hasJoined = !!participant;

        const existingVote = await prisma.vote.findFirst({
          where: { battleId: battle.id, ipHash: guestToken },
          include: { chosenBrand: true },
        });
        if (existingVote) {
          userVote = existingVote.chosenBrand.slug === "nike" ? "NIKE" : "ADIDAS";
        }
      }
    }

    // Fetch database comments
    const comments = await prisma.comment.findMany({
      where: { battleId: battle.id },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        user: {
          select: {
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const formattedComments = comments.map((c) => ({
      id: c.id,
      author: c.authorName,
      authorHandle: c.authorHandle,
      avatar: c.user?.avatarUrl || c.authorAvatar,
      text: c.content,
      likes: c.upvotesCount,
      time: "Recent",
    }));

    const totalVotes = battle.votesCountA + battle.votesCountB;
    const percentA = totalVotes > 0 ? Math.round((battle.votesCountA / totalVotes) * 100) : 62;
    const percentB = 100 - percentA;

    // 1. Real users who joined from PostgreSQL Database
    const realJoinedCount = await prisma.battleParticipant.count({
      where: { battleId: battle.id },
    });
    if (battle.joinedCount !== realJoinedCount) {
      await prisma.battle.update({
        where: { id: battle.id },
        data: { joinedCount: realJoinedCount },
      });
    }

    // 2. Real users watching at current time
    const viewerKey = user?.id ? `user-${user.id}` : `ip-${ipHash.slice(0, 16)}`;
    const watchingCount = recordViewerPresence(viewerKey);

    return NextResponse.json({
      success: true,
      battleId: battle.id,
      slug: battle.slug,
      title: battle.title,
      brandA: battle.brandA,
      brandB: battle.brandB,
      status: battle.status,
      joinedCount: realJoinedCount,
      watchingCount,
      hasJoined,
      hasVoted: userVote,
      votesCountA: battle.votesCountA,
      votesCountB: battle.votesCountB,
      totalVotes,
      percentA,
      percentB,
      comments: formattedComments,
    });
  } catch (error) {
    console.error("Error loading live battle:", error);
    return NextResponse.json(
      { error: "Failed to load live battle from database." },
      { status: 500 }
    );
  }
}
