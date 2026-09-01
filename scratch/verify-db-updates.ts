import { prisma } from "../lib/prisma";

async function verifyAllDbUpdates() {
  console.log("=== 1. CHECKING LIVE BATTLE & JOIN COUNTS IN POSTGRESQL ===");
  const battle = await prisma.battle.findUnique({
    where: { slug: "nike-vs-adidas-clash" },
    include: {
      brandA: { select: { name: true, slug: true } },
      brandB: { select: { name: true, slug: true } },
      _count: {
        select: {
          participants: true,
          votes: true,
          comments: true,
        },
      },
    },
  });

  console.log("Battle:", {
    title: battle?.title,
    status: battle?.status,
    joinedCount: battle?.joinedCount,
    votesNike: battle?.votesCountA,
    votesAdidas: battle?.votesCountB,
    totalJoinedParticipantsInDb: battle?._count.participants,
    totalVotesInDb: battle?._count.votes,
    totalCommentsInDb: battle?._count.comments,
  });

  console.log("\n=== 2. CHECKING RECENT VOTES IN DATABASE ===");
  const votes = await prisma.vote.findMany({
    where: { battleId: battle?.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      chosenBrand: { select: { name: true } },
      user: { select: { username: true, points: true } },
    },
  });
  console.log("Recent Votes:", votes);

  console.log("\n=== 3. CHECKING COMMENTS WITH SELECTED USER AVATARS IN DATABASE ===");
  const comments = await prisma.comment.findMany({
    where: { battleId: battle?.id },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true,
      authorName: true,
      authorAvatar: true,
      content: true,
      upvotesCount: true,
      createdAt: true,
    },
  });
  console.log("Recent Comments (Showing User Selected Avatars):", comments);

  console.log("\n=== 4. CHECKING USER XP / POINTS REWARDS IN DATABASE ===");
  const user = await prisma.user.findFirst({
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      location: true,
      points: true,
      level: true,
    },
  });
  console.log("Sample User in PostgreSQL:", user);
}

verifyAllDbUpdates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
