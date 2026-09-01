import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { COMMENTS_PAGE_SIZE } from "@/lib/constants";

// GET /api/battles/[id]/comments - Fetch audience heckles with pagination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: battleId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || `${COMMENTS_PAGE_SIZE}`, 10),
      50
    );

    const comments = await prisma.comment.findMany({
      where: { battleId },
      orderBy: { upvotesCount: "desc" },
      take: limit,
      select: {
        id: true,
        authorName: true,
        authorHandle: true,
        authorAvatar: true,
        content: true,
        upvotesCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error fetching comments" },
      { status: 500 }
    );
  }
}

// POST /api/battles/[id]/comments - Add a new audience heckle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "You must be logged in to post a comment! Please log in or create an account.",
          requireAuth: true,
        },
        { status: 401 }
      );
    }

    const { id: battleId } = await params;
    const body = await request.json();
    const { authorName, authorHandle, content } = body;

    if (!authorName || !content) {
      return NextResponse.json(
        { error: "authorName and content are required" },
        { status: 400 }
      );
    }

    // Generate random avatar seed from author name
    const seed = encodeURIComponent(authorName.trim());
    const authorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

    const newComment = await prisma.comment.create({
      data: {
        battleId,
        authorName: authorName.trim(),
        authorHandle: authorHandle ? `@${authorHandle.replace(/^@/, "")}` : `@${seed.toLowerCase()}`,
        authorAvatar,
        content: content.trim(),
        upvotesCount: 1,
      },
    });

    return NextResponse.json({ success: true, comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("Error posting comment:", error);
    return NextResponse.json(
      { error: "Internal server error posting comment" },
      { status: 500 }
    );
  }
}

// PATCH /api/battles/[id]/comments - Upvote a comment
export async function PATCH(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const { commentId, action = "upvote" } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId is required" },
        { status: 400 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        upvotesCount: {
          increment: action === "upvote" ? 1 : -1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      commentId: updatedComment.id,
      upvotesCount: updatedComment.upvotesCount,
    });
  } catch (error) {
    console.error("Error upvoting comment:", error);
    return NextResponse.json(
      { error: "Internal server error upvoting comment" },
      { status: 500 }
    );
  }
}
