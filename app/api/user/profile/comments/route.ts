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

    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          battle: {
            select: {
              id: true,
              slug: true,
              title: true,
              status: true,
              brandA: { select: { name: true } },
              brandB: { select: { name: true } },
            },
          },
        },
      }),
      prisma.comment.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      comments: comments.map((c) => ({
        id: c.id,
        battleTitle: c.battle?.title || "Live Battle",
        battleSlug: c.battle?.slug || "nike-vs-adidas-clash",
        brandA: c.battle?.brandA?.name,
        brandB: c.battle?.brandB?.name,
        content: c.content,
        upvotesCount: c.upvotesCount,
        createdAt: c.createdAt,
        isTrending: c.upvotesCount >= 10,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch user comments" },
      { status: 500 }
    );
  }
}
