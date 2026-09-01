"use client";

import { useState } from "react";
import { RoastBubble, RoastPostItem } from "./RoastBubble";
import { MatchShareCard } from "./MatchShareCard";
import { Heart, Share2, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

export interface BattleData {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  status: string;
  roundCount: number;
  votesCountA: number;
  votesCountB: number;
  perkTitle?: string | null;
  perkCode?: string | null;
  perkLink?: string | null;
  brandA: {
    id: string;
    name: string;
    slug: string;
    handle: string;
    logoUrl: string;
    verifiedBadge: boolean;
    brandColor: string;
  };
  brandB: {
    id: string;
    name: string;
    slug: string;
    handle: string;
    logoUrl: string;
    verifiedBadge: boolean;
    brandColor: string;
  };
  roastPosts: RoastPostItem[];
}

interface DuelArenaProps {
  battle: BattleData;
}

import { useBattleLive } from "./BattleLiveProvider";

export function DuelArena({ battle }: DuelArenaProps) {
  const [activeRound, setActiveRound] = useState<number | "ALL">("ALL");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Consume shared live context (or fallback to props)
  const liveContext = useBattleLive();
  const votesA = liveContext ? liveContext.votesCountA : battle.votesCountA;
  const votesB = liveContext ? liveContext.votesCountB : battle.votesCountB;
  const totalVotes = liveContext ? liveContext.totalVotes : votesA + votesB;
  const percentA = liveContext ? liveContext.percentA : (totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 50);
  const percentB = 100 - percentA;
  const votedBrand = liveContext?.userVote?.chosenBrandId || null;

  // Latest roasts by each brand
  const latestRoastA =
    battle.roastPosts.filter((p) => p.authorBrandId === battle.brandA.id).pop()?.content ||
    "At least we don't need a verse to sell shoes. 🔥";

  const latestRoastB =
    battle.roastPosts.filter((p) => p.authorBrandId === battle.brandB.id).pop()?.content ||
    "At least our stripes aren't budget copies. 🔥";

  const handleVote = async (brandId: string) => {
    if (liveContext) {
      await liveContext.castVote(brandId, "SAVAGE");
    } else {
      try {
        const res = await fetch(`/api/battles/${battle.id}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chosenBrandId: brandId, reactionType: "SAVAGE" }),
        });
        await res.json();
      } catch (e) {
        console.error("Voting error:", e);
      }
    }
  };

  const filteredRoasts =
    activeRound === "ALL"
      ? battle.roastPosts
      : battle.roastPosts.filter((p) => p.roundNumber === activeRound);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Main 1v1 Battle Arena Stage */}
      <div className="relative rounded-3xl bg-white/95 border border-slate-200 p-6 sm:p-10 shadow-xl overflow-hidden arena-hero-glow">
        {/* Top Battle Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE ARENA
            </span>
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">
              • {battle.title}
            </span>
          </div>

          <button
            onClick={() => setIsShareOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Export Card</span>
          </button>
        </div>

        {/* 1v1 Arena Clash Display matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-8">
          {/* Left Brand Card (Brand A / Red Theme) */}
          <div className="md:col-span-5 bg-slate-50 rounded-3xl p-6 border glow-card-red flex flex-col items-center text-center space-y-4 relative group transition-all">
            <div className="w-20 h-20 rounded-full bg-white p-2 shadow-md flex items-center justify-center border-2 border-red-500/40">
              <img
                src={battle.brandA.logoUrl}
                alt={battle.brandA.name}
                className="w-14 h-14 object-contain rounded-full"
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {battle.brandA.name}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {battle.brandA.slug === "nike" || battle.brandA.slug === "swiggy"
                  ? "The Comeback Kings"
                  : battle.brandA.handle}
              </p>
            </div>

            {/* Quote Box - LAST ROAST */}
            <div className="w-full bg-white border border-red-200 rounded-2xl p-4 text-left space-y-1.5 shadow-xs">
              <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-widest block">
                LAST ROAST
              </span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                {`"${latestRoastA}"`}
              </p>
            </div>
          </div>

          {/* Center Clash Area (Round 3 + VS + Countdown) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center space-y-3 py-2">
            <span className="px-3 py-1 rounded-full bg-red-100 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest">
              ROUND 3
            </span>

            {/* Flaming VS Graphic Text */}
            <div className="text-4xl sm:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-red-600 drop-shadow-xs py-1">
              VS
            </div>

            {/* Countdown Timer */}
            <div className="space-y-1">
              <div className="text-lg font-mono font-black text-red-600 tracking-wider">
                23:45:12
              </div>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">
                TIME LEFT TO VOTE
              </span>
            </div>
          </div>

          {/* Right Brand Card (Brand B / Blue Theme) */}
          <div className="md:col-span-5 bg-slate-50 rounded-3xl p-6 border glow-card-blue flex flex-col items-center text-center space-y-4 relative group transition-all">
            <div className="w-20 h-20 rounded-full bg-white p-2 shadow-md flex items-center justify-center border-2 border-blue-500/40">
              <img
                src={battle.brandB.logoUrl}
                alt={battle.brandB.name}
                className="w-14 h-14 object-contain rounded-full"
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {battle.brandB.name}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {battle.brandB.slug === "adidas" || battle.brandB.slug === "zomato"
                  ? "Built Different"
                  : battle.brandB.handle}
              </p>
            </div>

            {/* Quote Box - LAST ROAST */}
            <div className="w-full bg-white border border-blue-200 rounded-2xl p-4 text-left space-y-1.5 shadow-xs">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">
                LAST ROAST
              </span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                {`"${latestRoastB}"`}
              </p>
            </div>
          </div>
        </div>

        {/* Voting Action Section (Floating Bar in Screenshot) */}
        <div className="pt-4 max-w-xl mx-auto space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-md text-center space-y-3">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">
              VOTE FOR THE SAVAGEST COMEBACK
            </span>

            {/* Split Red/Blue Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVote(battle.brandA.id)}
                className={`py-3.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  votedBrand === battle.brandA.id
                    ? "bg-red-600 text-white ring-2 ring-red-400"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                <span>{battle.brandA.name}</span>
                <Heart className="w-4 h-4 fill-white" />
              </button>

              <button
                onClick={() => handleVote(battle.brandB.id)}
                className={`py-3.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  votedBrand === battle.brandB.id
                    ? "bg-blue-600 text-white ring-2 ring-blue-400"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                <span>{battle.brandB.name}</span>
                <Heart className="w-4 h-4 fill-white" />
              </button>
            </div>

            {/* Tug of War Vote Ratio Bar */}
            <div className="pt-1 space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span className="text-red-600">{percentA}% ({votesA.toLocaleString()} votes)</span>
                <span className="text-blue-600">{percentB}% ({votesB.toLocaleString()} votes)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex border border-slate-300">
                <div className="h-full bg-red-500 transition-all" style={{ width: `${percentA}%` }} />
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${percentB}%` }} />
              </div>
            </div>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1 mx-auto pt-1 cursor-pointer"
            >
              <span>View Roast History</span>
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Roast Feed Section */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pt-6 space-y-4 border-t border-slate-200 mt-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Complete Roast Timeline</span>
              </h3>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setActiveRound("ALL")}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                    activeRound === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  All ({battle.roastPosts.length})
                </button>
                {[1, 2, 3].slice(0, battle.roundCount).map((r) => (
                  <button
                    key={r}
                    onClick={() => setActiveRound(r)}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                      activeRound === r ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Round {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredRoasts.map((post) => {
                const isBrandA = post.authorBrandId === battle.brandA.id;
                return (
                  <RoastBubble
                    key={post.id}
                    post={post}
                    isBrandA={isBrandA}
                    brandAColor={battle.brandA.brandColor}
                    brandBColor={battle.brandB.brandColor}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Export Match Share Card Modal */}
      <MatchShareCard
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        battle={{
          title: battle.title,
          brandA: battle.brandA,
          brandB: battle.brandB,
          votesCountA: votesA,
          votesCountB: votesB,
          topRoast: battle.roastPosts[0]?.content,
        }}
      />
    </div>
  );
}
