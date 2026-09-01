import { prisma } from "@/lib/prisma";
import { checkLevelUp, calculateLevelInfo, LevelInfo } from "./level-service";
import { evaluateBadges } from "./badge-service";
import { updateStreak } from "./streak-service";

export type XPEventType =
  | "VOTE"
  | "COMMENT"
  | "UPVOTE_RECEIVED"
  | "SHARE"
  | "WIN_BONUS"
  | "QUEST"
  | "BADGE"
  | "STREAK"
  | "WEEKLY_LEADERBOARD";

export interface XPConfigRule {
  amount: number;
  dailyCap?: number; // Maximum times this XP event can be awarded in a UTC day
  description: string;
}

export const XP_RULES: Record<XPEventType, XPConfigRule> = {
  VOTE: {
    amount: 50,
    dailyCap: 5, // 5 votes/day eligible for XP = max 250 XP
    description: "Voted in a battle",
  },
  COMMENT: {
    amount: 20,
    dailyCap: 3, // 3 comments/day eligible for XP = max 60 XP
    description: "Posted a battle roast",
  },
  UPVOTE_RECEIVED: {
    amount: 25,
    dailyCap: 10,
    description: "Roast comment received upvotes",
  },
  SHARE: {
    amount: 20,
    dailyCap: 2, // 2 shares/day = max 40 XP
    description: "Shared battle with friends",
  },
  WIN_BONUS: {
    amount: 50,
    description: "Voted for the winning brand",
  },
  QUEST: {
    amount: 50,
    description: "Completed daily quest",
  },
  BADGE: {
    amount: 100,
    description: "Unlocked an achievement badge",
  },
  STREAK: {
    amount: 50,
    description: "Daily streak bonus",
  },
  WEEKLY_LEADERBOARD: {
    amount: 500,
    description: "Weekly leaderboard top placement",
  },
};

export interface AwardXPResult {
  success: boolean;
  amountAwarded: number;
  newTotalXP: number;
  levelInfo: LevelInfo;
  leveledUp: boolean;
  newLevel?: number;
  newTitle?: string;
  newlyUnlockedBadges: string[];
  message: string;
}

/**
 * Centralized, anti-abuse XP award function.
 * All XP changes in Roast Arena pass through this function.
 */
export async function awardXP(
  userId: string,
  type: XPEventType,
  options?: {
    customAmount?: number;
    sourceId?: string;
    description?: string;
  }
): Promise<AwardXPResult> {
  const rule = XP_RULES[type];
  const amountToAward = options?.customAmount ?? rule.amount;
  const description = options?.description ?? rule.description;

  // 1. Check daily cap to prevent farming
  if (rule.dailyCap) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const todayCount = await prisma.xPTransaction.count({
      where: {
        userId,
        type,
        createdAt: { gte: startOfDay },
      },
    });

    if (todayCount >= rule.dailyCap) {
      // User has reached daily cap for this action
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });
      const levelInfo = calculateLevelInfo(user?.points || 0);

      return {
        success: false,
        amountAwarded: 0,
        newTotalXP: user?.points || 0,
        levelInfo,
        leveledUp: false,
        newlyUnlockedBadges: [],
        message: `Daily XP limit reached for ${type.toLowerCase()}s (max ${rule.dailyCap}/day). Action recorded without XP.`,
      };
    }
  }

  // 2. Fetch current points and calculate level up
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true, level: true },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  const oldXP = currentUser.points || 0;
  const newXP = oldXP + amountToAward;

  const levelUpCheck = checkLevelUp(oldXP, newXP);
  const newLevelFormatted = `Level ${levelUpCheck.newLevel} • ${levelUpCheck.newTitle}`;

  // 3. Atomically record XPTransaction and update User
  await prisma.$transaction([
    prisma.xPTransaction.create({
      data: {
        userId,
        amount: amountToAward,
        type,
        sourceId: options?.sourceId || null,
        description,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: amountToAward },
        level: levelUpCheck.leveledUp ? newLevelFormatted : undefined,
      },
    }),
    prisma.userActivity.create({
      data: {
        userId,
        type: type === "VOTE" ? "VOTE" : type === "COMMENT" ? "COMMENT" : "SHARE",
        title: description,
        description: `Earned +${amountToAward} XP`,
        xpEarned: amountToAward,
      },
    }),
    ...(levelUpCheck.leveledUp
      ? [
          prisma.userActivity.create({
            data: {
              userId,
              type: "LEVEL_UP",
              title: `🔥 Reached Level ${levelUpCheck.newLevel}!`,
              description: `Unlocked new Arena rank: ${levelUpCheck.newTitle}`,
              xpEarned: levelUpCheck.rewardXP,
            },
          }),
          prisma.notification.create({
            data: {
              userId,
              title: `🔥 LEVEL UP: Level ${levelUpCheck.newLevel}!`,
              message: `Congratulations! You reached Level ${levelUpCheck.newLevel} (${levelUpCheck.newTitle}). +${levelUpCheck.rewardXP} XP bonus unlocked!`,
              type: "LEVEL_UP",
              link: "/profile",
            },
          }),
        ]
      : []),
  ]);

  // 4. Update Activity Streak
  await updateStreak(userId);

  // 5. Automatically evaluate badges
  const newlyUnlockedBadges = await evaluateBadges(userId);

  const finalLevelInfo = calculateLevelInfo(newXP);

  return {
    success: true,
    amountAwarded: amountToAward,
    newTotalXP: newXP,
    levelInfo: finalLevelInfo,
    leveledUp: levelUpCheck.leveledUp,
    newLevel: levelUpCheck.newLevel,
    newTitle: levelUpCheck.newTitle,
    newlyUnlockedBadges,
    message: `+${amountToAward} XP awarded!`,
  };
}
