import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLevelInfo } from "@/lib/level-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");

    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
        location: true,
        points: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        battlesShared: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalXP = user.points || 0;
    const levelInfo = calculateLevelInfo(totalXP);

    const [
      battlesParticipated,
      votesCast,
      commentsPosted,
      upvotesAgg,
      badgesEarned,
      battlesWon,
      rankCount,
      recentBadges,
    ] = await Promise.all([
      prisma.battleParticipant.count({ where: { userId: user.id } }),
      prisma.vote.count({ where: { userId: user.id } }),
      prisma.comment.count({ where: { userId: user.id } }),
      prisma.comment.aggregate({
        where: { userId: user.id },
        _sum: { upvotesCount: true },
      }),
      prisma.userBadge.count({ where: { userId: user.id } }),
      prisma.vote.count({
        where: {
          userId: user.id,
          battle: {
            status: "ENDED",
            winnerBrandId: { not: null },
          },
        },
      }),
      prisma.user.count({
        where: { points: { gt: totalXP } },
      }),
      prisma.userBadge.findMany({
        where: { userId: user.id },
        orderBy: { unlockedAt: "desc" },
        take: 6,
        include: { badge: true },
      }),
    ]);

    const commentUpvotes = upvotesAgg._sum.upvotesCount || 0;
    const globalRank = rankCount + 1;
    const winRate =
      battlesParticipated > 0
        ? Math.round((battlesWon / battlesParticipated) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      user: {
        name: user.name || user.username,
        username: user.username,
        avatarUrl:
          user.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        bio: user.bio || "Here for savage comebacks. 🔥",
        location: user.location || "Global",
        joinedDate: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : "Joined 2024",
        currentTitle: levelInfo.currentTitle,
        verifiedBadge: true,
      },
      level: levelInfo,
      stats: {
        totalXP,
        battlesParticipated,
        battlesWon,
        votesCast,
        commentsPosted,
        commentUpvotes,
        battlesShared: user.battlesShared || 0,
        badgesEarned,
        brandsFollowed: 18,
        currentStreak: user.currentStreak || 1,
        longestStreak: user.longestStreak || 1,
        leaderboardRank: globalRank,
        winRate,
      },
      featuredBadges: recentBadges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        rarity: ub.badge.rarity,
        unlockedAt: ub.unlockedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching public user profile:", error);
    return NextResponse.json(
      { error: "Internal server error fetching public profile" },
      { status: 500 }
    );
  }
}
