import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: "Unauthorized. Please log in to view your notifications.",
          notifications: [],
        },
        { status: 401 }
      );
    }

    let notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // If newly created user with no notifications yet, seed initial welcome notifications
    if (notifications.length === 0) {
      await prisma.notification.createMany({
        data: [
          {
            userId: user.id,
            title: "Welcome to Roast Arena! 🔥",
            message: "Your profile is active. You earned 500 Welcome XP!",
            type: "LEVEL_UP",
            read: false,
          },
          {
            userId: user.id,
            title: "Nike vs Adidas: Sneakerhead Clash is Live! ⚔️",
            message: "Round 1 is open for voting. Cast your vote to earn +50 XP.",
            type: "BATTLE",
            read: false,
          },
          {
            userId: user.id,
            title: "First Daily Quest Assigned! 🎯",
            message: "Vote in any live battle to complete your first quest.",
            type: "QUEST",
            read: false,
          },
        ],
      });

      notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json({ success: true, message: "Guest session" });
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    } else if (notificationId) {
      await prisma.notification.updateMany({
        where: { userId: user.id, id: notificationId },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
