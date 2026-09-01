import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BattleStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status")?.toUpperCase();
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    let whereClause: {
      status?: BattleStatus;
      OR?: Array<
        | { title: { contains: string; mode: "insensitive" } }
        | { brandA: { name: { contains: string; mode: "insensitive" } } }
        | { brandB: { name: { contains: string; mode: "insensitive" } } }
      >;
    } = {};

    if (
      statusParam &&
      (statusParam === "LIVE" ||
        statusParam === "UPCOMING" ||
        statusParam === "ENDED")
    ) {
      whereClause.status = statusParam as BattleStatus;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brandA: { name: { contains: search, mode: "insensitive" } } },
        { brandB: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const battles = await prisma.battle.findMany({
      where: whereClause,
      include: {
        brandA: true,
        brandB: true,
        winnerBrand: true,
      },
      orderBy: [{ status: "asc" }, { joinedCount: "desc" }],
    });

    const formattedBattles = battles.map((b) => {
      const totalVotes = b.votesCountA + b.votesCountB;
      const percentA =
        totalVotes > 0 ? Math.round((b.votesCountA / totalVotes) * 100) : 50;
      const percentB = 100 - percentA;

      let statusBadge = "LIVE NOW";
      let timeRemaining = "23h left";
      if (b.status === "UPCOMING") {
        statusBadge = "UPCOMING";
        timeRemaining = "Starts Soon";
      } else if (b.status === "ENDED") {
        statusBadge = "COMPLETED";
        timeRemaining = "Ended";
      }

      return {
        id: b.id,
        slug: b.slug,
        title: b.title,
        description: b.description,
        status: b.status,
        statusBadge,
        timeRemaining,
        round: b.status === "ENDED" ? "Final Round" : `Round 2 of ${b.roundCount}`,
        brandA: {
          id: b.brandA.id,
          name: b.brandA.name,
          slug: b.brandA.slug,
          handle: b.brandA.handle,
          logoUrl: b.brandA.logoUrl,
          brandColor: b.brandA.brandColor,
        },
        brandB: {
          id: b.brandB.id,
          name: b.brandB.name,
          slug: b.brandB.slug,
          handle: b.brandB.handle,
          logoUrl: b.brandB.logoUrl,
          brandColor: b.brandB.brandColor,
        },
        winnerBrand: b.winnerBrand
          ? {
              id: b.winnerBrand.id,
              name: b.winnerBrand.name,
              handle: b.winnerBrand.handle,
            }
          : null,
        votesCountA: b.votesCountA,
        votesCountB: b.votesCountB,
        totalVotes,
        percentA,
        percentB,
        joinedCount: b.joinedCount,
        perkTitle: b.perkTitle,
        perkCode: b.perkCode,
      };
    });

    return NextResponse.json(
      { success: true, battles: formattedBattles },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching battles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch battles" },
      { status: 500 }
    );
  }
}
