"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Gift } from "lucide-react";

interface PerkDropBannerProps {
  perkTitle?: string | null;
  perkCode?: string | null;
  perkLink?: string | null;
  winningBrandName?: string;
}

export function PerkDropBanner({
  perkTitle = "50% OFF Midnight Meal Voucher for Voters!",
  perkCode = "ROAST50OFF",
  perkLink = "https://swiggy.com",
  winningBrandName = "Swiggy",
}: PerkDropBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!perkCode) return;
    navigator.clipboard.writeText(perkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!perkTitle) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
      {/* Background Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

      {/* Perk Info */}
      <div className="flex items-center gap-3.5 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0">
          <Gift className="w-6 h-6 text-amber-100 fill-amber-100" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-amber-100 border border-white/20">
              Voter Winner Perk Drop
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug pt-0.5">
            {perkTitle}
          </h4>
          <p className="text-xs text-amber-100 font-medium">
            Unlocked for voters on {winningBrandName}&apos;s winning side.
          </p>
        </div>
      </div>

      {/* Copy Code & Redeem Action */}
      <div className="flex flex-wrap items-center gap-2.5 relative z-10 w-full sm:w-auto justify-end">
        {perkCode && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white text-slate-900 font-mono font-bold text-xs hover:bg-slate-100 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>{perkCode}</span>
              </>
            )}
          </button>
        )}

        {perkLink && (
          <a
            href={perkLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <span>Claim Voucher</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </a>
        )}
      </div>
    </div>
  );
}
