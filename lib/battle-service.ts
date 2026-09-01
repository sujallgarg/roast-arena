import { prisma } from "@/lib/prisma";
import { BattleStatus } from "@prisma/client";

export const LIVE_BATTLE_SLUG = "nike-vs-adidas-clash";

/**
 * Ensures the featured Nike vs Adidas battle and initial comments exist in PostgreSQL
 */
export async function ensureLiveBattle() {
  let battle = await prisma.battle.findUnique({
    where: { slug: LIVE_BATTLE_SLUG },
    include: {
      brandA: true,
      brandB: true,
    },
  });

  if (!battle) {
    // 1. Ensure Brands exist
    let brandA = await prisma.brand.findUnique({ where: { slug: "nike" } });
    if (!brandA) {
      brandA = await prisma.brand.create({
        data: {
          name: "NIKE",
          slug: "nike",
          handle: "@nike",
          logoUrl: "/red-glove.jpg",
          verifiedBadge: true,
          brandColor: "#ef4444",
          description: "Just Do It. Athletic footwear, apparel, and competitive roast firepower.",
          website: "https://nike.com",
        },
      });
    }

    let brandB = await prisma.brand.findUnique({ where: { slug: "adidas" } });
    if (!brandB) {
      brandB = await prisma.brand.create({
        data: {
          name: "ADIDAS",
          slug: "adidas",
          handle: "@adidas",
          logoUrl: "/blue-glove.jpg",
          verifiedBadge: true,
          brandColor: "#3b82f6",
          description: "Impossible Is Nothing. Three stripes, iconic streetwear, and legendary heritage.",
          website: "https://adidas.com",
        },
      });
    }

    // 2. Create the Live Battle
    battle = await prisma.battle.create({
      data: {
        slug: LIVE_BATTLE_SLUG,
        title: "NIKE vs ADIDAS: Sneakerhead Supremacy",
        description: "The global sportswear duel. Who rules the streets and dominates the arena?",
        status: BattleStatus.LIVE,
        roundCount: 5,
        brandAId: brandA.id,
        brandBId: brandB.id,
        votesCountA: 11248,
        votesCountB: 7144,
        perkTitle: "25% OFF Arena Sneakerhead Drop",
        perkCode: "CLASH2026",
      },
      include: {
        brandA: true,
        brandB: true,
      },
    });

    // 3. Create initial roast posts
    await prisma.roastPost.createMany({
      data: [
        {
          battleId: battle.id,
          authorBrandId: brandA.id,
          roundNumber: 2,
          content: "Spends billions on ads, still can't make better stock prices. 🔥",
          likesCount: 18420,
        },
        {
          battleId: battle.id,
          authorBrandId: brandB.id,
          roundNumber: 2,
          content: "Cool stripes, but your sneakers can't outrun our legacy. 😎",
          likesCount: 14190,
        },
      ],
    });

    // 4. Seed initial audience comments in database
    await prisma.comment.createMany({
      data: [
        {
          battleId: battle.id,
          authorName: "SneakerHead",
          authorHandle: "@sneakerhead",
          authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          content: "Nike can't even compete! 🔥",
          upvotesCount: 12,
        },
        {
          battleId: battle.id,
          authorName: "AdiFan4Life",
          authorHandle: "@adifan",
          authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          content: "Those stripes hit different! 😎",
          upvotesCount: 8,
        },
        {
          battleId: battle.id,
          authorName: "RoastKing22",
          authorHandle: "@roastking22",
          authorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
          content: "Both brands spending, audience winning 😂",
          upvotesCount: 15,
        },
        {
          battleId: battle.id,
          authorName: "VoteMaster",
          authorHandle: "@votemaster",
          authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          content: "Adidas all the way! 💙",
          upvotesCount: 9,
        },
        {
          battleId: battle.id,
          authorName: "FireStarter",
          authorHandle: "@firestarter",
          authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          content: "Nike ads > Adidas ads any day 😜",
          upvotesCount: 6,
        },
        {
          battleId: battle.id,
          authorName: "QueenRoaster",
          authorHandle: "@queenroaster",
          authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
          content: "Legacy is earned, not branded 👑",
          upvotesCount: 11,
        },
        {
          battleId: battle.id,
          authorName: "EpicRoaster",
          authorHandle: "@epicroaster",
          authorAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
          content: "This battle is LIT! 🔥🔥🔥",
          upvotesCount: 21,
        },
      ],
    });
  }

  return battle;
}
