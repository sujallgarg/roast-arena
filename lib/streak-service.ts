import { prisma } from "@/lib/prisma";

export function getUtcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Updates a user's activity streak upon meaningful interaction
 */
export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  isNewDay: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
    },
  });

  if (!user) {
    return { currentStreak: 1, longestStreak: 1, isNewDay: false };
  }

  const now = new Date();
  const todayKey = getUtcDayKey(now);

  if (!user.lastActiveDate) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: 1,
        longestStreak: Math.max(1, user.longestStreak || 1),
        lastActiveDate: now,
      },
    });
    return { currentStreak: 1, longestStreak: 1, isNewDay: true };
  }

  const lastKey = getUtcDayKey(user.lastActiveDate);

  if (todayKey === lastKey) {
    // Same day activity: keep current streak
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      isNewDay: false,
    };
  }

  // Calculate day difference
  const todayTime = new Date(`${todayKey}T00:00:00Z`).getTime();
  const lastTime = new Date(`${lastKey}T00:00:00Z`).getTime();
  const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

  let newCurrent = 1;
  if (diffDays === 1) {
    // Consecutive day
    newCurrent = (user.currentStreak || 0) + 1;
  } else {
    // Gap of more than 1 day: resets to 1
    newCurrent = 1;
  }

  const newLongest = Math.max(user.longestStreak || 1, newCurrent);

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastActiveDate: now,
    },
  });

  return {
    currentStreak: newCurrent,
    longestStreak: newLongest,
    isNewDay: true,
  };
}
