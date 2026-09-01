import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureLiveBattle } from "@/lib/battle-service";
import { getAuthenticatedUser } from "@/lib/auth";
import { recordViewerPresence, getActiveViewersCount } from "@/lib/presence";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const battle = await ensureLiveBattle();
    const user = await getAuthenticatedUser();

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const rawIp = forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";
    const viewerKey = user?.id ? `user-${user.id}` : `ip-${crypto.createHash("sha256").update(rawIp).digest("hex").slice(0, 16)}`;

    // Record presence
    const watchingCount = recordViewerPresence(viewerKey);

    // Get real joined participants count
    const realJoinedCount = await prisma.battleParticipant.count({
      where: { battleId: battle.id },
    });

    return NextResponse.json({
      success: true,
      watchingCount,
      joinedCount: realJoinedCount,
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      watchingCount: getActiveViewersCount(),
      joinedCount: 0,
    });
  }
}
