"use client";

import { usePathname } from "next/navigation";
import { ArenaNavbar } from "./ArenaNavbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The dashboard pages (Home, Battles, Perks, Leaderboard, Profile, Activity, Settings) control their dedicated sidebar layouts
  if (
    pathname === "/" ||
    pathname === "/battles" ||
    pathname === "/live-battles" ||
    pathname === "/merchandise" ||
    pathname === "/perks" ||
    pathname === "/leaderboard" ||
    pathname === "/profile" ||
    pathname === "/activity" ||
    pathname === "/settings" ||
    pathname === "/notifications" ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return <>{children}</>;
  }

  // Standard wrapper for other pages (/battles, /leaderboard, /perks, etc.)
  return (
    <div className="min-h-screen flex flex-col bg-stadium-grid relative">
      {/* Universal Fixed ArenaNavbar */}
      <ArenaNavbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {children}
      </main>

      {/* White Modern Footer */}
      <footer className="border-t border-slate-200 bg-white/90 backdrop-blur-md py-8 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="VS ROAST ARENA"
              className="h-7 w-auto object-contain"
            />
            <span className="font-extrabold text-slate-900 tracking-wider">ROAST ARENA ENGINE</span>
            <span className="text-slate-500">— 1v1 Brand Roast Duel Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span className="hover:text-slate-900 cursor-pointer transition-colors font-medium">Arena Rules</span>
            <span>•</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors font-medium">Brand Verification</span>
            <span>•</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors font-medium">Leaderboard API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
