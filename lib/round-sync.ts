/**
 * Roast Arena Live Round Synchronization & Global Auto-Timer Engine
 * 
 * Determines round and countdown deterministically using global UTC epoch time.
 * Every user on any device at any location receives the EXACT SAME round number
 * and the EXACT SAME remaining seconds.
 */

export const TOTAL_ROUNDS = 5;
export const ROUND_DURATION_HOURS = 4; // Each round runs for exactly 4 hours
export const ROUND_DURATION_MS = ROUND_DURATION_HOURS * 60 * 60 * 1000; // 14,400,000 ms

export interface RoundState {
  currentRound: number;
  totalRounds: number;
  remainingSeconds: number;
  formattedTimer: string; // "HH:MM:SS"
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  nextRoundText: string;
  nextRoundNumber: number;
  roundEndTime: number;
  serverTimeMs: number;
}

// Client-side clock offset from server (calibrated on initial load)
let clientClockOffsetMs = 0;

export function setClientClockOffset(serverTime: number) {
  clientClockOffsetMs = serverTime - Date.now();
}

/**
 * Deterministic Global Round and Timer Calculation
 * The timer and round are calculated from universal UTC epoch time.
 * Every person on any device at any location sees the EXACT SAME timer and round!
 */
export function getSynchronizedRound(customNowMs?: number): RoundState {
  const now = customNowMs ?? (Date.now() + clientClockOffsetMs);

  // Deterministic global cycle index from Unix epoch
  const cycleIndex = Math.floor(now / ROUND_DURATION_MS);
  const currentRound = (cycleIndex % TOTAL_ROUNDS) + 1; // Always 1 to 5
  const roundEndTime = (cycleIndex + 1) * ROUND_DURATION_MS;
  const remainingMs = Math.max(0, roundEndTime - now);

  const totalSec = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const formattedTimer = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const nextRoundNumber = currentRound < TOTAL_ROUNDS ? currentRound + 1 : 1;

  let nextRoundText = "";
  if (hours > 0) {
    nextRoundText = `Next round begins in ${hours} hour${hours > 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    nextRoundText = `Next round begins in ${minutes} minute${
      minutes > 1 ? "s" : ""
    }`;
  } else {
    nextRoundText = `Next round begins in ${seconds}s`;
  }

  return {
    currentRound,
    totalRounds: TOTAL_ROUNDS,
    remainingSeconds: totalSec,
    formattedTimer,
    hoursLeft: hours,
    minutesLeft: minutes,
    secondsLeft: seconds,
    nextRoundText,
    nextRoundNumber,
    roundEndTime,
    serverTimeMs: now,
  };
}

/**
 * Helper to get initial round state
 */
export function advanceToNextRound(): RoundState {
  return getSynchronizedRound();
}
