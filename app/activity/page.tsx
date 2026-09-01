"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  MessageSquare,
  Award,
  Share2,
  Zap,
  Trophy,
  CheckCircle2,
  ChevronDown,
  Clock,
  ArrowRight,
} from "lucide-react";
import { ArenaNavbar } from "@/components/ArenaNavbar";
import { ArenaSidebar } from "@/components/ArenaSidebar";

interface DBActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  xpEarned: number;
  createdAt: string;
}

function getActivityVisuals(type: string) {
  const t = (type || "").toUpperCase();
  if (t === "VOTE" || t.includes("VOTE")) {
    return {
      icon: <Flame className="w-4 h-4 text-red-600 fill-red-600" />,
      iconBg: "bg-red-50 border border-red-200",
      category: "Votes",
    };
  }
  if (t === "COMMENT" || t.includes("COMMENT") || t.includes("ROAST")) {
    return {
      icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
      iconBg: "bg-purple-50 border border-purple-200",
      category: "Comments",
    };
  }
  if (t === "BADGE_UNLOCKED" || t.includes("BADGE")) {
    return {
      icon: <Award className="w-4 h-4 text-amber-600" />,
      iconBg: "bg-amber-50 border border-amber-200",
      category: "Badges",
    };
  }
  if (t === "SHARE" || t.includes("SHARE")) {
    return {
      icon: <Share2 className="w-4 h-4 text-pink-600" />,
      iconBg: "bg-pink-50 border border-pink-200",
      category: "Shares",
    };
  }
  if (t === "BATTLE_WON" || t.includes("WIN") || t.includes("WON")) {
    return {
      icon: <Trophy className="w-4 h-4 text-amber-600 fill-amber-500" />,
      iconBg: "bg-amber-50 border border-amber-200",
      category: "XP Earned",
    };
  }
  if (t === "QUEST_COMPLETED" || t.includes("QUEST")) {
    return {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      iconBg: "bg-emerald-50 border border-emerald-200",
      category: "Quests",
    };
  }
  return {
    icon: <Zap className="w-4 h-4 text-blue-600" />,
    iconBg: "bg-blue-50 border border-blue-200",
    category: "XP Earned",
  };
}

function formatRelativeTime(dateStr: string | Date) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export default function ActivityPage() {
  const [filter, setFilter] = useState("All Activity");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [activities, setActivities] = useState<DBActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Fetch real activities from PostgreSQL API
  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/profile/activity");
      if (res.status === 401) {
        setIsLoggedIn(false);
        setActivities([]);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          setIsLoggedIn(true);
          setActivities(data.activities || []);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error loading activity:", error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();

    const handleSync = () => loadActivities();
    window.addEventListener("arena_login", handleSync);
    window.addEventListener("arena_logout", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("arena_login", handleSync);
      window.removeEventListener("arena_logout", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const filtered = activities.filter((act) => {
    if (filter === "All Activity") return true;
    const { category } = getActivityVisuals(act.type);
    if (filter === "Votes") return category === "Votes";
    if (filter === "Comments") return category === "Comments";
    if (filter === "XP Earned") return category === "XP Earned";
    if (filter === "Badges") return category === "Badges";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Universal Fixed Navbar */}
      <ArenaNavbar />

      {/* Main Container With Sidebar */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side Navbar */}
          <div className="lg:col-span-2 hidden lg:block">
            <ArenaSidebar activeItem="Activity" />
          </div>

          {/* Main Activity Stream */}
          <main className="lg:col-span-10 space-y-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>ACTIVITY</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                  All your arena actions.
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Track your votes, comments, XP, wins and everything in between.
                </p>
              </div>

              {/* Filter Dropdown (visible only when logged in) */}
              {isLoggedIn && activities.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                  >
                    <span>{filter}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-20">
                      {["All Activity", "Votes", "Comments", "XP Earned", "Badges"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFilter(opt);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 cursor-pointer ${
                            filter === opt ? "text-red-600 font-black" : "text-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content Feed */}
            {loading ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">
                  Loading real-time activity...
                </p>
              </div>
            ) : !isLoggedIn ? (
              /* DEDICATED AUTHENTICATION GATING: NO USER ACTIVITY BEFORE LOGIN */
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-14 shadow-xs text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200/70 flex items-center justify-center text-red-600 shadow-2xs mx-auto">
                  <Clock className="w-10 h-10" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950">
                    Login to See Your Activity
                  </h2>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    You must be logged in to view your battle votes, roast comments, XP transactions, and unlocked badges.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/login?redirect=/activity"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30 cursor-pointer active:scale-95"
                  >
                    <span>Log In to Account</span>
                  </Link>
                  <Link
                    href="/signup?redirect=/activity"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <span>Create Free Account</span>
                  </Link>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-slate-800">
                    {filter === "All Activity" ? "No Recent Activity Yet" : `No ${filter} Yet`}
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    You haven&apos;t performed any actions in this category yet. Join live battles, cast votes, and drop roasts to build your arena history!
                  </p>
                </div>
                <Link
                  href="/battles"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-xs transition-all"
                >
                  <span>Explore Live Battles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              /* Real Database Activities */
              <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-xs space-y-2.5">
                {filtered.slice(0, visibleCount).map((item) => {
                  const { icon, iconBg } = getActivityVisuals(item.type);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50/80 border border-transparent hover:border-slate-100 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                        >
                          {icon}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">{item.title}</span>
                          {item.description && (
                            <p className="text-[11px] text-slate-400 font-medium">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 font-mono">
                        {item.xpEarned > 0 && (
                          <span className="font-black text-emerald-600">
                            +{item.xpEarned} XP
                          </span>
                        )}
                        <span className="text-slate-400 text-[11px] w-16 text-right font-sans font-medium">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More Button */}
            {isLoggedIn && visibleCount < filtered.length && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <span>Load More Activity</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
