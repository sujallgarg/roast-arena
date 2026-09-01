"use client";

import { ShieldCheck } from "lucide-react";

interface BrandBadgeProps {
  name: string;
  handle: string;
  logoUrl: string;
  verifiedBadge?: boolean;
  brandColor: string;
  votesCount: number;
  percentage: number;
  align?: "left" | "right";
  isWinning?: boolean;
}

export function BrandBadge({
  name,
  handle,
  logoUrl,
  verifiedBadge = true,
  brandColor,
  votesCount,
  percentage,
  align = "left",
  isWinning = false,
}: BrandBadgeProps) {
  const isRight = align === "right";

  return (
    <div
      className={`flex items-center gap-3.5 ${
        isRight ? "flex-row-reverse text-right" : "flex-row text-left"
      }`}
    >
      {/* Avatar Container with glowing border */}
      <div className="relative group shrink-0">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 bg-white border border-slate-200 shadow-sm transition-transform duration-300 group-hover:scale-105"
          style={{
            boxShadow: isWinning ? `0 0 20px ${brandColor}33` : undefined,
          }}
        >
          <div className="w-full h-full rounded-xl overflow-hidden relative bg-slate-100 flex items-center justify-center font-bold text-slate-700">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            <span className="absolute text-lg font-black">{name.slice(0, 2).toUpperCase()}</span>
          </div>
        </div>

        {/* Winner Badge Pill */}
        {isWinning && (
          <span
            className="absolute -top-1.5 -right-1.5 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white shadow-xs animate-bounce"
            style={{ backgroundColor: brandColor }}
          >
            Leading
          </span>
        )}
      </div>

      {/* Brand Info */}
      <div className="space-y-0.5 min-w-0">
        <div
          className={`flex items-center gap-1.5 ${
            isRight ? "justify-end" : "justify-start"
          }`}
        >
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 truncate tracking-tight">
            {name}
          </h3>
          {verifiedBadge && (
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
          )}
        </div>

        <div className="text-xs font-mono text-slate-500 font-medium">
          {handle}
        </div>

        <div
          className={`flex items-center gap-2 pt-1 text-xs font-bold ${
            isRight ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className="text-sm font-black tracking-tight"
            style={{ color: brandColor }}
          >
            {percentage}%
          </span>
          <span className="text-slate-400 font-normal text-[11px]">
            ({votesCount.toLocaleString()} votes)
          </span>
        </div>
      </div>
    </div>
  );
}
