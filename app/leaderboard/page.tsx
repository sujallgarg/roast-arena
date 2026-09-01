"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Crown,
  Search,
  Building2,
  Users,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { ArenaNavbar } from "@/components/ArenaNavbar";
import { ArenaSidebar } from "@/components/ArenaSidebar";

interface LeaderboardItem {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar: string;
  points: number;
  roastsCount: number;
  votesCount: number;
  winRate: string;
  badge: string;
  isCurrentUser?: boolean;
  isBrand?: boolean;
  brandColor?: string;
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"WEEK" | "ALL_TIME" | "BRANDS">("WEEK");
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce search input for high speed responsiveness
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchFilter);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchFilter]);

  // Fetch real PostgreSQL leaderboard data
  useEffect(() => {
    let cancelled = false;
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          timeframe,
          search: debouncedSearch,
        });
        const res = await fetch(`/api/leaderboard?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.success) {
            setItems(data.leaderboard || []);
          }
        }
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [timeframe, debouncedSearch]);

  const top3 = items.slice(0, 3);
  const others = items.slice(3);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Universal Fixed Navbar */}
      <ArenaNavbar activeTab="Leaderboard" />

      {/* Main Container With Sidebar */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side Navbar */}
          <div className="lg:col-span-2 hidden lg:block">
            <ArenaSidebar activeItem="Leaderboard" />
          </div>

          {/* Main Leaderboard Stream */}
          <main className="lg:col-span-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600">
                  <Trophy className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>HALL OF SAVAGE FAME</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                  {timeframe === "BRANDS"
                    ? "Top Global Brand Titans"
                    : "Top RoastMasters & Duel Champions"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {timeframe === "BRANDS"
                    ? "Real-time ranking of brands based on total fan votes and battle victories."
                    : "Vote, roast rival brands, and earn your place on the global podium."}
                </p>
              </div>

              {/* Timeframe Tabs */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTimeframe("WEEK")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    timeframe === "WEEK"
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>This Week</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe("ALL_TIME")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    timeframe === "ALL_TIME"
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>All-Time</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe("BRANDS")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    timeframe === "BRANDS"
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Top Brands</span>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && items.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">
                  Loading live database rankings...
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
                <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-extrabold text-slate-700">
                  No rankings found matching &quot;{searchFilter}&quot;
                </p>
                <p className="text-xs text-slate-400">
                  Try clearing your search query to see all participants.
                </p>
              </div>
            ) : (
              <>
                {/* 1. TOP 3 PODIUM */}
                {top3.length >= 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-6">
                    {/* #2 Runner Up */}
                    <div className="order-2 md:order-1 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center space-y-3 relative group hover:shadow-md transition-all">
                      <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider border border-slate-300">
                        🥈 #2 Silver
                      </div>
                      <div className="w-20 h-20 rounded-full border-4 border-slate-200 overflow-hidden shadow-md group-hover:scale-105 transition-transform mt-2 bg-slate-100 flex items-center justify-center">
                        <img
                          src={top3[1].avatar}
                          alt={top3[1].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-950 text-base flex items-center justify-center gap-1">
                          <span>{top3[1].name}</span>
                          {top3[1].isBrand && (
                            <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          {top3[1].username}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                        {top3[1].badge}
                      </span>
                      <div className="text-xl font-black text-slate-900 font-mono">
                        {top3[1].points.toLocaleString()}{" "}
                        <span className="text-xs font-bold text-amber-600">
                          {top3[1].isBrand ? "Votes" : "XP"}
                        </span>
                      </div>
                    </div>

                    {/* #1 Champion */}
                    <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/50 to-white border-2 border-amber-300 rounded-3xl p-8 shadow-lg shadow-amber-500/10 flex flex-col items-center text-center space-y-4 relative group hover:scale-[1.02] transition-all">
                      <div className="absolute -top-5 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Crown className="w-6 h-6 fill-white" />
                      </div>
                      <div className="w-24 h-24 rounded-full border-4 border-amber-400 overflow-hidden shadow-xl mt-2 bg-slate-100 flex items-center justify-center">
                        <img
                          src={top3[0].avatar}
                          alt={top3[0].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-950 text-lg flex items-center justify-center gap-1">
                          <span>{top3[0].name}</span>
                          {top3[0].isBrand && (
                            <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold">
                          {top3[0].username}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                        👑 {top3[0].badge}
                      </span>
                      <div className="text-2xl font-black text-slate-950 font-mono">
                        {top3[0].points.toLocaleString()}{" "}
                        <span className="text-xs font-bold text-amber-600">
                          {top3[0].isBrand ? "Votes" : "XP"}
                        </span>
                      </div>
                    </div>

                    {/* #3 Bronze */}
                    <div className="order-3 md:order-3 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center space-y-3 relative group hover:shadow-md transition-all">
                      <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                        🥉 #3 Bronze
                      </div>
                      <div className="w-20 h-20 rounded-full border-4 border-amber-200 overflow-hidden shadow-md group-hover:scale-105 transition-transform mt-2 bg-slate-100 flex items-center justify-center">
                        <img
                          src={top3[2].avatar}
                          alt={top3[2].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-950 text-base flex items-center justify-center gap-1">
                          <span>{top3[2].name}</span>
                          {top3[2].isBrand && (
                            <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          {top3[2].username}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                        {top3[2].badge}
                      </span>
                      <div className="text-xl font-black text-slate-900 font-mono">
                        {top3[2].points.toLocaleString()}{" "}
                        <span className="text-xs font-bold text-amber-600">
                          {top3[2].isBrand ? "Votes" : "XP"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. RANKINGS TABLE */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                      {timeframe === "BRANDS"
                        ? "All Brand Standings"
                        : "Global Roaster Standings"}
                    </h3>
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search name or @handle..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/30"
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <th className="pb-3 pl-3">Rank</th>
                          <th className="pb-3">{timeframe === "BRANDS" ? "Brand" : "Roaster"}</th>
                          <th className="pb-3">Badge / Status</th>
                          <th className="pb-3 text-center">{timeframe === "BRANDS" ? "Battles" : "Roasts"}</th>
                          <th className="pb-3 text-center">Votes</th>
                          <th className="pb-3 text-center">Win Rate</th>
                          <th className="pb-3 pr-3 text-right">{timeframe === "BRANDS" ? "Total Votes" : "Total XP"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {others.map((player) => (
                          <tr
                            key={`${player.rank}-${player.id}`}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              player.isCurrentUser ? "bg-red-50/50 font-bold" : ""
                            }`}
                          >
                            <td className="py-3.5 pl-3 font-black text-slate-500">
                              #{player.rank}
                            </td>
                            <td className="py-3.5 flex items-center gap-3">
                              <img
                                src={player.avatar}
                                alt={player.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100"
                              />
                              <div>
                                <div className="font-extrabold text-slate-900 flex items-center gap-1">
                                  <span>{player.name}</span>
                                  {player.isBrand && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                                  )}
                                  {player.isCurrentUser && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold">
                                  {player.username}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {player.badge}
                              </span>
                            </td>
                            <td className="py-3.5 text-center font-bold text-slate-700">
                              {player.roastsCount}
                            </td>
                            <td className="py-3.5 text-center font-bold text-slate-700">
                              {player.votesCount}
                            </td>
                            <td className="py-3.5 text-center font-black text-emerald-600">
                              {player.winRate}
                            </td>
                            <td className="py-3.5 pr-3 text-right font-black text-slate-950 font-mono">
                              {player.points.toLocaleString()} {player.isBrand ? "Votes" : "XP"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
