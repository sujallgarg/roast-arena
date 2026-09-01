import { prisma } from "@/lib/prisma";
import { calculateLevelInfo } from "./level-service";

export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  category: "STARTER" | "VOTING" | "COMMENT" | "BATTLE" | "ENGAGEMENT" | "STREAK" | "LEVEL";
  requirementType:
    | "VOTES_COUNT"
    | "COMMENTS_COUNT"
    | "UPVOTES_RECEIVED"
    | "BATTLES_JOINED"
    | "BATTLES_WON"
    | "SHARES_COUNT"
    | "STREAK_DAYS"
    | "LEVEL_REACHED";
  requirementValue: number;
  xpReward: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // STARTER BADGES
  {
    slug: "first-roast",
    name: "First Roast",
    description: "Post your first roast in the arena.",
    icon: "🔥",
    rarity: "COMMON",
    category: "STARTER",
    requirementType: "COMMENTS_COUNT",
    requirementValue: 1,
    xpReward: 100,
  },
  {
    slug: "first-vote",
    name: "First Vote",
    description: "Cast your first battle vote.",
    icon: "🗳️",
    rarity: "COMMON",
    category: "STARTER",
    requirementType: "VOTES_COUNT",
    requirementValue: 1,
    xpReward: 100,
  },
  {
    slug: "first-battle",
    name: "First Battle",
    description: "Participate in your first live battle.",
    icon: "👀",
    rarity: "COMMON",
    category: "STARTER",
    requirementType: "BATTLES_JOINED",
    requirementValue: 1,
    xpReward: 100,
  },

  // VOTING BADGES
  {
    slug: "top-voter",
    name: "Top Voter",
    description: "Vote in 50 battles.",
    icon: "🗳️",
    rarity: "RARE",
    category: "VOTING",
    requirementType: "VOTES_COUNT",
    requirementValue: 50,
    xpReward: 200,
  },
  {
    slug: "vote-machine",
    name: "Vote Machine",
    description: "Vote in 100 battles.",
    icon: "🔥",
    rarity: "EPIC",
    category: "VOTING",
    requirementType: "VOTES_COUNT",
    requirementValue: 100,
    xpReward: 350,
  },
  {
    slug: "arena-regular",
    name: "Arena Regular",
    description: "Vote in 250 battles.",
    icon: "⚡",
    rarity: "EPIC",
    category: "VOTING",
    requirementType: "VOTES_COUNT",
    requirementValue: 250,
    xpReward: 500,
  },
  {
    slug: "voting-legend",
    name: "Voting Legend",
    description: "Vote in 1,000 battles.",
    icon: "👑",
    rarity: "LEGENDARY",
    category: "VOTING",
    requirementType: "VOTES_COUNT",
    requirementValue: 1000,
    xpReward: 1500,
  },

  // COMMENT BADGES
  {
    slug: "first-comment",
    name: "First Comment",
    description: "Post your first comment in the duel.",
    icon: "💬",
    rarity: "COMMON",
    category: "COMMENT",
    requirementType: "COMMENTS_COUNT",
    requirementValue: 1,
    xpReward: 100,
  },
  {
    slug: "comment-king",
    name: "Comment King",
    description: "Receive 100 total comment upvotes.",
    icon: "🔥",
    rarity: "RARE",
    category: "COMMENT",
    requirementType: "UPVOTES_RECEIVED",
    requirementValue: 100,
    xpReward: 250,
  },
  {
    slug: "savage-mouth",
    name: "Savage Mouth",
    description: "Receive 500 comment upvotes.",
    icon: "💀",
    rarity: "EPIC",
    category: "COMMENT",
    requirementType: "UPVOTES_RECEIVED",
    requirementValue: 500,
    xpReward: 600,
  },
  {
    slug: "roast-legend",
    name: "Roast Legend",
    description: "Receive 2,000 comment upvotes.",
    icon: "👑",
    rarity: "LEGENDARY",
    category: "COMMENT",
    requirementType: "UPVOTES_RECEIVED",
    requirementValue: 2000,
    xpReward: 2000,
  },

  // BATTLE BADGES
  {
    slug: "first-win",
    name: "First Win",
    description: "Correctly vote for a winning brand.",
    icon: "🏆",
    rarity: "COMMON",
    category: "BATTLE",
    requirementType: "BATTLES_WON",
    requirementValue: 1,
    xpReward: 150,
  },
  {
    slug: "battle-veteran",
    name: "Battle Veteran",
    description: "Participate in 50 battles.",
    icon: "🥊",
    rarity: "RARE",
    category: "BATTLE",
    requirementType: "BATTLES_JOINED",
    requirementValue: 50,
    xpReward: 300,
  },
  {
    slug: "winners-circle",
    name: "Winner's Circle",
    description: "Correctly predict 25 winning brands.",
    icon: "🏆",
    rarity: "EPIC",
    category: "BATTLE",
    requirementType: "BATTLES_WON",
    requirementValue: 25,
    xpReward: 750,
  },
  {
    slug: "battle-addict",
    name: "Battle Addict",
    description: "Participate in 100 battles.",
    icon: "🔥",
    rarity: "LEGENDARY",
    category: "BATTLE",
    requirementType: "BATTLES_JOINED",
    requirementValue: 100,
    xpReward: 1200,
  },

  // ENGAGEMENT BADGES
  {
    slug: "sharer",
    name: "Sharer",
    description: "Share your first battle with friends.",
    icon: "📤",
    rarity: "COMMON",
    category: "ENGAGEMENT",
    requirementType: "SHARES_COUNT",
    requirementValue: 1,
    xpReward: 100,
  },
  {
    slug: "hype-machine",
    name: "Hype Machine",
    description: "Share 25 battles.",
    icon: "📢",
    rarity: "RARE",
    category: "ENGAGEMENT",
    requirementType: "SHARES_COUNT",
    requirementValue: 25,
    xpReward: 300,
  },
  {
    slug: "viral-roaster",
    name: "Viral Roaster",
    description: "Have a comment reach 1,000+ upvotes.",
    icon: "🔥",
    rarity: "LEGENDARY",
    category: "ENGAGEMENT",
    requirementType: "UPVOTES_RECEIVED",
    requirementValue: 1000,
    xpReward: 1000,
  },

  // STREAK BADGES
  {
    slug: "streak-3",
    name: "3 Day Streak",
    description: "Use Roast Arena 3 days consecutively.",
    icon: "🔥",
    rarity: "COMMON",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 3,
    xpReward: 100,
  },
  {
    slug: "streak-7",
    name: "7 Day Streak",
    description: "Maintain a 7-day activity streak.",
    icon: "🔥",
    rarity: "RARE",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 7,
    xpReward: 250,
  },
  {
    slug: "streak-30",
    name: "30 Day Streak",
    description: "Maintain a 30-day activity streak.",
    icon: "🔥",
    rarity: "EPIC",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 30,
    xpReward: 750,
  },
  {
    slug: "streak-100",
    name: "100 Day Streak",
    description: "Maintain a 100-day activity streak.",
    icon: "👑",
    rarity: "LEGENDARY",
    category: "STREAK",
    requirementType: "STREAK_DAYS",
    requirementValue: 100,
    xpReward: 2500,
  },

  // LEVEL BADGES
  {
    slug: "level-5",
    name: "Level 5",
    description: "Reach level 5 (Savage rank).",
    icon: "⭐",
    rarity: "COMMON",
    category: "LEVEL",
    requirementType: "LEVEL_REACHED",
    requirementValue: 5,
    xpReward: 150,
  },
  {
    slug: "level-10",
    name: "Level 10",
    description: "Reach level 10 (Arena Legend rank).",
    icon: "🔥",
    rarity: "RARE",
    category: "LEVEL",
    requirementType: "LEVEL_REACHED",
    requirementValue: 10,
    xpReward: 300,
  },
  {
    slug: "level-20",
    name: "Level 20",
    description: "Reach level 20 (Roast Master rank).",
    icon: "👑",
    rarity: "EPIC",
    category: "LEVEL",
    requirementType: "LEVEL_REACHED",
    requirementValue: 20,
    xpReward: 750,
  },
  {
    slug: "level-50",
    name: "Level 50",
    description: "Reach level 50 (Arena Icon rank).",
    icon: "💎",
    rarity: "LEGENDARY",
    category: "LEVEL",
    requirementType: "LEVEL_REACHED",
    requirementValue: 50,
    xpReward: 3000,
  },
];

let badgesSeededCache = false;

/**
 * Ensures all system badges are seeded into PostgreSQL
 */
export async function ensureBadgesSeeded() {
  if (badgesSeededCache) return;

  const count = await prisma.badge.count();
  if (count >= BADGE_DEFINITIONS.length) {
    badgesSeededCache = true;
    return;
  }

  await prisma.badge.createMany({
    data: BADGE_DEFINITIONS.map((def) => ({
      slug: def.slug,
      name: def.name,
      description: def.description,
      icon: def.icon,
      rarity: def.rarity,
      category: def.category,
      requirementType: def.requirementType,
      requirementValue: def.requirementValue,
      xpReward: def.xpReward,
    })),
    skipDuplicates: true,
  });

  badgesSeededCache = true;
}

/**
 * Evaluates all badge requirements for a user and unlocks newly completed ones
 */
export async function evaluateBadges(userId: string): Promise<string[]> {
  await ensureBadgesSeeded();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: { select: { badgeId: true } },
    },
  });

  if (!user) return [];

  const existingBadgeIds = new Set(user.badges.map((b) => b.badgeId));

  // Compute user metrics from database
  const [
    votesCount,
    commentsCount,
    battlesJoined,
    upvotesAgg,
    winningVotesCount,
  ] = await Promise.all([
    prisma.vote.count({ where: { userId } }),
    prisma.comment.count({ where: { userId } }),
    prisma.battleParticipant.count({ where: { userId } }),
    prisma.comment.aggregate({
      where: { userId },
      _sum: { upvotesCount: true },
    }),
    prisma.vote.count({
      where: {
        userId,
        battle: {
          status: "ENDED",
          winnerBrandId: { not: null },
        },
      },
    }),
  ]);

  const upvotesReceived = upvotesAgg._sum.upvotesCount || 0;
  const streakDays = user.currentStreak || 1;
  const sharesCount = user.battlesShared || 0;

  // Calculate actual dynamic level from total user points
  const levelReached = calculateLevelInfo(user.points || 0).currentLevel;

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

  const allBadges = await prisma.badge.findMany();
  const newlyUnlockedBadges: string[] = [];

  for (const badge of allBadges) {
    if (existingBadgeIds.has(badge.id)) continue;

    const currentVal = metrics[badge.requirementType] || 0;
    if (currentVal >= badge.requirementValue) {
      try {
        await prisma.$transaction([
          prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
          }),
          prisma.xPTransaction.create({
            data: {
              userId,
              amount: badge.xpReward,
              type: "BADGE",
              sourceId: badge.id,
              description: `Unlocked badge: ${badge.name}`,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { points: { increment: badge.xpReward } },
          }),
          prisma.userActivity.create({
            data: {
              userId,
              type: "BADGE_UNLOCKED",
              title: `Badge Unlocked: ${badge.name}`,
              description: badge.description,
              xpEarned: badge.xpReward,
            },
          }),
          prisma.notification.create({
            data: {
              userId,
              title: `🏅 Badge Unlocked: ${badge.name}`,
              message: `You unlocked the ${badge.rarity} badge "${badge.name}" and earned +${badge.xpReward} XP!`,
              type: "BADGE",
              link: "/profile?tab=achievements",
            },
          }),
        ]);
        newlyUnlockedBadges.push(badge.name);
      } catch (err) {
        // Unique constraint protect or transaction error
        console.warn(`Badge unlock already claimed or error for ${badge.slug}:`, err);
      }
    }
  }

  return newlyUnlockedBadges;
}
