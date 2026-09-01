"use client";

import { useState, useEffect } from "react";
import { Flame, Building2, Bell, User, Plus, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ClaimBrandModal } from "./ClaimBrandModal";
import { NotificationsModal } from "./NotificationsModal";
import { UserAuthModal } from "./UserAuthModal";
import { performClientLogout } from "@/lib/logout";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [activeUser, setActiveUser] = useState<{
    name: string;
    avatar: string;
    points: number;
  } | null>(null);

  const syncUserSession = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("coroast_voter_session");
        if (stored) {
          setActiveUser(JSON.parse(stored));
        } else {
          setActiveUser(null);
        }
      } catch {
        setActiveUser(null);
      }
    }
  };

  useEffect(() => {
    // Initial sync from localStorage
    const timer = setTimeout(() => {
      syncUserSession();
    }, 0);

    // Fetch from backend API session cookie
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          const userObj = {
            name: data.user.name || data.user.username,
            avatar: data.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username}`,
            points: data.user.points,
          };
          setActiveUser(userObj);
          localStorage.setItem("coroast_voter_session", JSON.stringify(userObj));
        }
      })
      .catch((err) => console.error("Error fetching me session:", err));

    const handleStorageChange = () => syncUserSession();
    window.addEventListener("storage", handleStorageChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    await performClientLogout();
    setActiveUser(null);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Live Battles", href: "/battles" },
    { label: "Merchandise", href: "/merchandise" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Perks", href: "/perks" },
    { label: "How It Works", href: "/#how-it-works" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo - ROAST ARENA */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/logo.png"
              alt="ROAST ARENA"
              width={160}
              height={44}
              className="h-11 w-auto object-contain group-hover:scale-105 transition-transform"
            ></img>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-bold transition-all ${
                    isActive
                      ? "text-red-600 border-b-2 border-red-600 pb-1 font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {activeUser ? (
              /* LOGGED IN VOTER USER STATE */
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-extrabold text-slate-900 hover:bg-slate-200 transition-colors"
                >
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{activeUser.points.toLocaleString()}</span>
                </Link>

                <button
                  onClick={() => setIsNotifOpen(true)}
                  className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors relative cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 animate-pulse" />
                </button>

                <Link href="/profile" className="shrink-0" title={`Logged in as ${activeUser.name}`}>
                  <Image
                    src={activeUser.avatar}
                    alt={activeUser.name}
                    width={32}
                    height={32}
                    unoptimized
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover hover:border-slate-400 transition-colors"
                  />
                </Link>

                <Link
                  href="/settings"
                  title="Account Settings"
                  className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out of your account"
                  className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* LOGGED OUT GUEST USER STATE */
              <>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sign In / Join</span>
                </button>
              </>
            )}

            {/* Brand Portal Link */}
            <Link
              href="/business/login"
              className="hidden sm:inline-flex text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Brand Portal</span>
            </Link>

            {/* Add Brand Wizard Link */}
            <Link
              href="/brand/add"
              className="text-xs font-extrabold px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white hover:opacity-90 transition-all shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Add Brand</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Claim Brand Modal */}
      <ClaimBrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Notifications Drawer */}
      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      {/* Guest Voter Auth Modal */}
      <UserAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setActiveUser(user);
          router.push("/battles");
        }}
      />
    </>
  );
}
