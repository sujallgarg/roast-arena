"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Zap,
  CheckCircle2,
  Trophy,
  Award,
  Swords,
  Clock,
  Users,
  Heart,
  Share2,
  Image as ImageIcon,
  Smile,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ArenaNavbar } from "@/components/ArenaNavbar";
import { ArenaSidebar } from "@/components/ArenaSidebar";
import { RoundTimerShowcase } from "@/components/RoundTimerShowcase";
import {
  RoundState,
  TOTAL_ROUNDS,
  getSynchronizedRound,
  setClientClockOffset,
} from "@/lib/round-sync";

interface CommentItem {
  id: string;
  author: string;
  authorHandle?: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
  hasLiked?: boolean;
}

interface ArchivedBattle {
  id: string;
  round: string;
  endedDate: string;
  winner: string;
  brandA: {
    name: string;
    tagline: string;
    score: number;
    votes: number;
    color: string;
  };
  brandB: {
    name: string;
    tagline: string;
    score: number;
    votes: number;
    color: string;
  };
  topRoast: string;
  totalVotes: string;
}

export default function LiveBattlesPage() {
  const router = useRouter();

  // Navigation tabs for battle views
  const [viewTab, setViewTab] = useState<
    "live-arena" | "all-battles" | "ending-soon" | "previous-battles"
  >("live-arena");

  // Database Live Battle State (Real counts)
  const [joinedCount, setJoinedCount] = useState(0);
  const [watchingCount, setWatchingCount] = useState(1);
  const [hasJoined, setHasJoined] = useState(false);
  const [showFullVerifiedBanner, setShowFullVerifiedBanner] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  // Voting State from Database
  const [hasVoted, setHasVoted] = useState<"NIKE" | "ADIDAS" | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [nikeVotes, setNikeVotes] = useState(11248);
  const [adidasVotes, setAdidasVotes] = useState(7144);
  const [userXpGained, setUserXpGained] = useState(false);

  // Live Comments Stream (Database backed)
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [roastInput, setRoastInput] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Current logged in user info (null when logged out)
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    avatar: string;
  } | null>(null);

  // Search & Filter for battles
  const [searchQuery, setSearchQuery] = useState("");

  // Real Database Battles & Roasters (eliminating static mock data)
  const [dbBattles, setDbBattles] = useState<any[]>([]);
  const [trendingRoasters, setTrendingRoasters] = useState<any[]>([]);

  const fetchAllBattles = async () => {
    try {
      const res = await fetch("/api/battles");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.battles)) {
          setDbBattles(data.battles);
        }
      }
    } catch {}
  };

  const fetchTrendingRoasters = async () => {
    try {
      const res = await fetch("/api/leaderboard?timeframe=WEEK");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leaderboard)) {
          setTrendingRoasters(data.leaderboard.slice(0, 3));
        }
      }
    } catch {}
  };

  // Synchronized Round & Auto-Timer State (globally synchronized across all users)
  const [roundState, setRoundState] = useState<RoundState>(() => getSynchronizedRound());

  useEffect(() => {
    // 1. Calibrate client clock against global server time to eliminate device clock differences
    fetch("/api/battles/live/timer")
      .then((res) => res.json())
      .then((data) => {
        if (data?.serverTime) {
          setClientClockOffset(data.serverTime);
          setRoundState(getSynchronizedRound());
        }
      })
      .catch(() => {});

    // 2. Global interval ticking down every second
    const interval = setInterval(() => {
      setRoundState(getSynchronizedRound());
    }, 1000);

    // 3. Reset vote/join state immediately when user logs out
    const handleLogoutSync = () => {
      setCurrentUser(null);
      setHasJoined(false);
      setHasVoted(null);
      fetchBattleData();
    };

    window.addEventListener("arena_logout", handleLogoutSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener("arena_logout", handleLogoutSync);
    };
  }, []);

  // 1. Fetch live battle, join status, votes, and comments from PostgreSQL Database
  const fetchBattleData = async () => {
    try {
      const res = await fetch("/api/battles/live");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.joinedCount !== undefined) setJoinedCount(data.joinedCount);
          if (data.watchingCount !== undefined) setWatchingCount(data.watchingCount);
          setHasJoined(!!data.hasJoined);
          setHasVoted(data.hasVoted ?? null);
          if (data.votesCountA !== undefined) setNikeVotes(data.votesCountA);
          if (data.votesCountB !== undefined) setAdidasVotes(data.votesCountB);
          if (data.comments && Array.isArray(data.comments)) {
            setComments(data.comments);
          }
        }
      }
    } catch {}
  };

  // Real-time viewer presence heartbeat (updates real watching viewers every 20s)
  useEffect(() => {
    const sendPresence = async () => {
      try {
        const res = await fetch("/api/battles/live/heartbeat", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (data.watchingCount !== undefined) {
            setWatchingCount(data.watchingCount);
          }
          if (data.joinedCount !== undefined) {
            setJoinedCount(data.joinedCount);
          }
        }
      } catch {}
    };

    sendPresence();
    const interval = setInterval(sendPresence, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncCurrentUser = () => {
      try {
        const stored = localStorage.getItem("coroast_voter_session");
        const userObj = localStorage.getItem("coroast_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name) {
            setCurrentUser({
              name: parsed.name,
              avatar: parsed.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Roaster",
            });
          }
        } else if (userObj) {
          const parsed = JSON.parse(userObj);
          setCurrentUser({
            name: parsed.name || parsed.username || "Arena Roaster",
            avatar: parsed.avatarUrl || parsed.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Roaster",
          });
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };

    syncCurrentUser();

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser({
            name: data.user.name || data.user.username,
            avatar:
              data.user.avatarUrl ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=Roaster",
          });
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {
        setCurrentUser(null);
      });

    fetchBattleData();
    fetchAllBattles();
    fetchTrendingRoasters();

    window.addEventListener("storage", syncCurrentUser);
    window.addEventListener("arena_login", syncCurrentUser);
    window.addEventListener("arena_logout", syncCurrentUser);
    return () => {
      window.removeEventListener("storage", syncCurrentUser);
      window.removeEventListener("arena_login", syncCurrentUser);
      window.removeEventListener("arena_logout", syncCurrentUser);
    };
  }, []);

  // Calculate percentages
  const totalVotes = nikeVotes + adidasVotes;
  const nikePercent = totalVotes > 0 ? Math.round((nikeVotes / totalVotes) * 100) : 62;
  const adidasPercent = 100 - nikePercent;

  // 2. JOIN BATTLE (MANDATORY REQUIREMENT: Must be logged in to join)
  const handleJoinBattle = async () => {
    if (!currentUser) {
      router.push("/login?redirect=/battles");
      return;
    }
    if (hasJoined || isJoining) return;
    setIsJoining(true);
    setVoteError("");

    try {
      const res = await fetch("/api/battles/live/join", {
        method: "POST",
      });
      const data = await res.json();

      if (res.status === 401 || data.requireAuth) {
        router.push("/login?redirect=/battles");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to join battle");
      }

      setHasJoined(true);
      setShowFullVerifiedBanner(true);
      if (data.joinedCount) {
        setJoinedCount(data.joinedCount);
      } else {
        setJoinedCount((prev) => prev + 1);
      }
      setJoinMessage("🎉 You joined the arena! You are now eligible to vote.");

      setTimeout(() => {
        setShowFullVerifiedBanner(false);
        setJoinMessage("");
      }, 4000);

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.5 },
          colors: ["#ef4444", "#3b82f6", "#10b981"],
        });
      } catch {}
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to join battle.";
      setVoteError(msg);
    } finally {
      setIsJoining(false);
    }
  };

  // 3. CAST VOTE IN DATABASE (GATED TO AUTHENTICATED & JOINED USERS ONLY)
  const handleVote = async (brand: "NIKE" | "ADIDAS") => {
    if (!currentUser) {
      router.push("/login?redirect=/battles");
      return;
    }
    if (hasVoted) return;

    if (!hasJoined) {
      setVoteError("⚠️ You must join the battle first before you can vote! Click 'Join Battle' below.");
      return;
    }

    setIsVoting(true);
    setVoteError("");

    try {
      const res = await fetch("/api/battles/live/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit vote");
      }

      setHasVoted(brand);
      if (data.votesCountA !== undefined && data.votesCountB !== undefined) {
        setNikeVotes(data.votesCountA);
        setAdidasVotes(data.votesCountB);
      } else {
        if (brand === "NIKE") setNikeVotes((v) => v + 1);
        else setAdidasVotes((v) => v + 1);
      }
      setUserXpGained(true);

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: brand === "NIKE" ? ["#ef4444", "#dc2626", "#ffffff"] : ["#3b82f6", "#2563eb", "#ffffff"],
        });
      } catch {}
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cast vote.";
      setVoteError(msg);
    } finally {
      setIsVoting(false);
    }
  };

  // 4. SUBMIT ROAST COMMENT TO DATABASE (GATED TO AUTHENTICATED USERS)
  const handleSendRoast = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      router.push("/login?redirect=/battles");
      return;
    }
    if (!roastInput.trim() || isPostingComment) return;

    const commentText = roastInput.trim();
    setIsPostingComment(true);

    try {
      const res = await fetch("/api/battles/live/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: commentText,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
        }),
      });

      const data = await res.json();
      if (res.status === 401 || data.requireAuth) {
        router.push("/login?redirect=/battles");
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to post comment");
      }

      const savedComment = data.comment || {
        id: `c-${Date.now()}`,
        author: currentUser.name,
        avatar: currentUser.avatar,
        text: commentText,
        likes: 0,
        time: "Just now",
      };

      setComments((prev) => [savedComment, ...prev]);
      setRoastInput("");

      // Smooth scroll to comment
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post comment.";
      setVoteError(msg);
    } finally {
      setIsPostingComment(false);
    }
  };

  // Like comment in database (GATED TO AUTHENTICATED USERS)
  const handleLikeComment = async (id: string) => {
    if (!currentUser) {
      router.push("/login?redirect=/battles");
      return;
    }

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isLiked = c.hasLiked;
          return {
            ...c,
            likes: isLiked ? c.likes - 1 : c.likes + 1,
            hasLiked: !isLiked,
          };
        }
        return c;
      })
    );

    try {
      await fetch("/api/battles/live/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: id, action: "upvote" }),
      });
    } catch {}
  };

  // Insert emoji into roast box
  const addEmoji = (emoji: string) => {
    setRoastInput((prev) => (prev ? `${prev} ${emoji}` : emoji));
  };

  // Dynamic Real Battles from PostgreSQL Database
  const previousBattles = dbBattles.filter((b) => b.status === "ENDED");
  const endingSoonBattles = dbBattles.filter(
    (b) => b.status === "LIVE" && b.slug !== "nike-vs-adidas-clash"
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* 1. Universal Fixed Navbar */}
      <ArenaNavbar activeTab="Live Battles" />

      {/* 2. Main Arena Container */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Unified Arena Sidebar (NO HOME, HAS LIVE STATUS) */}
          <div className="lg:col-span-2 hidden lg:block">
            <ArenaSidebar activeItem="Live Battles" />
          </div>

          {/* Center Column: Main Live Arena Stream & Tabs (7 cols) */}
          <main className="lg:col-span-7 space-y-6">
            {/* View Switching Navigation Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-2 shadow-2xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewTab("live-arena")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    viewTab === "live-arena"
                      ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <span>LIVE ARENA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab("ending-soon")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewTab === "ending-soon"
                      ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ending Soon</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab("previous-battles")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewTab === "previous-battles"
                      ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Previous Battles</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab("all-battles")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewTab === "all-battles"
                      ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>All Battles</span>
                </button>
              </div>

              {/* Live Joined People Counter Badge */}
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-xl">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>{joinedCount.toLocaleString()} Joined Battle</span>
              </div>
            </div>

            {/* TAB 1: LIVE ARENA (MAIN CLASH) */}
            {viewTab === "live-arena" && (
              <>
                {/* Main Clash Arena Card */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
                  {/* Top Bar: LIVE ARENA badge | Watching counter */}
                  <div className="flex items-center justify-between gap-3 text-xs border-b border-slate-100/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span>Live Arena</span>
                      </span>
                      {hasJoined && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs animate-in fade-in duration-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          <span>Verified ✓</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-bold text-slate-600 text-xs bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full shadow-2xs">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{watchingCount.toLocaleString()} watching</span>
                    </div>
                  </div>

                  {/* PROMINENT SHOWCASE ROUND TIMER (MATCHING DESIGN REFERENCE) */}
                  <div className="py-1">
                    <RoundTimerShowcase roundState={roundState} />
                  </div>

                  {/* MANDATORY BATTLE JOIN BANNER (USER GATING) */}
                  {!currentUser ? (
                    <div
                      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-xs bg-gradient-to-r from-red-50/70 via-amber-50/40 to-white border-red-200/90 hover:border-red-300"
                    >
                      <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs bg-red-100 border-red-200 text-red-600">
                          <Flame className="w-5 h-5 text-red-600 fill-red-600 animate-pulse" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-sm text-slate-950 flex items-center gap-2">
                            <span>Log In to Join Battle & Cast Vote</span>
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                              Account Required
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            You must log in or create an account to join the arena, vote, and earn XP.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                        <Link
                          href="/login?redirect=/battles"
                          className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/25 transition-all text-center"
                        >
                          Log In
                        </Link>
                        <Link
                          href="/signup?redirect=/battles"
                          className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-black text-xs uppercase tracking-wider transition-all text-center"
                        >
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  ) : !hasJoined ? (
                    <div
                      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-xs bg-gradient-to-r from-white via-slate-50/50 to-red-50/30 border-slate-200/90 hover:border-red-200"
                    >
                      <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs bg-red-50 border-red-200 text-red-600">
                          <UserPlus className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-sm text-slate-950 flex items-center gap-2">
                            <span>Join This Battle to Unlock Voting</span>
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider border border-red-200">
                              Action Required
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            Only users who join the battle can cast votes. Click below to participate!
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleJoinBattle}
                        disabled={isJoining}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/25 transition-all hover:scale-102 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isJoining ? "Joining Battle..." : "JOIN BATTLE NOW ⚔️"}
                      </button>
                    </div>
                  ) : showFullVerifiedBanner ? (
                    <div
                      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-xs bg-gradient-to-r from-white via-emerald-50/40 to-emerald-50/70 border-emerald-200/90 shadow-emerald-500/5 relative animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs bg-emerald-100/90 border-emerald-200 text-emerald-600">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-sm text-slate-950 flex items-center gap-2">
                            <span>You are a Verified Battle Participant</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Joined ✓</span>
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            Voting access is verified. Cast your vote for Nike or Adidas to earn +50 XP!
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100/70 border border-emerald-200/90 text-emerald-800 text-xs font-black shrink-0 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Voting Access Unlocked ✓</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowFullVerifiedBanner(false)}
                          title="Dismiss banner"
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Join Success Alert */}
                  {joinMessage && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{joinMessage}</span>
                    </div>
                  )}

                  {/* Vote Error or Gating Alert */}
                  {voteError && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{voteError}</span>
                      </div>
                      {!hasJoined && (
                        <button
                          type="button"
                          onClick={handleJoinBattle}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black uppercase cursor-pointer"
                        >
                          Join Now
                        </button>
                      )}
                    </div>
                  )}

                  {/* Visual Clash Stage: Red Glove + NIKE vs ADIDAS + Blue Glove */}
                  <div className="relative py-4 px-2">
                    <div className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center">
                      {/* Left: NIKE (5 cols) */}
                      <div className="sm:col-span-5 flex flex-col items-center text-center space-y-3">
                        <div className="relative w-full flex items-center justify-center">
                          {/* Red Glove Punching Left to Right */}
                          <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                            <img
                              src="/red-glove.jpg"
                              alt="Nike Glove"
                              className="w-full h-full object-contain drop-shadow-xl transform hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Brand Circle Badge */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0 border-2 border-white -ml-4 z-10">
                            <svg className="w-9 h-9 fill-white" viewBox="0 0 24 24">
                              <path d="M21.707 5.293c-.266-.266-.677-.323-.996-.141L4.316 14.545c-1.127.643-1.637 1.942-1.258 3.197.354 1.171 1.455 1.958 2.68 1.958.337 0 .681-.06 1.018-.184L21.464 6.274c.325-.119.536-.428.536-.774 0-.173-.053-.341-.157-.487l-.136-.12z" />
                            </svg>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                            NIKE
                          </h2>
                          <div className="text-xs font-black text-red-600 tracking-wide">
                            Just Do It.
                          </div>
                        </div>

                        {/* Roast Quote Speech Bubble */}
                        <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-3.5 text-xs text-slate-700 font-medium relative shadow-2xs text-left max-w-xs">
                          <span className="text-red-600 font-black text-base mr-1">
                            “
                          </span>
                          <span>
                            Spends billions on ads, still can&apos;t make better stock
                            prices. 🔥
                          </span>
                        </div>
                      </div>

                      {/* Center: VS Graphic (1 col) */}
                      <div className="sm:col-span-1 flex items-center justify-center my-2 sm:my-0">
                        <div className="relative flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-slate-950 text-white flex items-center justify-center font-black italic text-base shadow-xl border-2 border-slate-100 z-10">
                            <span className="text-red-500">V</span>
                            <span className="text-blue-500">S</span>
                          </div>
                          {/* Radiant Energy Rings */}
                          <div className="absolute w-20 h-20 rounded-full border border-red-500/20 animate-ping pointer-events-none" />
                        </div>
                      </div>

                      {/* Right: ADIDAS (5 cols) */}
                      <div className="sm:col-span-5 flex flex-col items-center text-center space-y-3">
                        <div className="relative w-full flex items-center justify-center">
                          {/* Brand Circle Badge */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0 border-2 border-white -mr-4 z-10">
                            <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
                              <path d="M4 19h2.5l5.5-12h-2.5L4 19zm6 0h2.5l5.5-8h-2.5l-5.5 8zm6 0h2.5L22 15h-2.5l-3.5 4z" />
                            </svg>
                          </div>

                          {/* Blue Glove Punching Right to Left */}
                          <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                            <img
                              src="/blue-glove.jpg"
                              alt="Adidas Glove"
                              className="w-full h-full object-contain drop-shadow-xl transform hover:scale-105 transition-transform"
                            />
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                            ADIDAS
                          </h2>
                          <div className="text-xs font-black text-blue-600 tracking-wide">
                            Impossible Is Nothing.
                          </div>
                        </div>

                        {/* Roast Quote Speech Bubble */}
                        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-slate-700 font-medium relative shadow-2xs text-left max-w-xs">
                          <span className="text-blue-600 font-black text-base mr-1">
                            “
                          </span>
                          <span>
                            Cool stripes, but your sneakers can&apos;t outrun our
                            legacy. 😎
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vote Ratio Percentages and Split Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-3xl font-black text-red-600 font-mono">
                          {nikePercent}%
                        </span>
                        <div className="text-[11px] text-slate-400 font-semibold">
                          {nikeVotes.toLocaleString()} votes
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-red-600 shadow-2xs">
                        <Zap className="w-4 h-4 fill-red-600" />
                      </div>

                      <div className="text-right">
                        <span className="text-3xl font-black text-blue-600 font-mono">
                          {adidasPercent}%
                        </span>
                        <div className="text-[11px] text-slate-400 font-semibold">
                          {adidasVotes.toLocaleString()} votes
                        </div>
                      </div>
                    </div>

                    {/* Dual Color Percentage Bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="bg-red-600 h-full transition-all duration-700 ease-out"
                        style={{ width: `${nikePercent}%` }}
                      />
                      <div
                        className="bg-blue-600 h-full transition-all duration-700 ease-out"
                        style={{ width: `${adidasPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Interactive Vote Buttons Row (Gated: Only Joined Users Can Vote!) */}
                  <div className="space-y-2 pt-2">
                    {!currentUser ? (
                      <p className="text-center text-xs font-bold text-slate-500">
                        🔒 Voting is locked. <Link href="/login?redirect=/battles" className="text-red-600 underline font-extrabold">Log in</Link> or <Link href="/signup?redirect=/battles" className="text-red-600 underline font-extrabold">sign up</Link> to join the battle and vote.
                      </p>
                    ) : !hasJoined ? (
                      <p className="text-center text-xs font-bold text-slate-500">
                        🔒 Vote buttons are locked. Join the battle above to cast your vote.
                      </p>
                    ) : null}

                    <div className="flex items-center justify-between gap-4">
                      {/* Vote Nike */}
                      <button
                        type="button"
                        onClick={() => handleVote("NIKE")}
                        disabled={hasVoted !== null || isVoting}
                        className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer ${
                          hasVoted === "NIKE"
                            ? "bg-emerald-600 text-white shadow-emerald-600/30"
                            : hasVoted === "ADIDAS"
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            : !currentUser || !hasJoined
                            ? "bg-slate-200 text-slate-500 hover:bg-slate-300 shadow-none cursor-pointer"
                            : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                        <span>
                          {hasVoted === "NIKE"
                            ? "VOTED NIKE ✓"
                            : !currentUser
                            ? "LOG IN TO VOTE NIKE"
                            : !hasJoined
                            ? "JOIN TO VOTE NIKE"
                            : "VOTE NIKE"}
                        </span>
                      </button>

                      {/* Center XP Badge */}
                      <div className="shrink-0 text-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-extrabold text-slate-600 shadow-2xs">
                        <div className="text-amber-600 font-black flex items-center justify-center gap-1">
                          <Zap className="w-3.5 h-3.5 fill-amber-500" />
                          <span>+50 XP</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-semibold">
                          for your vote
                        </div>
                      </div>

                      {/* Vote Adidas */}
                      <button
                        type="button"
                        onClick={() => handleVote("ADIDAS")}
                        disabled={hasVoted !== null || isVoting}
                        className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer ${
                          hasVoted === "ADIDAS"
                            ? "bg-emerald-600 text-white shadow-emerald-600/30"
                            : hasVoted === "NIKE"
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            : !currentUser || !hasJoined
                            ? "bg-slate-200 text-slate-500 hover:bg-slate-300 shadow-none cursor-pointer"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>
                          {hasVoted === "ADIDAS"
                            ? "VOTED ADIDAS ✓"
                            : !currentUser
                            ? "LOG IN TO VOTE ADIDAS"
                            : !hasJoined
                            ? "JOIN TO VOTE ADIDAS"
                            : "VOTE ADIDAS"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {userXpGained && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-between">
                      <span>🎉 Vote registered in database! +50 XP added to your account.</span>
                      <span className="text-[10px] text-amber-600 font-black uppercase">
                        Round {roundState.currentRound}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: TRENDING ROASTERS & RECENT ACTIVITY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: TRENDING ROASTERS */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                        <span>TRENDING ROASTERS</span>
                      </div>
                      <Link
                        href="/leaderboard"
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="space-y-2 text-xs">
                      {trendingRoasters.length === 0 ? (
                        <div className="py-4 text-center text-slate-400 text-xs">
                          Loading arena roasters...
                        </div>
                      ) : (
                        trendingRoasters.map((r, idx) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-sm font-black text-amber-500 shrink-0">
                                {idx === 0 ? "👑 1" : idx === 1 ? "🥈 2" : "🥉 3"}
                              </span>
                              <img
                                src={r.avatar}
                                alt={r.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                              />
                              <div className="text-left min-w-0">
                                <span className="font-extrabold text-slate-900 block truncate max-w-[120px]">
                                  {r.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold block truncate">
                                  {r.username}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono font-black text-red-600 shrink-0">
                              {r.points.toLocaleString()} XP
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Card 2: RECENT ACTIVITY */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>RECENT ACTIVITY</span>
                      </div>
                      <Link
                        href="/activity"
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Activity 1 */}
                      <div className="flex items-center justify-between p-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                          </div>
                          <span className="font-bold text-slate-800 text-[11px] truncate max-w-[150px] sm:max-w-[180px]">
                            You voted in Nike vs Adidas - Round {roundState.currentRound}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                          <span className="text-emerald-600 font-black">+50 XP</span>
                          <span className="text-slate-400">2m ago</span>
                        </div>
                      </div>

                      {/* Activity 2 */}
                      <div className="flex items-center justify-between p-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                            <Heart className="w-3.5 h-3.5 fill-current" />
                          </div>
                          <span className="font-bold text-slate-800 text-[11px] truncate max-w-[150px] sm:max-w-[180px]">
                            Your comment got 12 upvotes
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                          <span className="text-emerald-600 font-black">+20 XP</span>
                          <span className="text-slate-400">5m ago</span>
                        </div>
                      </div>

                      {/* Activity 3 */}
                      <div className="flex items-center justify-between p-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                            <Award className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-slate-800 text-[11px] truncate max-w-[150px] sm:max-w-[180px]">
                            You unlocked &apos;Top Voter&apos; badge
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                          <span className="text-emerald-600 font-black">+100 XP</span>
                          <span className="text-slate-400">15m ago</span>
                        </div>
                      </div>

                      {/* Activity 4 */}
                      <div className="flex items-center justify-between p-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
                            <Share2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-slate-800 text-[11px] truncate max-w-[150px] sm:max-w-[180px]">
                            You shared Adidas vs Nike battle
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                          <span className="text-emerald-600 font-black">+20 XP</span>
                          <span className="text-slate-400">20m ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: PREVIOUS BATTLES (ARCHIVE) */}
            {viewTab === "previous-battles" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                      Previous Battles & Duel Archive
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Relive completed clash rounds, final voting ratios, and certified winners.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {previousBattles.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-400 text-xs font-bold">
                      No archived battles available yet.
                    </div>
                  ) : (
                    previousBattles.map((battle) => (
                      <div
                        key={battle.id}
                        className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px]">
                            {battle.round}
                          </span>
                          <div className="flex items-center gap-2 font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                            <Trophy className="w-3.5 h-3.5 fill-amber-500" />
                            <span>CHAMPION: {battle.winnerBrand?.name || battle.brandA.name}</span>
                          </div>
                          <span className="text-slate-400 font-medium text-[11px]">
                            Completed
                          </span>
                        </div>

                        {/* Brand Comparison Row */}
                        <div className="grid grid-cols-11 gap-2 items-center text-center">
                          <div className="col-span-5 space-y-1">
                            <div className="text-lg sm:text-xl font-black text-slate-950">
                              {battle.brandA.name}
                            </div>
                            <div className="text-2xl font-black text-red-600 font-mono">
                              {battle.percentA}%
                            </div>
                            <div className="text-[11px] text-slate-400 font-semibold">
                              {battle.votesCountA.toLocaleString()} votes
                            </div>
                          </div>

                          <div className="col-span-1 flex items-center justify-center font-black italic text-slate-400 text-xs">
                            VS
                          </div>

                          <div className="col-span-5 space-y-1">
                            <div className="text-lg sm:text-xl font-black text-slate-950">
                              {battle.brandB.name}
                            </div>
                            <div className="text-2xl font-black text-blue-600 font-mono">
                              {battle.percentB}%
                            </div>
                            <div className="text-[11px] text-slate-400 font-semibold">
                              {battle.votesCountB.toLocaleString()} votes
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            className="bg-red-600 h-full"
                            style={{ width: `${battle.percentA}%` }}
                          />
                          <div
                            className="bg-blue-600 h-full"
                            style={{ width: `${battle.percentB}%` }}
                          />
                        </div>

                        {/* Reward/Perk Quote */}
                        {battle.perkTitle && (
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs text-slate-700 flex items-center justify-between gap-4">
                            <span>🎁 Reward: {battle.perkTitle} (Code: <strong>{battle.perkCode}</strong>)</span>
                            <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0">
                              {battle.totalVotes.toLocaleString()} total votes
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ENDING SOON */}
            {viewTab === "ending-soon" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                    Battles Ending Soon
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Final countdown hours! Place your vote before time runs out.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {endingSoonBattles.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-400 text-xs font-bold">
                      No other live battles ending soon.
                    </div>
                  ) : (
                    endingSoonBattles.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-black">
                            {b.round}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono text-base font-black text-red-600">
                            <Clock className="w-4 h-4" />
                            <span>{b.timeRemaining}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-xl font-black text-slate-950">
                              {b.brandA.name} vs {b.brandB.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {b.totalVotes.toLocaleString()} votes recorded
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setViewTab("live-arena")}
                            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase shadow-md shadow-red-600/30 cursor-pointer transition-all active:scale-95"
                          >
                            VOTE NOW
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: ALL BATTLES DIRECTORY */}
            {viewTab === "all-battles" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                      All Arena Battles
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Browse all live, scheduled, and past battles across all industries.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dbBattles
                    .filter((b) =>
                      searchQuery
                        ? b.brandA.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.brandB.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.title.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span
                            className={`px-2.5 py-0.5 rounded-full ${
                              item.status === "LIVE"
                                ? "bg-red-50 text-red-600 font-black"
                                : item.status === "UPCOMING"
                                ? "bg-amber-50 text-amber-700 font-black"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.statusBadge}
                          </span>
                          <span className="text-slate-400 font-mono">{item.timeRemaining}</span>
                        </div>

                        <div className="text-lg font-black text-slate-900">
                          {item.brandA.name} <span className="text-slate-400 font-normal">vs</span> {item.brandB.name}
                        </div>

                        <div className="text-xs text-slate-500 font-medium">
                          {item.round} • {item.totalVotes.toLocaleString()} votes
                        </div>

                        <button
                          type="button"
                          onClick={() => setViewTab("live-arena")}
                          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white font-black text-xs text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-98"
                        >
                          ENTER BATTLE 🥊
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </main>

          {/* Right Column: LIVE COMMENTS STREAM (3 cols) WITH USER SELECTED PIC */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4 sticky top-24">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span>LIVE COMMENTS</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{watchingCount.toLocaleString()} online</span>
                </div>
              </div>

              {/* Comments Feed List from Database */}
              <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-2.5 text-xs group"
                  >
                    {/* User's Selected Picture */}
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-[11px]">
                          {comment.author}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {comment.time}
                        </span>
                      </div>

                      <p className="text-slate-700 font-medium text-[11px] mt-0.5 leading-snug break-words">
                        {comment.text}
                      </p>
                    </div>

                    {/* Upvote Button */}
                    <button
                      type="button"
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1 text-[10px] font-bold shrink-0 pt-0.5 transition-colors cursor-pointer ${
                        comment.hasLiked
                          ? "text-red-600 font-black"
                          : "text-slate-400 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          comment.hasLiked ? "fill-red-600 text-red-600" : ""
                        }`}
                      />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>

              {/* Interactive Comment Input */}
              {!currentUser ? (
                <div className="pt-2 border-t border-slate-100 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-700">
                    Want to drop a roast in the live chat?
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href="/login?redirect=/battles"
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase shadow-xs transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup?redirect=/battles"
                      className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs uppercase hover:bg-slate-100 transition-all"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100">
                  <form
                    onSubmit={handleSendRoast}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2 focus-within:border-red-500/50 focus-within:bg-white transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-slate-300 shadow-2xs"
                      />
                      <textarea
                        value={roastInput}
                        onChange={(e) => setRoastInput(e.target.value.slice(0, 200))}
                        placeholder="Write your roast..."
                        rows={2}
                        className="w-full bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendRoast();
                          }
                        }}
                      />
                    </div>

                    {/* Formatting buttons, char counter & Send */}
                    <div className="flex items-center justify-between pt-1 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => addEmoji("🔥")}
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Add fire"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => addEmoji("👑")}
                          className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-200/70 text-slate-600 hover:bg-slate-300 cursor-pointer"
                          title="Add GIF"
                        >
                          GIF
                        </button>
                        <button
                          type="button"
                          onClick={() => addEmoji("😎")}
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Add emoji"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono font-medium text-slate-400">
                          {roastInput.length}/200
                        </span>

                        <button
                          type="submit"
                          disabled={!roastInput.trim() || isPostingComment}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            roastInput.trim()
                              ? "bg-red-600 text-white shadow-md shadow-red-600/30 hover:scale-105 active:scale-95"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
