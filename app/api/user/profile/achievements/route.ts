import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { ensureBadgesSeeded, evaluateBadges } from "@/lib/badge-service";
import { calculateLevelInfo } from "@/lib/level-service";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureBadgesSeeded();
    await evaluateBadges(user.id);

    // Compute user metrics
    const [
      votesCount,
      commentsCount,
      battlesJoined,
      upvotesAgg,
      winningVotesCount,
      dbUser,
      allBadges,
      userBadges,
    ] = await Promise.all([
      prisma.vote.count({ where: { userId: user.id } }),
      prisma.comment.count({ where: { userId: user.id } }),
      prisma.battleParticipant.count({ where: { userId: user.id } }),
      prisma.comment.aggregate({
        where: { userId: user.id },
        _sum: { upvotesCount: true },
      }),
      prisma.vote.count({
        where: {
          userId: user.id,
          battle: {
            status: "ENDED",
            winnerBrandId: { not: null },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { currentStreak: true, battlesShared: true, level: true, points: true },
      }),
      prisma.badge.findMany({
        orderBy: [{ category: "asc" }, { requirementValue: "asc" }],
      }),
      prisma.userBadge.findMany({
        where: { userId: user.id },
      }),
    ]);

    const upvotesReceived = upvotesAgg._sum.upvotesCount || 0;
    const streakDays = dbUser?.currentStreak || 1;
    const sharesCount = dbUser?.battlesShared || 0;
    const levelReached = calculateLevelInfo(dbUser?.points || 0).currentLevel;

    const metrics: Record<string, number> = {
      VOTES_COUNT: votesCount,
      COMMENTS_COUNT: commentsCount,
      BATTLES_JOINED: battlesJoined,
      UPVOTES_RECEIVED: upvotesReceived,
      BATTLES_WON: winningVotesCount,
      SHARES_COUNT: sharesCount,
      STREAK_DAYS: streakDays,
      LEVEL_REACHED: levelReached,
    };

    const unlockedMap = new Map(
      userBadges.map((ub) => [ub.badgeId, ub.unlockedAt])
    );

    interface BadgeAchievementItem {
      id: string;
      slug: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      category: string;
      requirementType: string;
      requirementValue: number;
      currentProgress: number;
      percentage: number;
      remaining: number;
      progressText: string;
      remainingText: string;
      xpReward: number;
      unlocked: boolean;
      unlockedAt: Date | null;
    }

    const unlockedList: BadgeAchievementItem[] = [];
    const lockedList: BadgeAchievementItem[] = [];

    const getUnitName = (type: string) => {
      switch (type) {
        case "VOTES_COUNT":
          return "votes";
        case "COMMENTS_COUNT":
          return "comments";
        case "UPVOTES_RECEIVED":
          return "upvotes";
        case "BATTLES_JOINED":
          return "battles";
        case "BATTLES_WON":
          return "wins";
        case "SHARES_COUNT":
          return "shares";
        case "STREAK_DAYS":
          return "days";
        case "LEVEL_REACHED":
          return "levels";
        default:
          return "actions";
      }
    };

    for (const badge of allBadges) {
      const isUnlocked = unlockedMap.has(badge.id);
      const unlockedAt = unlockedMap.get(badge.id);
      const currentVal = metrics[badge.requirementType] || 0;
      const target = badge.requirementValue;
      const progressPercent = Math.min(
        100,
        Math.round((currentVal / target) * 100)
      );
      const remaining = Math.max(0, target - currentVal);
      const unit = getUnitName(badge.requirementType);

      const item = {
        id: badge.id,
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        category: badge.category,
        requirementType: badge.requirementType,
        requirementValue: target,
        currentProgress: currentVal,
        percentage: progressPercent,
        remaining,
        progressText: `${currentVal} / ${target} ${unit} (${progressPercent}%)`,
        remainingText:
          remaining > 0
            ? `${remaining} more ${unit} to unlock`
            : "Requirement met!",
        xpReward: badge.xpReward,
        unlocked: isUnlocked,
        unlockedAt: unlockedAt || null,
      };

      if (isUnlocked) {
        unlockedList.push(item);
      } else {
        lockedList.push(item);
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        unlockedCount: unlockedList.length,
        totalCount: allBadges.length,
        completionPercentage: Math.round(
          (unlockedList.length / allBadges.length) * 100
        ),
      },
      unlocked: unlockedList,
      locked: lockedList,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
