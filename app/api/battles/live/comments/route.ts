import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureLiveBattle } from "@/lib/battle-service";
import { getAuthenticatedUser } from "@/lib/auth";
import { awardXP } from "@/lib/xp-service";
import { recordQuestProgress } from "@/lib/quest-service";

export async function GET() {
  try {
    const battle = await ensureLiveBattle();

    const comments = await prisma.comment.findMany({
      where: { battleId: battle.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: {
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const formatted = comments.map((c) => ({
      id: c.id,
      author: c.authorName,
      authorHandle: c.authorHandle,
      avatar: c.user?.avatarUrl || c.authorAvatar,
      text: c.content,
      likes: c.upvotesCount,
      time: "Just now",
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ success: true, comments: formatted });
  } catch (error) {
    console.error("Error fetching live comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments from database." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const battle = await ensureLiveBattle();
    const body = await request.json();
    const { text, authorName, authorAvatar } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Comment text cannot be empty." },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "You must be logged in to post a roast comment! Please log in or create an account.",
          requireAuth: true,
        },
        { status: 401 }
      );
    }

    // Prioritize user's database avatar / selected picture
    const finalAuthorName =
      user?.name || user?.username || authorName?.trim() || "Arena Roaster";
    const finalAuthorAvatar =
      user?.avatarUrl ||
      authorAvatar ||
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Roaster";
    const finalHandle = user?.username ? `@${user.username}` : "@roaster";

    const newComment = await prisma.comment.create({
      data: {
        battleId: battle.id,
        userId: user?.id || null,
        authorName: finalAuthorName,
        authorHandle: finalHandle,
        authorAvatar: finalAuthorAvatar,
        content: text.trim().slice(0, 200),
        upvotesCount: 0,
      },
    });

    // Optionally award XP and record quest progress via centralized gamification engine
    let xpResult = null;
    if (user?.id) {
      xpResult = await awardXP(user.id, "COMMENT", {
        sourceId: newComment.id,
        description: `Dropped a roast in live battle`,
      });
      await recordQuestProgress(user.id, "COMMENT");
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: newComment.id,
        author: newComment.authorName,
        authorHandle: newComment.authorHandle,
        avatar: newComment.authorAvatar,
        text: newComment.content,
        likes: newComment.upvotesCount,
        time: "Just now",
      },
      xpAwarded: xpResult?.amountAwarded || 0,
      leveledUp: xpResult?.leveledUp || false,
      newlyUnlockedBadges: xpResult?.newlyUnlockedBadges || [],
    });
  } catch (error) {
    console.error("Error creating comment in database:", error);
    return NextResponse.json(
      { error: "Failed to save comment to database." },
      { status: 500 }
    );
  }
}

// Like/Upvote a comment in the database
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "You must be logged in to upvote comments! Please log in or create an account.",
          requireAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { commentId, action = "upvote" } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId is required." },
        { status: 400 }
      );
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: {
        upvotesCount:
          action === "upvote" ? { increment: 1 } : { decrement: 1 },
      },
      select: {
        id: true,
        userId: true,
        upvotesCount: true,
      },
    });

    // If upvoted and comment has an author userId, award UPVOTE_RECEIVED XP
    if (action === "upvote" && updated.userId) {
      await awardXP(updated.userId, "UPVOTE_RECEIVED", {
        sourceId: updated.id,
        description: "Your roast comment received an upvote!",
      });
    }

    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    console.error("Error upvoting comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment upvotes in database." },
      { status: 500 }
    );
  }
}
