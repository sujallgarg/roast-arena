"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Flame,
  Award,
  Crown,
  Share2,
  Copy,
  Check,
  MapPin,
  Calendar,
  Zap,
  TrendingUp,
  Swords,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ArenaNavbar } from "@/components/ArenaNavbar";
import { ArenaSidebar } from "@/components/ArenaSidebar";

interface FeaturedBadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  unlockedAt: string;
}

interface PublicProfileData {
  user: {
    name: string;
    username: string;
    avatarUrl: string;
    bio: string;
    location: string;
    joinedDate: string;
    currentTitle: string;
    verifiedBadge: boolean;
  };
  level: {
    currentLevel: number;
    currentTitle: string;
    currentXP: number;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    xpNeededForNext: number;
    progressPercentage: number;
    nextTitle: string;
    nextReward: string;
    isMaxLevel: boolean;
  };
  stats: {
    totalXP: number;
    battlesParticipated: number;
    battlesWon: number;
    votesCast: number;
    commentsPosted: number;
    commentUpvotes: number;
    battlesShared: number;
    badgesEarned: number;
    brandsFollowed: number;
    currentStreak: number;
    longestStreak: number;
    leaderboardRank: number;
    winRate: number;
  };
  featuredBadges: FeaturedBadgeItem[];
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/user/public/${encodeURIComponent(username)}`)
      .then((res) => {
        if (!res.ok) throw new Error("User profile not found");
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setProfileData(data);
        } else {
          setError("User not found");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch {}
    setTimeout(() => setCopied(false), 2000);
  };

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case "LEGENDARY":
        return "bg-amber-500/10 text-amber-600 border-amber-300";
      case "EPIC":
        return "bg-purple-500/10 text-purple-600 border-purple-300";
      case "RARE":
        return "bg-blue-500/10 text-blue-600 border-blue-300";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
        <ArenaNavbar activeTab="Profile" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-500">Loading Roaster Profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
        <ArenaNavbar activeTab="Profile" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl font-black">
              ⚔️
            </div>
            <h1 className="text-xl font-black text-slate-950">Roaster Not Found</h1>
            <p className="text-xs text-slate-500 font-medium">
              The player @{username} doesn&apos;t exist yet or has left the Arena.
            </p>
            <Link
              href="/battles"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase shadow-md shadow-red-600/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Arena</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, level, stats, featuredBadges } = profileData;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      <ArenaNavbar activeTab="Profile" />

      <div className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-2 hidden lg:block">
            <ArenaSidebar activeItem="Profile" />
          </div>

          <main className="lg:col-span-10 space-y-6">
            {/* 1. PROFILE HEADER CARD */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="h-32 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-12 relative z-10 mb-6">
                <div className="flex items-end gap-5">
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
                    />
                    <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                        {user.name}
                      </h1>
                      <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">
                        Verified Roaster ✓
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-500">
                        @{user.username}
                      </p>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-extrabold text-red-600">
                        {user.currentTitle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${user.name} on Roast Arena`,
                          text: `Check out ${user.name}'s battle profile on Roast Arena!`,
                          url: window.location.href,
                        });
                      } else {
                        handleCopyLink();
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm shadow-red-600/30 transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <p className="text-sm font-medium text-slate-700 max-w-2xl leading-relaxed">
                  {user.bio}
                </p>

                <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{user.joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-600 font-black">
                    <Zap className="w-4 h-4 fill-amber-500" />
                    <span>{stats.totalXP.toLocaleString()} Total XP</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-600 font-black">
                    <Flame className="w-4 h-4 fill-red-500" />
                    <span>{stats.currentStreak} Day Streak 🔥</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LEVEL PROGRESSION CARD */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-xs shadow-red-600/30">
                      LEVEL {level.currentLevel}
                    </span>
                    <h2 className="text-xl font-black text-slate-950 tracking-tight">
                      {level.currentTitle}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-base sm:text-lg font-black text-red-600">
                    {level.currentXP.toLocaleString()} /{" "}
                    {level.xpForNextLevel.toLocaleString()} XP
                  </span>
                  <div className="text-[11px] font-bold text-slate-400">
                    {level.progressPercentage}% Completed
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${level.progressPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                <span>
                  {level.xpNeededForNext > 0
                    ? `${level.xpNeededForNext.toLocaleString()} XP to Next Rank`
                    : "Maximum Level Reached!"}
                </span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Next: {level.nextReward}</span>
                </span>
              </div>
            </div>

            {/* 3. REAL USER STATISTICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-red-600 font-mono">
                  {stats.totalXP.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Total XP
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-blue-600 font-mono">
                  {stats.battlesParticipated}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Battles Joined
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-emerald-600 font-mono">
                  {stats.votesCast}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Votes Cast
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-purple-600 font-mono">
                  {stats.commentsPosted}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Roasts Posted
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-amber-600 font-mono">
                  #{stats.leaderboardRank}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Global Rank
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-rose-600 font-mono">
                  {stats.winRate}%
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Win Rate
                </div>
              </div>
            </div>

            {/* 4. FEATURED BADGES SHOWCASE */}
            {featuredBadges && featuredBadges.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-950 tracking-tight">
                    Featured Badges & Achievements
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {stats.badgesEarned} Badges Earned
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {featuredBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-3.5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                        {badge.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {badge.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getRarityBadgeStyle(
                              badge.rarity
                            )}`}
                          >
                            {badge.rarity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
