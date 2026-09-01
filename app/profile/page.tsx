"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Award,
  Crown,
  Edit3,
  MapPin,
  Calendar,
  Camera,
  ArrowRight,
  CheckCircle2,
  X,
  Zap,
  MessageSquare,
  Swords,
  Share2,
  Lock,
  Sparkles,
  Trophy,
  Users,
  TrendingUp,
  Heart,
  ExternalLink,
  Target,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ArenaNavbar } from "@/components/ArenaNavbar";
import { ArenaSidebar } from "@/components/ArenaSidebar";

const AVATAR_PRESETS = [
  { id: "p1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80", label: "Roast Master" },
  { id: "p2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80", label: "Savage Voter" },
  { id: "p3", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80", label: "Sneaker Head" },
  { id: "p4", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80", label: "Duel Queen" },
  { id: "p5", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80", label: "Burn King" },
  { id: "p6", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Gladiator", label: "Bot Warrior" },
  { id: "p7", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=FlameChampion", label: "Champion" },
  { id: "p8", url: "https://api.dicebear.com/7.x/micah/svg?seed=ArenaAce", label: "Arena Ace" },
];

export default function UserProfilePage() {
  const router = useRouter();

  // Tab selection
  const [activeTab, setActiveTab] = useState<
    "overview" | "activity" | "comments" | "votes" | "achievements"
  >("overview");

  // Profile Data State
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState({
    id: "",
    name: "RoastMaster",
    username: "roastmaster",
    email: "roastmaster@coroast.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    bio: "Here for savage comebacks. 🔥",
    location: "Global",
    joinedDate: "Joined 2024",
    currentTitle: "Arena Legend",
    verifiedBadge: true,
  });

  const [level, setLevel] = useState({
    currentLevel: 1,
    currentTitle: "Arena Rookie",
    currentXP: 500,
    xpForCurrentLevel: 0,
    xpForNextLevel: 1200,
    xpNeededForNext: 700,
    progressPercentage: 42,
    nextTitle: "Heckler",
    nextReward: "Level 2 → +150 XP",
  });

  const [stats, setStats] = useState({
    totalXP: 500,
    battlesParticipated: 0,
    battlesWon: 0,
    votesCast: 0,
    commentsPosted: 0,
    commentUpvotes: 0,
    battlesShared: 0,
    badgesEarned: 0,
    brandsFollowed: 18,
    currentStreak: 1,
    longestStreak: 1,
    leaderboardRank: 1,
    winRate: 0,
  });

interface DailyQuestItem {
  id: string;
  title: string;
  description: string;
  target: number;
  currentCount: number;
  completed: boolean;
  progressPercent: number;
  xpReward: number;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  xpEarned: number;
  createdAt: string;
}

interface CommentHistoryItem {
  id: string;
  battleTitle: string;
  battleSlug: string;
  content: string;
  upvotesCount: number;
  createdAt: string;
  isTrending: boolean;
}

interface VoteHistoryItem {
  id: string;
  battleTitle: string;
  battleSlug: string;
  chosenBrandName: string;
  chosenBrandColor: string;
  status: string;
  isWinner: boolean | null;
  xpEarned: number;
  createdAt: string;
}

interface BadgeItem {
  id: string;
  slug?: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  unlocked?: boolean;
  unlockedAt?: string | null;
  progressText?: string;
  percentage?: number;
  remainingText?: string;
  xpReward?: number;
}

  const [dailyQuests, setDailyQuests] = useState<DailyQuestItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [featuredBadges, setFeaturedBadges] = useState<BadgeItem[]>([]);

  // Sub-tabs states
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([]);
  const [commentsList, setCommentsList] = useState<CommentHistoryItem[]>([]);
  const [votesList, setVotesList] = useState<VoteHistoryItem[]>([]);
  const [achievementsData, setAchievementsData] = useState<{
    unlocked: BadgeItem[];
    locked: BadgeItem[];
    stats: { unlockedCount: number; totalCount: number; completionPercentage: number };
  }>({
    unlocked: [],
    locked: [],
    stats: { unlockedCount: 0, totalCount: 0, completionPercentage: 0 },
  });

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<BadgeItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    avatarUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load Main Profile
  const loadProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          setLevel(data.level);
          setStats(data.stats);
          setDailyQuests(data.dailyQuests || []);
          setRecentActivities(data.recentActivities || []);
          setFeaturedBadges(data.featuredBadges || []);

          setEditForm({
            name: data.user.name,
            username: data.user.username,
            bio: data.user.bio,
            location: data.user.location,
            avatarUrl: data.user.avatarUrl,
          });

          // Sync localStorage
          localStorage.setItem(
            "coroast_voter_session",
            JSON.stringify({
              name: data.user.name,
              avatar: data.user.avatarUrl,
              points: data.stats.totalXP,
              level: `Level ${data.level.currentLevel} • ${data.level.currentTitle}`,
            })
          );
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace("/login");
        }
      } else {
        setIsAuthenticated(false);
        router.replace("/login");
      }
    } catch {
      setIsAuthenticated(false);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Upfront check: if storage and cookies have no user session, immediately redirect to /login
    const hasSession =
      localStorage.getItem("coroast_voter_session") ||
      localStorage.getItem("coroast_user");
    if (
      !hasSession &&
      typeof document !== "undefined" &&
      !document.cookie.includes("user_session")
    ) {
      setIsAuthenticated(false);
      setLoading(false);
      router.replace("/login");
      return;
    }

    loadProfile();
  }, []);

  // Load Tab Data when tab changes
  useEffect(() => {
    if (activeTab === "activity") {
      fetch("/api/user/profile/activity")
        .then((r) => r.json())
        .then((d) => {
          if (d?.activities) setActivitiesList(d.activities);
        })
        .catch(() => {});
    } else if (activeTab === "comments") {
      fetch("/api/user/profile/comments")
        .then((r) => r.json())
        .then((d) => {
          if (d?.comments) setCommentsList(d.comments);
        })
        .catch(() => {});
    } else if (activeTab === "votes") {
      fetch("/api/user/profile/votes")
        .then((r) => r.json())
        .then((d) => {
          if (d?.votes) setVotesList(d.votes);
        })
        .catch(() => {});
    } else if (activeTab === "achievements") {
      fetch("/api/user/profile/achievements")
        .then((r) => r.json())
        .then((d) => {
          if (d?.unlocked) {
            setAchievementsData({
              unlocked: d.unlocked,
              locked: d.locked,
              stats: d.stats,
            });
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const handleOpenEdit = () => {
    setEditForm({
      name: user.name,
      username: user.username,
      bio: user.bio,
      location: user.location,
      avatarUrl: user.avatarUrl,
    });
    setErrorMsg("");
    setSaveSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setUser((prev) => ({
        ...prev,
        name: data.user.name || data.user.username,
        username: data.user.username,
        bio: data.user.bio || prev.bio,
        location: data.user.location || prev.location,
        avatarUrl: data.user.avatarUrl || prev.avatarUrl,
      }));

      // Update storage
      localStorage.setItem(
        "coroast_voter_session",
        JSON.stringify({
          name: data.user.name,
          avatar: data.user.avatarUrl,
          points: stats.totalXP,
          level: `Level ${level.currentLevel} • ${level.currentTitle}`,
        })
      );
      window.dispatchEvent(new Event("storage"));

      setSaveSuccess(true);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}

      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(false);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyProfileUrl = () => {
    const url = `${window.location.origin}/profile/${user.username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch {}
    setTimeout(() => setCopiedLink(false), 2000);
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

  if (loading || isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
        <ArenaNavbar activeTab="Profile" />
        <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-full border-3 border-red-600 border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Verifying session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* 1. Universal Fixed Navbar */}
      <ArenaNavbar activeTab="Profile" />

      {/* 2. Main Container with Persistent Sidebar */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Unified Arena Sidebar */}
          <div className="lg:col-span-2 hidden lg:block">
            <ArenaSidebar activeItem="Profile" />
          </div>

          {/* Center Column: Gamified Profile View (10 cols) */}
          <main className="lg:col-span-10 space-y-6">
            {/* 1. PROFILE HEADER CARD */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              {/* Top Banner Gradient */}
              <div className="h-32 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>

              {/* Profile Avatar, Info & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-12 relative z-10 mb-6">
                <div className="flex items-end gap-5">
                  <div className="relative group">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleOpenEdit}
                      className="absolute bottom-1 right-1 w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-950 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
                      title="Change selected picture"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
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
                        {level.currentTitle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit & Share Action Buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-102"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all cursor-pointer hover:scale-102"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Profile</span>
                  </button>
                </div>
              </div>

              {/* Bio & Metadata Strip */}
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
                  <Link
                    href="/leaderboard"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-black"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Global Rank #{stats.leaderboardRank}</span>
                  </Link>
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
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Battle, vote, and roast to unlock higher Arena ranks and exclusive perks.
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-base sm:text-lg font-black text-red-600">
                    {level.currentXP.toLocaleString()} /{" "}
                    {level.xpForNextLevel.toLocaleString()} XP
                  </span>
                  <div className="text-[11px] font-bold text-slate-400">
                    {level.progressPercentage}% Progress
                  </div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${level.progressPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                <span>
                  {level.xpNeededForNext > 0
                    ? `${level.xpNeededForNext.toLocaleString()} XP needed for Level ${
                        level.currentLevel + 1
                      }`
                    : "Maximum rank attained!"}
                </span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Next Reward: {level.nextReward}</span>
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
                <div className="text-2xl font-black text-pink-600 font-mono">
                  {stats.commentUpvotes}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Comment Upvotes
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-amber-600 font-mono">
                  {stats.badgesEarned}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Badges Earned
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-indigo-600 font-mono">
                  {stats.currentStreak}d
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Current Streak
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-teal-600 font-mono">
                  {stats.longestStreak}d
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Longest Streak
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-orange-600 font-mono">
                  {stats.battlesShared}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Battles Shared
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-cyan-600 font-mono">
                  {stats.brandsFollowed}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Brands Followed
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <div className="text-2xl font-black text-amber-600 font-mono">
                  #{stats.leaderboardRank}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Leaderboard Rank
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

            {/* 4. FUNCTIONAL PROFILE TABS NAVIGATION */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: <Sparkles className="w-4 h-4" /> },
                { id: "activity", label: "Activity", icon: <TrendingUp className="w-4 h-4" /> },
                { id: "comments", label: "Comments", icon: <MessageSquare className="w-4 h-4" /> },
                { id: "votes", label: "Votes", icon: <CheckCircle2 className="w-4 h-4" /> },
                { id: "achievements", label: "Achievements", icon: <Award className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id as "overview" | "activity" | "comments" | "votes" | "achievements"
                    )
                  }
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT: 1. OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Daily Quests Section */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-black text-slate-950 tracking-tight">
                        Daily Arena Quests
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      Resets Daily at 00:00 UTC
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dailyQuests.map((quest) => (
                      <div
                        key={quest.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          quest.completed
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-slate-50/60 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-xs text-slate-900">
                            {quest.title}
                          </span>
                          <span className="font-mono text-[11px] font-black text-amber-600">
                            +{quest.xpReward} XP
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-medium mb-3">
                          {quest.description}
                        </p>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                            <span>
                              {quest.currentCount} / {quest.target} Completed
                            </span>
                            <span>{quest.progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden flex">
                            <div
                              className={`h-full rounded-full transition-all ${
                                quest.completed ? "bg-emerald-500" : "bg-red-500"
                              }`}
                              style={{ width: `${quest.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity & Featured Badges Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Recent Activity (6 cols) */}
                  <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                        <span>Recent Activity</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("activity")}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {recentActivities.length === 0 ? (
                      <div className="text-center py-8 space-y-2">
                        <p className="text-xs text-slate-400 font-medium">
                          No recent activity recorded. Join a battle to earn XP!
                        </p>
                        <Link
                          href="/battles"
                          className="inline-block text-xs font-bold text-red-600 hover:underline"
                        >
                          Join Live Battle →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentActivities.map((act) => (
                          <div
                            key={act.id}
                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <Flame className="w-4 h-4 fill-current" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-900">
                                  {act.title}
                                </h4>
                                <p className="text-[11px] text-slate-400 font-medium">
                                  {act.description}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono text-xs font-black text-emerald-600">
                              +{act.xpEarned} XP
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Featured Badges (6 cols) */}
                  <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>Featured Badges</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("achievements")}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>All Badges ({stats.badgesEarned})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {featuredBadges.length === 0 ? (
                      <div className="text-center py-8 space-y-2">
                        <p className="text-xs text-slate-400 font-medium">
                          No badges unlocked yet. Cast votes and post roasts to unlock!
                        </p>
                        <Link
                          href="/battles"
                          className="inline-block text-xs font-bold text-red-600 hover:underline"
                        >
                          Unlock First Badge →
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {featuredBadges.map((badge) => (
                          <div
                            key={badge.id}
                            onClick={() => setSelectedBadgeModal(badge)}
                            className="p-3 rounded-2xl border border-slate-200/80 hover:border-red-300 hover:shadow-2xs transition-all cursor-pointer flex items-center gap-3 bg-slate-50/50"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                              {badge.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-xs text-slate-900 truncate">
                                {badge.name}
                              </h4>
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${getRarityBadgeStyle(
                                  badge.rarity
                                )}`}
                              >
                                {badge.rarity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. ACTIVITY */}
            {activeTab === "activity" && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950 tracking-tight">
                    Chronological Activity Timeline
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    Real-time XP Transactions
                  </span>
                </div>

                {activitiesList.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <p className="text-xs text-slate-400 font-medium">
                      No activity history found yet.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activitiesList.map((item) => (
                      <div
                        key={item.id}
                        className="py-3.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-red-600 shrink-0">
                            {item.type === "VOTE" ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : item.type === "COMMENT" ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : item.type === "LEVEL_UP" ? (
                              <Trophy className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Award className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {item.description} •{" "}
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-black text-emerald-600">
                          +{item.xpEarned} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. COMMENTS */}
            {activeTab === "comments" && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950 tracking-tight">
                    Your Roast Comments
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {commentsList.length} Roasts Published
                  </span>
                </div>

                {commentsList.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <p className="text-xs text-slate-400 font-medium">
                      You haven&apos;t dropped any roasts yet.
                    </p>
                    <Link
                      href="/battles"
                      className="inline-block px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase shadow-sm"
                    >
                      Join Live Duel →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {commentsList.map((comm) => (
                      <div key={comm.id} className="py-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">
                            {comm.battleTitle}
                          </span>
                          <div className="flex items-center gap-2">
                            {comm.isTrending && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase">
                                🔥 Trending
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">
                              {new Date(comm.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 font-medium">
                          “{comm.content}”
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-semibold">
                          <span className="flex items-center gap-1 text-red-600 font-bold">
                            <Heart className="w-3.5 h-3.5 fill-current" />
                            <span>{comm.upvotesCount} upvotes</span>
                          </span>
                          <Link
                            href="/battles"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>View in Arena</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 4. VOTES */}
            {activeTab === "votes" && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950 tracking-tight">
                    Your Voting History
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {votesList.length} Votes Cast
                  </span>
                </div>

                {votesList.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <p className="text-xs text-slate-400 font-medium">
                      You haven&apos;t cast any battle votes yet.
                    </p>
                    <Link
                      href="/battles"
                      className="inline-block px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase shadow-sm"
                    >
                      Vote Now →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {votesList.map((v) => (
                      <div
                        key={v.id}
                        className="py-4 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-extrabold text-slate-900">
                            {v.battleTitle}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              Voted for:
                            </span>
                            <span
                              className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase"
                              style={{ backgroundColor: v.chosenBrandColor || "#ef4444" }}
                            >
                              {v.chosenBrandName}
                            </span>
                            {v.isWinner !== null && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  v.isWinner
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {v.isWinner ? "✓ Correct Pick" : "Defeated"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs font-black text-emerald-600">
                            +{v.xpEarned} XP
                          </span>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {new Date(v.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 5. ACHIEVEMENTS & ALL BADGES */}
            {activeTab === "achievements" && (
              <div className="space-y-6">
                {/* Stats Bar */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-950 tracking-tight">
                      Arena Badges & Achievements
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Earn XP, vote, and stay active to unlock rare and legendary badges.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-2xl font-black text-red-600 font-mono">
                        {achievementsData.stats.unlockedCount} /{" "}
                        {achievementsData.stats.totalCount}
                      </span>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Badges Unlocked ({achievementsData.stats.completionPercentage}%)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Unlocked Badges */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                  <h4 className="text-base font-black text-slate-950 flex items-center gap-2">
                    <span>Unlocked Badges</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                      {achievementsData.unlocked.length}
                    </span>
                  </h4>

                  {achievementsData.unlocked.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium">
                      No badges unlocked yet. Start with casting your first vote!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievementsData.unlocked.map((badge) => (
                        <div
                          key={badge.id}
                          onClick={() => setSelectedBadgeModal(badge)}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-red-300 hover:shadow-xs transition-all cursor-pointer space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">
                              {badge.icon}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getRarityBadgeStyle(
                                badge.rarity
                              )}`}
                            >
                              {badge.rarity}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-extrabold text-sm text-slate-900">
                              {badge.name}
                            </h5>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">
                              {badge.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 font-bold">
                            <span className="text-emerald-600">Unlocked ✓</span>
                            <span className="text-amber-600 font-mono">
                              +{badge.xpReward} XP
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section: Locked Badges with Live Progress */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                  <h4 className="text-base font-black text-slate-950 flex items-center gap-2">
                    <span>Locked Badges</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
                      {achievementsData.locked.length}
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievementsData.locked.map((badge) => (
                      <div
                        key={badge.id}
                        onClick={() => setSelectedBadgeModal(badge)}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all cursor-pointer space-y-3 opacity-90"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl text-slate-400 grayscale shadow-2xs">
                            <Lock className="w-5 h-5 text-slate-400" />
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getRarityBadgeStyle(
                              badge.rarity
                            )}`}
                          >
                            {badge.rarity}
                          </span>
                        </div>

                        <div>
                          <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{badge.name}</span>
                            <span className="text-slate-400 text-xs">🔒</span>
                          </h5>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">
                            {badge.description}
                          </p>
                        </div>

                        {/* Progress Bar & Requirement */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-100">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                            <span>{badge.progressText}</span>
                            <span className="text-amber-600 font-mono">
                              +{badge.xpReward} XP
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                            <div
                              className="bg-red-500 h-full rounded-full transition-all"
                              style={{ width: `${badge.percentage}%` }}
                            />
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400">
                            {badge.remainingText}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 5. POLISHED BADGE DETAIL MODAL */}
      {selectedBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${getRarityBadgeStyle(
                  selectedBadgeModal.rarity
                )}`}
              >
                {selectedBadgeModal.rarity} BADGE
              </span>
              <button
                type="button"
                onClick={() => setSelectedBadgeModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-4xl mx-auto shadow-sm">
                {selectedBadgeModal.icon}
              </div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">
                {selectedBadgeModal.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                {selectedBadgeModal.description}
              </p>
            </div>

            {/* Requirement & Progress Details */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Unlock Requirement
                </span>
                <span className="font-mono font-black text-amber-600">
                  +{selectedBadgeModal.xpReward} XP Reward
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between font-extrabold text-slate-800">
                  <span>Progress</span>
                  <span>{selectedBadgeModal.progressText || (selectedBadgeModal.unlocked ? "Completed (100%)" : "0%")}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        selectedBadgeModal.unlocked
                          ? 100
                          : selectedBadgeModal.percentage || 0
                      }%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {selectedBadgeModal.unlocked
                    ? `Unlocked on ${
                        selectedBadgeModal.unlockedAt
                          ? new Date(selectedBadgeModal.unlockedAt).toLocaleDateString()
                          : "Recently"
                      }`
                    : selectedBadgeModal.remainingText || "In progress"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBadgeModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* 6. EDIT PROFILE & AVATAR PICKER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-950 tracking-tight">
                  Edit Profile
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Customize your roaster name, bio, and avatar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Selected Picture Preview */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <img
                    src={editForm.avatarUrl || user.avatarUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover border-2 border-red-500 shadow-md"
                  />
                  <div className="space-y-1 flex-1">
                    <span className="text-xs font-bold text-slate-800">
                      Chosen Avatar
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Pick from presets or paste any URL below.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setEditForm((prev) => ({ ...prev, avatarUrl: preset.url }))
                      }
                      className={`p-1 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        editForm.avatarUrl === preset.url
                          ? "border-red-600 bg-red-50"
                          : "border-slate-200 hover:border-slate-400 bg-white"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="text-[9px] font-bold text-slate-600 truncate max-w-full">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={editForm.avatarUrl}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, avatarUrl: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Display Name */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      }))
                    }
                    className="w-full pl-7 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Bio / Status
                </label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. SHARE PROFILE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-950 tracking-tight">
                Share Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-300"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-sm text-slate-900 truncate">
                  {user.name}
                </h4>
                <p className="text-xs text-slate-500 font-bold truncate">
                  @{user.username} • {level.currentTitle}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Public Profile URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/profile/${user.username}`}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyProfileUrl}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer transition-all"
                >
                  {copiedLink ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
