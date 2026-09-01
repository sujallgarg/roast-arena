"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Swords,
  MessageSquare,
  Trophy,
  Zap,
  CheckCircle2,
  Bell,
  Target,
  Sparkles,
} from "lucide-react";
import { ArenaNavbar } from "@/components/ArenaNavbar";
import { ArenaSidebar } from "@/components/ArenaSidebar";

interface DBNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Fetch real notifications from PostgreSQL API
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/notifications");
      if (res.status === 401) {
        setIsLoggedIn(false);
        setNotifications([]);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsLoggedIn(true);
          setNotifications(data.notifications || []);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const markItemAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  // Map notification type to category and icon
  const getNotificationVisuals = (type: string) => {
    switch (type.toUpperCase()) {
      case "BATTLE":
        return {
          category: "Battles",
          icon: <Swords className="w-4 h-4 text-red-600" />,
          bg: "bg-red-50 border-red-200",
        };
      case "COMMENT":
        return {
          category: "Comments",
          icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
          bg: "bg-purple-50 border-purple-200",
        };
      case "BADGE":
        return {
          category: "Rewards",
          icon: <Trophy className="w-4 h-4 text-amber-600 fill-amber-500" />,
          bg: "bg-amber-50 border-amber-200",
        };
      case "XP":
      case "LEVEL_UP":
        return {
          category: "Rewards",
          icon: <Zap className="w-4 h-4 text-emerald-600" />,
          bg: "bg-emerald-50 border-emerald-200",
        };
      case "QUEST":
        return {
          category: "Rewards",
          icon: <Target className="w-4 h-4 text-blue-600" />,
          bg: "bg-blue-50 border-blue-200",
        };
      default:
        return {
          category: "System",
          icon: <Sparkles className="w-4 h-4 text-slate-600" />,
          bg: "bg-slate-100 border-slate-200",
        };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Math.max(0, Date.now() - new Date(dateString).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    const { category } = getNotificationVisuals(n.type);
    return category === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Universal Fixed Navbar */}
      <ArenaNavbar activeTab="Notifications" />

      {/* Main Container With Sidebar */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side Navbar */}
          <div className="lg:col-span-2 hidden lg:block">
            <ArenaSidebar activeItem="Notifications" />
          </div>

          {/* Main Content Stream */}
          <main className="lg:col-span-10 space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
                  <Bell className="w-4 h-4" />
                  <span>COMMUNITY NOTIFICATIONS</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  Arena Alerts & Rewards
                </h1>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All As Read</span>
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {["All", "Battles", "Comments", "Rewards", "System"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    activeFilter === cat
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Notifications Feed */}
            {loading ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">
                  Loading real-time notifications...
                </p>
              </div>
            ) : !isLoggedIn ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-14 shadow-xs text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200/70 flex items-center justify-center text-red-600 shadow-2xs mx-auto">
                  <Bell className="w-10 h-10" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950">
                    Login to See Notifications
                  </h2>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    You must be logged in to view your battle updates, roast upvotes, badge awards, and reward alerts.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30 cursor-pointer active:scale-95"
                  >
                    <span>Log In to Account</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <span>Create Free Account</span>
                  </Link>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
                <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-extrabold text-slate-700">
                  No notifications in {activeFilter}
                </p>
                <p className="text-xs text-slate-400">
                  You are completely caught up with all arena alerts.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
                {filtered.map((item) => {
                  const { icon, bg } = getNotificationVisuals(item.type);
                  return (
                    <div
                      key={item.id}
                      onClick={() => markItemAsRead(item.id)}
                      className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer hover:bg-slate-50/80 ${
                        !item.read ? "bg-red-50/20" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${bg}`}
                        >
                          {icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                              {item.title}
                            </span>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {item.message}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-[11px] text-slate-400 font-bold font-mono">
                        {getTimeAgo(item.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
