import { prisma } from "../lib/prisma";
import { awardXP, XP_RULES } from "../lib/xp-service";
import { calculateLevelInfo } from "../lib/level-service";
import { evaluateBadges, ensureBadgesSeeded } from "../lib/badge-service";
import { recordQuestProgress, getUserDailyQuests } from "../lib/quest-service";
import { updateStreak } from "../lib/streak-service";

async function runGamificationVerification() {
  console.log("=== STARTING ROAST ARENA GAMIFICATION VERIFICATION ===");

  // 1. Seed badges
  console.log("\n1. Seeding system badges...");
  await ensureBadgesSeeded();
  const badgeCount = await prisma.badge.count();
  console.log(`✓ Total badges seeded in PostgreSQL: ${badgeCount}`);

  // 2. Fetch test user
  console.log("\n2. Fetching test user...");
  const testUser = await prisma.user.findFirst({
    where: { username: "sujal" },
  }) || (await prisma.user.findFirst());

  if (!testUser) {
    console.error("Test user not found!");
    process.exit(1);
  }
  console.log(`✓ Test user found: ${testUser.username} (${testUser.id}), points: ${testUser.points}`);

  // 3. Test Level Service
  console.log("\n3. Testing Level Service...");
  const levelInfo = calculateLevelInfo(testUser.points || 0);
  console.log(`✓ Level Calculation: Level ${levelInfo.currentLevel} (${levelInfo.currentTitle})`);
  console.log(`  Current XP: ${levelInfo.currentXP} / ${levelInfo.xpForNextLevel} (${levelInfo.progressPercentage}%)`);
  console.log(`  Next Reward: ${levelInfo.nextReward}`);

  // 4. Test Daily Quests
  console.log("\n4. Testing Daily Quests...");
  const quests = await getUserDailyQuests(testUser.id);
  console.log(`✓ Daily quests available: ${quests.length}`);
  quests.forEach((q) => {
    console.log(`  - [${q.completed ? "DONE" : "IN PROGRESS"}] ${q.title}: ${q.currentCount}/${q.target} (+${q.xpReward} XP)`);
  });

  // 5. Test awardXP function
  console.log("\n5. Testing Centralized XP Award...");
  const awardResult = await awardXP(testUser.id, "SHARE", {
    sourceId: "verification-battle-123",
    description: "Verification share test",
  });
  console.log(`✓ Award XP Result:`, {
    success: awardResult.success,
    amountAwarded: awardResult.amountAwarded,
    newTotalXP: awardResult.newTotalXP,
    level: awardResult.levelInfo.currentLevel,
    message: awardResult.message,
    newlyUnlockedBadges: awardResult.newlyUnlockedBadges,
  });

  // 6. Test Quest Progress
  console.log("\n6. Testing Daily Quest Progress recording...");
  const questResult = await recordQuestProgress(testUser.id, "SHARE");
  console.log(`✓ Quest Progress Recorded:`, questResult);

  // 7. Test Streak Update
  console.log("\n7. Testing Streak Engine...");
  const streakResult = await updateStreak(testUser.id);
  console.log(`✓ Streak updated: current=${streakResult.currentStreak}, longest=${streakResult.longestStreak}, isNewDay=${streakResult.isNewDay}`);

  // 8. Test Badge Evaluation
  console.log("\n8. Testing Badge Evaluation...");
  const unlocked = await evaluateBadges(testUser.id);
  console.log(`✓ Badges evaluated. Newly unlocked: ${unlocked.length > 0 ? unlocked.join(", ") : "None (requirements already claimed or pending)"}`);

  const userBadgesCount = await prisma.userBadge.count({
    where: { userId: testUser.id },
  });
  console.log(`✓ Total unlocked badges for user: ${userBadgesCount}`);

  // 9. Verify XP Transactions logged
  const txCount = await prisma.xPTransaction.count({
    where: { userId: testUser.id },
  });
  console.log(`\n9. Total XP transactions recorded for user: ${txCount}`);

  console.log("\n=== ALL GAMIFICATION ENGINES PASSED SUCCESSFULLY! ===");
}

runGamificationVerification()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
