import { NextResponse } from "next/server";
import { getSynchronizedRound } from "@/lib/round-sync";

export async function GET() {
  const now = Date.now();
  const roundState = getSynchronizedRound(now);

  return NextResponse.json({
    success: true,
    serverTime: now,
    roundState,
  });
}
