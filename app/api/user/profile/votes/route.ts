import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const [votes, totalCount] = await Promise.all([
      prisma.vote.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          chosenBrand: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              brandColor: true,
            },
          },
          battle: {
            select: {
              id: true,
              slug: true,
              title: true,
              status: true,
              winnerBrandId: true,
              winnerBrand: { select: { name: true } },
              brandA: { select: { id: true, name: true } },
              brandB: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.vote.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      votes: votes.map((v) => {
        const isBattleEnded = v.battle.status === "ENDED";
        const isWinner =
          isBattleEnded &&
          v.battle.winnerBrandId &&
          v.battle.winnerBrandId === v.chosenBrandId;

        return {
          id: v.id,
          battleTitle: v.battle.title,
          battleSlug: v.battle.slug,
          chosenBrandName: v.chosenBrand.name,
          chosenBrandColor: v.chosenBrand.brandColor,
          brandAName: v.battle.brandA.name,
          brandBName: v.battle.brandB.name,
          status: v.battle.status,
          isWinner: isBattleEnded ? isWinner : null,
          xpEarned: 50 + (isWinner ? 50 : 0),
          createdAt: v.createdAt,
        };
      }),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch user votes" },
      { status: 500 }
    );
  }
}
