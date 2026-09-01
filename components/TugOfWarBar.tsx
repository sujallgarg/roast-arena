"use client";

import { motion } from "framer-motion";
import { Flame, Swords } from "lucide-react";

interface TugOfWarBarProps {
  votesCountA: number;
  votesCountB: number;
  brandAColor: string;
  brandBColor: string;
  brandAName: string;
  brandBName: string;
  height?: string;
  showLabels?: boolean;
}

export function TugOfWarBar({
  votesCountA,
  votesCountB,
  brandAColor,
  brandBColor,
  brandAName,
  brandBName,
  height = "h-4",
  showLabels = true,
}: TugOfWarBarProps) {
  const total = votesCountA + votesCountB;
  const percentA = total > 0 ? Math.round((votesCountA / total) * 100) : 50;
  const percentB = 100 - percentA;

  return (
    <div className="w-full space-y-2 select-none">
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: brandAColor }}
            />
            <span className="text-slate-900 font-extrabold">{brandAName}</span>
            <span style={{ color: brandAColor }} className="font-mono font-black text-sm ml-1">
              {percentA}%
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            <Swords className="w-3 h-3 text-slate-500" />
            <span>Tug of War</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span style={{ color: brandBColor }} className="font-mono font-black text-sm mr-1">
              {percentB}%
            </span>
            <span className="text-slate-900 font-extrabold">{brandBName}</span>
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: brandBColor }}
            />
          </div>
        </div>
      )}

      {/* Main Bar Track */}
      <div className="relative">
        <div
          className={`w-full ${height} bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 flex shadow-inner relative`}
        >
          {/* Brand A Side Bar */}
          <motion.div
            className="h-full rounded-l-full relative overflow-hidden"
            style={{ backgroundColor: brandAColor }}
            initial={{ width: "50%" }}
            animate={{ width: `${percentA}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            {/* Glossy light highlight overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>

          {/* Brand B Side Bar */}
          <motion.div
            className="h-full rounded-r-full relative overflow-hidden"
            style={{ backgroundColor: brandBColor }}
            initial={{ width: "50%" }}
            animate={{ width: `${percentB}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </div>

        {/* Center Collision Pin with Flame Glow */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none"
          style={{ left: `calc(${percentA}% - 14px)` }}
          animate={{ left: `calc(${percentA}% - 14px)` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-900 shadow-md flex items-center justify-center text-amber-500 scale-110">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
        </motion.div>
      </div>

      {/* Vote Counts Footer */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1 pt-0.5">
        <span>{votesCountA.toLocaleString()} votes</span>
        <span>Total: {total.toLocaleString()} votes</span>
        <span>{votesCountB.toLocaleString()} votes</span>
      </div>
    </div>
  );
}
