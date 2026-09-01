import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: perkId } = await context.params;
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to claim this perk! Please log in or create an account.", requireAuth: true },
        { status: 401 }
      );
    }

    // Check if perk exists
    const perk = await prisma.perk.findUnique({
      where: { id: perkId },
    });

    if (!perk) {
      return NextResponse.json({ error: "Perk not found" }, { status: 404 });
    }

    // Record claim
    await prisma.perkClaim.create({
      data: {
        perkId,
        userId: user ? user.id : null,
      },
    });

    // Increment claimed count on perk
    const updatedPerk = await prisma.perk.update({
      where: { id: perkId },
      data: {
        claimedCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      claimedCount: updatedPerk.claimedCount,
      code: updatedPerk.code,
    });
  } catch (error) {
    console.error("Error claiming perk in database:", error);
    return NextResponse.json({ error: "Failed to claim perk" }, { status: 500 });
  }
}
