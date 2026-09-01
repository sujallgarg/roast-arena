"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Flame, Bell, ChevronDown, Settings, LogOut } from "lucide-react";
import { performClientLogout } from "@/lib/logout";
import { calculateLevelInfo } from "@/lib/level-service";

export function ArenaNavbar({
  activeTab,
}: {
  activeTab?: "Home" | "How It Works" | "Live Battles" | "Merchandise" | "Perks" | "Leaderboard" | "For Brands" | "Profile" | "Notifications";
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [activeUser, setActiveUser] = useState<{
    name: string;
    avatar: string;
    points: number;
    level?: string;
  } | null>(null);

  useEffect(() => {
    const syncUser = () => {
      try {
        const stored = localStorage.getItem("coroast_voter_session");
        const userObj = localStorage.getItem("coroast_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name) {
            const levelInfo = calculateLevelInfo(parsed.points ?? 0);
            setActiveUser({
              name: parsed.name,
              avatar:
                parsed.avatar ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=voter",
              points: parsed.points ?? 0,
              level: `Level ${levelInfo.currentLevel} • ${levelInfo.currentTitle}`,
            });
            return;
          }
        }
        if (userObj) {
          const parsedUser = JSON.parse(userObj);
          if (parsedUser?.username) {
            const levelInfo = calculateLevelInfo(parsedUser.points ?? 0);
            setActiveUser({
              name: parsedUser.name || parsedUser.username,
              avatar:
                parsedUser.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${parsedUser.username}`,
              points: parsedUser.points ?? 0,
              level: `Level ${levelInfo.currentLevel} • ${levelInfo.currentTitle}`,
            });
            return;
          }
        }
        setActiveUser(null);
      } catch {
        setActiveUser(null);
      }
    };

    const timer = setTimeout(syncUser, 0);

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setActiveUser({
            name: data.user.name || data.user.username,
            avatar:
              data.user.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username}`,
            points: data.user.points ?? 0,
            level: data.user.level || "Arena Rookie",
          });
        } else {
          const stored = localStorage.getItem("coroast_voter_session");
          const userObj = localStorage.getItem("coroast_user");
          if (!stored && !userObj) {
            setActiveUser(null);
          }
        }
      })
      .catch(() => {});

    window.addEventListener("storage", syncUser);
    window.addEventListener("arena_logout", syncUser);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("arena_logout", syncUser);
    };
  }, []);

  const handleLogout = async () => {
    await performClientLogout();
    setActiveUser(null);
    router.push("/login");
  };

  const computedActive =
    activeTab ||
    (pathname === "/"
      ? "Home"
      : pathname.startsWith("/merchandise")
      ? "Merchandise"
      : pathname.startsWith("/battle") || pathname.startsWith("/live-battle")
      ? "Live Battles"
      : pathname.startsWith("/perk")
      ? "Perks"
      : pathname.startsWith("/leaderboard")
      ? "Leaderboard"
      : "");

  const navItems = [
    { label: "Home", href: "/" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Live Battles", href: "/battles" },
    { label: "Merchandise", href: "/merchandise" },
    { label: "Perks", href: "/perks" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "For Brands", href: "/#for-brands" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 h-18 flex items-center justify-between gap-4 shadow-xs">
      {/* Brand Logo - Fixed Left */}
      <Link href="/" className="flex items-center gap-2 group shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
          <Flame className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="font-black text-2xl tracking-tighter uppercase text-slate-950 italic">
          ROAST <span className="text-red-600">ARENA</span>
        </span>
      </Link>

      {/* Center Navigation Links - Always Center Direction Across All Pages */}
      <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
        {navItems.map((item) => {
          const isActive = computedActive === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`transition-colors relative py-1 ${
                isActive
                  ? "text-red-600 font-black border-b-2 border-red-600"
                  : "hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right User Bar - Fixed Right Direction Across All Pages */}
      <div className="flex items-center gap-3.5 shrink-0">
        {activeUser ? (
          <>
            {/* XP Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-black text-amber-700 shadow-2xs">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{activeUser.points.toLocaleString()} XP</span>
            </div>

            {/* Notification Bell Connected to Sidebar Notifications */}
            <Link
              href="/notifications"
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative cursor-pointer transition-all hover:scale-105"
              title="View Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center shadow-2xs">
                3
              </span>
            </Link>

            {/* User Profile Chip */}
            <Link
              href="/profile"
              className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="font-extrabold text-slate-900 flex items-center gap-1">
                  <span>{activeUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {activeUser.level || "Level 12"}
                </span>
              </div>
            </Link>

            {/* Settings Link (shown only after login) */}
            <Link
              href="/settings"
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative cursor-pointer transition-all hover:scale-105"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Logout Button (shown only after login) */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 relative cursor-pointer transition-all hover:scale-105"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
