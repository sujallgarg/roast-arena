import { prisma } from "@/lib/prisma";
import { getUtcDayKey } from "./streak-service";

export interface QuestDefinition {
  title: string;
  description: string;
  requirementType: "VOTE" | "COMMENT" | "SHARE";
  requirementTarget: number;
  xpReward: number;
}

export const DEFAULT_QUESTS: QuestDefinition[] = [
  {
    title: "Battle Voter",
    description: "Cast your vote in 3 live battles",
    requirementType: "VOTE",
    requirementTarget: 3,
    xpReward: 50,
  },
  {
    title: "Roast Master",
    description: "Drop 2 roasts in the live comments stream",
    requirementType: "COMMENT",
    requirementTarget: 2,
    xpReward: 50,
  },
  {
    title: "Hype Builder",
    description: "Share 1 battle duel with friends",
    requirementType: "SHARE",
    requirementTarget: 1,
    xpReward: 30,
  },
];

/**
 * Ensures system daily quests exist in the database
 */
export async function ensureQuestsSeeded() {
  for (const q of DEFAULT_QUESTS) {
    const existing = await prisma.dailyQuest.findFirst({
      where: { requirementType: q.requirementType },
    });
    if (!existing) {
      await prisma.dailyQuest.create({
        data: {
          title: q.title,
          description: q.description,
          requirementType: q.requirementType,
          requirementTarget: q.requirementTarget,
          xpReward: q.xpReward,
          active: true,
        },
      });
    }
  }
}

/**
 * Increments quest progress for a specific action type
 */
export async function recordQuestProgress(
  userId: string,
  requirementType: "VOTE" | "COMMENT" | "SHARE"
): Promise<{ completedQuest: string | null; xpReward: number }> {
  await ensureQuestsSeeded();

  const quest = await prisma.dailyQuest.findFirst({
    where: { requirementType, active: true },
  });

  if (!quest) return { completedQuest: null, xpReward: 0 };

  const dateKey = getUtcDayKey();

  const progress = await prisma.userQuestProgress.upsert({
    where: {
      userId_questId_dateKey: {
        userId,
        questId: quest.id,
        dateKey,
      },
    },
    create: {
      userId,
      questId: quest.id,
      dateKey,
      currentCount: 1,
      completed: 1 >= quest.requirementTarget,
      completedAt: 1 >= quest.requirementTarget ? new Date() : null,
    },
    update: {
      currentCount: { increment: 1 },
    },
  });

  // If newly reached target
  if (
    !progress.completed &&
    progress.currentCount >= quest.requirementTarget
  ) {
    await prisma.$transaction([
      prisma.userQuestProgress.update({
        where: { id: progress.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      }),
      prisma.xPTransaction.create({
        data: {
          userId,
          amount: quest.xpReward,
          type: "QUEST",
          sourceId: quest.id,
          description: `Completed Daily Quest: ${quest.title}`,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { points: { increment: quest.xpReward } },
      }),
      prisma.userActivity.create({
        data: {
          userId,
          type: "QUEST_COMPLETED",
          title: `Quest Completed: ${quest.title}`,
          description: `Completed daily quest and earned +${quest.xpReward} XP!`,
          xpEarned: quest.xpReward,
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          title: `🎯 Quest Completed: ${quest.title}`,
          message: `You completed "${quest.title}" and earned +${quest.xpReward} XP!`,
          type: "QUEST",
          link: "/profile",
        },
      }),
    ]);

    return { completedQuest: quest.title, xpReward: quest.xpReward };
  }

  return { completedQuest: null, xpReward: 0 };
}

/**
 * Returns today's daily quests with user completion progress
 */
export async function getUserDailyQuests(userId: string) {
  await ensureQuestsSeeded();
  const quests = await prisma.dailyQuest.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  const dateKey = getUtcDayKey();
  const progressList = await prisma.userQuestProgress.findMany({
    where: { userId, dateKey },
  });

  const progressMap = new Map(progressList.map((p) => [p.questId, p]));

  return quests.map((q) => {
    const prog = progressMap.get(q.id);
    const count = prog?.currentCount || 0;
    const target = q.requirementTarget;
    const completed = prog?.completed || count >= target;
    const progressPercent = Math.min(100, Math.round((count / target) * 100));

    return {
      id: q.id,
      title: q.title,
      description: q.description,
      target,
      currentCount: Math.min(count, target),
      completed,
      progressPercent,
      xpReward: q.xpReward,
    };
  });
}
