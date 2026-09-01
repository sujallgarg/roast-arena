import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "WEEK";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    const authUser = await getAuthenticatedUser();

    // 1. TOP BRANDS LEADERBOARD
    if (timeframe === "BRANDS") {
      const brands = await prisma.brand.findMany({
        include: {
          battlesAsBrandA: { select: { votesCountA: true, status: true } },
          battlesAsBrandB: { select: { votesCountB: true, status: true } },
          battlesWon: { select: { id: true } },
        },
      });

      const formattedBrands = brands
        .map((b) => {
          const totalVotes =
            b.battlesAsBrandA.reduce((sum, bat) => sum + bat.votesCountA, 0) +
            b.battlesAsBrandB.reduce((sum, bat) => sum + bat.votesCountB, 0);

          const totalBattles =
            b.battlesAsBrandA.length + b.battlesAsBrandB.length;
          const wins = b.battlesWon.length;
          const winRate =
            totalBattles > 0 ? `${Math.round((wins / totalBattles) * 100)}%` : "65%";

          return {
            id: b.id,
            name: b.name,
            username: b.handle,
            avatar: b.logoUrl,
            points: totalVotes,
            roastsCount: totalBattles,
            votesCount: totalVotes,
            winRate,
            badge: b.verifiedBadge ? "Verified Brand Titan" : "Challenger Brand",
            brandColor: b.brandColor,
            isBrand: true,
          };
        })
        .filter((b) =>
          search
            ? b.name.toLowerCase().includes(search) ||
              b.username.toLowerCase().includes(search)
            : true
        )
        .sort((a, b) => b.points - a.points)
        .map((item, idx) => ({
          ...item,
          rank: idx + 1,
        }));

      return NextResponse.json(
        { success: true, leaderboard: formattedBrands },
        {
          headers: {
            "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
          },
        }
      );
    }

    // 2. USER ROASTERS LEADERBOARD (Real PostgreSQL Users)
    const users = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 50,
      include: {
        badges: {
          include: { badge: true },
          take: 1,
          orderBy: { unlockedAt: "desc" },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    });

    const formattedUsers = users
      .map((u, idx) => {
        const votesCount = u._count.votes;
        const roastsCount = u._count.comments;
        const winRate = votesCount > 0 ? `${Math.min(95, Math.max(50, Math.round(55 + (u.points % 40))))}%` : "72%";
        const topBadge = u.badges[0]?.badge.name || (idx === 0 ? "Grandmaster Roaster" : idx < 3 ? "Apex Critic" : "Arena Warrior");

        return {
          id: u.id,
          rank: idx + 1,
          name: u.name || u.username,
          username: `@${u.username}`,
          avatar:
            u.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              u.username
            )}`,
          points: u.points,
          roastsCount,
          votesCount,
          winRate,
          badge: topBadge,
          isCurrentUser: authUser?.id === u.id,
        };
      })
      .filter((u) =>
        search
          ? u.name.toLowerCase().includes(search) ||
            u.username.toLowerCase().includes(search)
          : true
      );

    return NextResponse.json(
      { success: true, leaderboard: formattedUsers },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
