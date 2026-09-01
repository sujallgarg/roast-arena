"use client";

import { useState, useEffect } from "react";
import { Clock, Hourglass } from "lucide-react";
import { RoundState } from "@/lib/round-sync";

interface RoundTimerShowcaseProps {
  roundState: RoundState;
  className?: string;
}

export function RoundTimerShowcase({
  roundState,
  className = "",
}: RoundTimerShowcaseProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentRound = roundState?.currentRound ?? 1;
  const hours = roundState?.hoursLeft ?? 0;
  const minutes = roundState?.minutesLeft ?? 0;
  const seconds = roundState?.secondsLeft ?? 0;

  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secondsStr = String(seconds).padStart(2, "0");

  const hourCount = hours > 0 ? hours : 1;
  const nextRoundHourText = `${hourCount} ${hourCount === 1 ? "HOUR" : "HOURS"}`;

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col items-center justify-center space-y-2.5 sm:space-y-3 py-1 ${className}`}
    >
      {/* 1. Header with Lightning Bolt Accents */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 select-none">
        {/* Left Lightning Spark */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 fill-red-600 -rotate-12 drop-shadow-xs"
            viewBox="0 0 24 24"
          >
            <path d="M13 2L3 14h7v8l10-12h-7l3-8z" />
          </svg>
          <span className="absolute -top-0.5 -left-1 w-1 h-0.5 bg-red-500 rounded-full -rotate-45" />
          <span className="absolute -bottom-0.5 -left-1 w-1 h-0.5 bg-red-500 rounded-full rotate-45" />
        </div>

        {/* Heading Text */}
        <h2 className="text-xl sm:text-2xl font-black italic tracking-tight uppercase">
          <span suppressHydrationWarning className="text-red-600">
            ROUND {currentRound}
          </span>{" "}
          <span className="text-slate-950">ENDS IN</span>
        </h2>

        {/* Right Lightning Spark */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 fill-red-600 rotate-12 drop-shadow-xs"
            viewBox="0 0 24 24"
          >
            <path d="M13 2L3 14h7v8l10-12h-7l3-8z" />
          </svg>
          <span className="absolute -top-0.5 -right-1 w-1 h-0.5 bg-red-500 rounded-full rotate-45" />
          <span className="absolute -bottom-0.5 -right-1 w-1 h-0.5 bg-red-500 rounded-full -rotate-45" />
        </div>
      </div>

      {/* 2. Main Segmented Digits Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-2xs flex items-center justify-center gap-1.5 sm:gap-3 select-none">
        {/* Circular Clock Outline Icon */}
        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-red-50/90 border border-red-200/80 flex items-center justify-center shrink-0 mr-0.5 sm:mr-1 shadow-2xs">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 stroke-[2]" />
        </div>

        {/* Hours Tile */}
        <div className="flex flex-col items-center">
          <div className="w-13 sm:w-18 py-1.5 sm:py-2.5 bg-slate-50/90 border border-slate-200/80 rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xs">
            <span
              suppressHydrationWarning
              className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight"
            >
              {mounted ? hoursStr : "--"}
            </span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-black text-slate-500 tracking-wider mt-1 uppercase">
            HOURS
          </span>
        </div>

        {/* Colon Separator */}
        <div className="flex flex-col items-center pb-3.5 sm:pb-4 gap-1 sm:gap-1.5">
          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-900" />
          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-900" />
        </div>

        {/* Minutes Tile */}
        <div className="flex flex-col items-center">
          <div className="w-13 sm:w-18 py-1.5 sm:py-2.5 bg-slate-50/90 border border-slate-200/80 rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xs">
            <span
              suppressHydrationWarning
              className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight"
            >
              {mounted ? minutesStr : "--"}
            </span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-black text-slate-500 tracking-wider mt-1 uppercase">
            MINUTES
          </span>
        </div>

        {/* Colon Separator */}
        <div className="flex flex-col items-center pb-3.5 sm:pb-4 gap-1 sm:gap-1.5">
          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-900" />
          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-900" />
        </div>

        {/* Seconds Tile */}
        <div className="flex flex-col items-center">
          <div className="w-13 sm:w-18 py-1.5 sm:py-2.5 bg-slate-50/90 border border-slate-200/80 rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xs">
            <span
              suppressHydrationWarning
              className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight"
            >
              {mounted ? secondsStr : "--"}
            </span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-black text-slate-500 tracking-wider mt-1 uppercase">
            SECONDS
          </span>
        </div>
      </div>

      {/* 3. Bottom Next Round Pill Capsule */}
      <div className="rounded-full border border-red-200/90 bg-red-50/30 hover:bg-red-50/50 transition-colors px-3.5 sm:px-5 py-1.5 inline-flex items-center gap-2 sm:gap-2.5 shadow-2xs select-none">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100/80 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
          <Hourglass className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600 stroke-[2.5]" />
        </div>

        <div className="h-3.5 w-[1px] bg-red-200/80" />

        <div className="text-[11px] sm:text-xs font-black tracking-wider uppercase">
          <span className="text-slate-900">NEXT ROUND BEGINS IN </span>
          <span suppressHydrationWarning className="text-red-600">
            {nextRoundHourText}
          </span>
        </div>
      </div>
    </div>
  );
}
