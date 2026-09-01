import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { calculateLevelInfo } from "@/lib/level-service";
import { getUserDailyQuests } from "@/lib/quest-service";
import { ensureBadgesSeeded } from "@/lib/badge-service";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureBadgesSeeded();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
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

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalXP = dbUser.points || 0;
    const levelInfo = calculateLevelInfo(totalXP);

    // Run database aggregations in parallel
    const [
      battlesParticipated,
      votesCast,
      commentsPosted,
      upvotesAgg,
      badgesEarned,
      battlesWon,
      rankCount,
      dailyQuests,
      recentActivities,
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
      // Leaderboard Rank: count how many users have more points + 1
      prisma.user.count({
        where: { points: { gt: totalXP } },
      }),
      getUserDailyQuests(user.id),
      prisma.userActivity.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.userBadge.findMany({
        where: { userId: user.id },
        orderBy: { unlockedAt: "desc" },
        take: 4,
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
        id: dbUser.id,
        name: dbUser.name || dbUser.username,
        username: dbUser.username,
        email: dbUser.email,
        avatarUrl:
          dbUser.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        bio: dbUser.bio || "Here for savage comebacks. 🔥",
        location: dbUser.location || "Global",
        joinedDate: dbUser.createdAt
          ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
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
        battlesShared: dbUser.battlesShared || 0,
        badgesEarned,
        brandsFollowed: 18,
        currentStreak: dbUser.currentStreak || 1,
        longestStreak: dbUser.longestStreak || 1,
        leaderboardRank: globalRank,
        winRate,
      },
      dailyQuests,
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        xpEarned: a.xpEarned,
        createdAt: a.createdAt,
      })),
      featuredBadges: recentBadges.map((ub) => ({
        id: ub.badge.id,
        slug: ub.badge.slug,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        rarity: ub.badge.rarity,
        unlockedAt: ub.unlockedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error fetching profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, bio, location, avatarUrl } = body;

    // Validate username uniqueness if changed
    if (username && username !== user.username) {
      const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");
      const existing = await prisma.user.findUnique({
        where: { username: cleanUsername },
      });
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: "Username is already taken by another user." },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name ? name.trim() : undefined,
        username: username
          ? username.trim().toLowerCase().replace(/^@/, "")
          : undefined,
        bio: bio !== undefined ? bio.trim() : undefined,
        location: location !== undefined ? location.trim() : undefined,
        avatarUrl: avatarUrl ? avatarUrl.trim() : undefined,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        location: true,
        points: true,
        level: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile in database:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
