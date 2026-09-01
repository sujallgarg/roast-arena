"use client";

import { useState } from "react";
import { Trophy, ShieldCheck, Search, Flame } from "lucide-react";
import { motion } from "framer-motion";

export interface LeaderboardBrand {
  id: string;
  name: string;
  slug: string;
  handle: string;
  logoUrl: string;
  verifiedBadge: boolean;
  brandColor: string;
  battlesCount: number;
  totalVotes: number;
  winCount: number;
  savageScore: number;
}

interface LeaderboardTableProps {
  brands: LeaderboardBrand[];
}

export function LeaderboardTable({ brands = [] }: LeaderboardTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"SAVAGE" | "VOTES" | "WINS">("SAVAGE");

  // Filter and sort brands
  const filteredBrands = brands
    .filter(
      (b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.handle.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "SAVAGE") return b.savageScore - a.savageScore;
      if (sortBy === "VOTES") return b.totalVotes - a.totalVotes;
      return b.winCount - a.winCount;
    });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
          👑 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-xl bg-slate-200 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 font-black text-xs flex items-center justify-center shadow-xs">
          🥉 3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-mono font-bold text-xs flex items-center justify-center border border-slate-200">
        #{rank}
      </span>
    );
  };

  return (
    <div className="glass-card rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 bg-white shadow-sm">
      {/* Header & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Savage 50 Leaderboard
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                Official Standings
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Ranked by crowd votes, comeback velocity, and roast wins.
            </p>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search brand or handle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSortBy("SAVAGE")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                sortBy === "SAVAGE"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🔥 Savage Score
            </button>
            <button
              onClick={() => setSortBy("VOTES")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                sortBy === "VOTES"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📊 Total Votes
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-50">
              <th className="py-3 px-4 rounded-l-xl">Rank</th>
              <th className="py-3 px-4">Brand</th>
              <th className="py-3 px-4">Handle</th>
              <th className="py-3 px-4 text-center">Battles</th>
              <th className="py-3 px-4 text-center">Total Votes</th>
              <th className="py-3 px-4 text-right rounded-r-xl">Savage Index</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-700">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand, index) => {
                const rank = index + 1;
                return (
                  <motion.tr
                    key={brand.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4">{getRankBadge(rank)}</td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl p-0.5 bg-white border border-slate-200 shadow-xs shrink-0 overflow-hidden relative"
                        >
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                            {brand.name}
                          </span>
                          {brand.verifiedBadge && (
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">
                      {brand.handle}
                    </td>

                    <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">
                      {brand.battlesCount}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {brand.totalVotes.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold font-mono text-xs">
                        <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                        <span>{brand.savageScore.toLocaleString()}</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  No brands matching search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
