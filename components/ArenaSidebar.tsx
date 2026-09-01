"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { performClientLogout } from "@/lib/logout";
import {
  Zap,
  Swords,
  Trophy,
  Gift,
  ShoppingBag,
  Clock,
  User,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

export function ArenaSidebar({
  activeItem,
}: {
  activeItem?:
    | "Home"
    | "Live Battles"
    | "Merchandise"
    | "Leaderboard"
    | "Perks"
    | "XP Store"
    | "Activity"
    | "Profile"
    | "Notifications"
    | "Settings";
}) {
  const pathname = usePathname();
  const router = useRouter();

  const computedActive =
    activeItem ||
    (pathname.startsWith("/merchandise")
      ? "Merchandise"
      : pathname.startsWith("/battle") || pathname.startsWith("/live-battle")
      ? "Live Battles"
      : pathname.startsWith("/leaderboard")
      ? "Leaderboard"
      : pathname.startsWith("/perk")
      ? "Perks"
      : pathname.startsWith("/activity")
      ? "Activity"
      : pathname.startsWith("/notification")
      ? "Notifications"
      : pathname.startsWith("/settings")
      ? "Settings"
      : pathname.startsWith("/profile")
      ? "Profile"
      : "Live Battles");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = () => {
      const stored =
        localStorage.getItem("coroast_voter_session") ||
        localStorage.getItem("coroast_user");
      if (stored) {
        setIsLoggedIn(true);
      }
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => setIsLoggedIn(!!d?.user))
        .catch(() => {
          if (!stored) setIsLoggedIn(false);
        });
    };
    check();
    window.addEventListener("storage", check);
    window.addEventListener("arena_login", check);
    window.addEventListener("arena_logout", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("arena_login", check);
      window.removeEventListener("arena_logout", check);
    };
  }, []);

  const sidebarLinks = [
    { label: "Live Battles", icon: Zap, href: "/battles" },
    { label: "Merchandise", icon: ShoppingBag, href: "/merchandise" },
    { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
    { label: "Perks", icon: Gift, href: "/perks" },
    { label: "Activity", icon: Clock, href: isLoggedIn ? "/activity" : "/login" },
    { label: "Profile", icon: User, href: isLoggedIn ? "/profile" : "/login" },
    { label: "Notifications", icon: Bell, href: isLoggedIn ? "/notifications" : "/login", badge: isLoggedIn ? "3" : undefined },
  ];

  const handleLogout = async () => {
    await performClientLogout();
    router.push("/login");
  };

  const isSettingsActive = computedActive === "Settings";

  return (
    <aside className="w-full flex flex-col justify-between self-start sticky top-24 space-y-6 bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs min-h-[calc(100vh-8rem)]">
      {/* Top Section */}
      <div className="space-y-3">
        {/* Navigation Links */}
        <div className="space-y-1">
          {sidebarLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              computedActive === item.label ||
              (computedActive === "Live Battles" && item.label === "Live Battles") ||
              (computedActive === "Merchandise" && item.label === "Merchandise") ||
              (computedActive === "Perks" && item.label === "Perks") ||
              (computedActive === "XP Store" && item.label === "Perks");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? "bg-red-50 text-red-600 font-extrabold shadow-xs"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-red-600" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions: Settings & Logout (ONLY SHOWN AFTER LOGIN) */}
      <div className="border-t border-slate-100 pt-3 space-y-1">
        {isLoggedIn ? (
          <>
            <Link
              href="/settings"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                isSettingsActive
                  ? "bg-red-50 text-red-600 font-extrabold shadow-xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
              }`}
            >
              <Settings
                className={`w-4 h-4 shrink-0 ${
                  isSettingsActive ? "text-red-600" : "text-slate-400"
                }`}
              />
              <span>Settings</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-400 shrink-0" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="p-1 space-y-1.5">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-xs transition-all text-center"
            >
              <span>Log In</span>
            </Link>
            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all text-center"
            >
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
