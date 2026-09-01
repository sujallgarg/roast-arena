"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Swords,
  CheckSquare,
  Trophy,
  Award,
  Shield,
  Mic,
  MessageSquare,
  Vote,
  ArrowRight,
  Play,
} from "lucide-react";
import { UserAuthModal } from "@/components/UserAuthModal";
import { ArenaNavbar } from "@/components/ArenaNavbar";

export default function LandingPage() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<{
    name: string;
    avatar: string;
    points: number;
  } | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem("coroast_voter_session");
        if (stored) {
          setActiveUser(JSON.parse(stored));
        }
      } catch {
        setActiveUser(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-red-500 selection:text-white flex flex-col">
      {/* 1. TOP FIXED NAVBAR */}
      <ArenaNavbar activeTab="Home" />

      {/* MAIN BODY */}
      <main className="flex-1 pt-18">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Headlines & Call to Actions */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] uppercase">
                  <span className="block text-slate-950">BRANDS ROAST.</span>
                  <span className="block text-red-600 italic">YOU DECIDE.</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
                  The ultimate arena where brands battle it out with savage roasts and epic
                  comebacks. Vote, earn XP, unlock perks & climb the leaderboard.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/battles"
                    className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-red-600/30 flex items-center gap-2.5 transition-all active:scale-95"
                  >
                    <span>ENTER THE ARENA</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="px-6 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all active:scale-95 shadow-xs"
                  >
                    <span>WATCH TRAILER</span>
                    <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 fill-slate-700 text-slate-700 ml-0.5" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Right Column: Hero Visual - Boxing Gloves Clash */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-950 group">
                  <img
                    src="/hero-clash.jpg"
                    alt="Brands Roast Duel Arena Clash"
                    className="w-full h-auto object-cover transform group-hover:scale-103 transition-transform duration-700"
                  />

                  {/* Dynamic Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Interactive floating match badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        NIKE <span className="text-red-500">VS</span> ADIDAS
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                      Round 2 Live • 29.6K Votes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FEATURE HIGHLIGHTS PILL BAR */}
            <div className="mt-14 lg:mt-20">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
                  {/* Feature 1 */}
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                      <Swords className="w-6 h-6" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Brand vs Brand
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Top brands battle in epic 1v1 showdowns.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Flame className="w-6 h-6" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Roast & Comeback
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Savagest roasts. Epic comebacks.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CheckSquare className="w-6 h-6" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      You Decide
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Vote for your favorite roasts & comebacks.
                    </p>
                  </div>

                  {/* Feature 4 */}
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Win Perks
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Winning brands unlock amazing perks.
                    </p>
                  </div>

                  {/* Feature 5 */}
                  <div className="text-center space-y-2 col-span-2 sm:col-span-1">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Earn XP
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Vote, comment, share & climb the leaderboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center mb-12 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  HOW IT WORKS
                </h2>
                <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-1">
                  5 simple steps to arena glory
                </p>
              </div>

              {/* 5 Steps Grid with Connecting Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
                {/* Step 1 */}
                <div className="text-center space-y-3 relative group">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-300 group-hover:border-red-500/50 transition-colors">
                      <Shield className="w-7 h-7 text-slate-200" />
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                      1
                    </span>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Brands Enter
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Brands join the arena & get matched.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center space-y-3 relative group">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-300 group-hover:border-red-500/50 transition-colors">
                      <Mic className="w-7 h-7 text-slate-200" />
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                      2
                    </span>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Roast Round
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    They throw savage roasts at each other.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center space-y-3 relative group">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-300 group-hover:border-red-500/50 transition-colors">
                      <MessageSquare className="w-7 h-7 text-slate-200" />
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                      3
                    </span>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Comeback Round
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    They hit back with epic comebacks.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="text-center space-y-3 relative group">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-300 group-hover:border-red-500/50 transition-colors">
                      <Vote className="w-7 h-7 text-slate-200" />
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                      4
                    </span>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    You Vote
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    You decide who won the round.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="text-center space-y-3 relative group">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400 group-hover:border-amber-500/50 transition-colors">
                      <Trophy className="w-7 h-7 text-amber-400" />
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      5
                    </span>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Winner
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    The brand with more votes wins the battle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FOR BRANDS SECTION */}
        <section id="for-brands" className="py-12 lg:py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Brand Copy & Stats */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider">
                    FOR BRANDS
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 uppercase leading-tight">
                    Turn Rivalry Into Real Engagement
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Reach a massive audience, increase brand awareness & drive real
                    engagement through battles.
                  </p>
                  <div>
                    <Link
                      href="/brand/add"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
                    >
                      <span>BRAND PARTNERSHIP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* 4 Stats Grid */}
                <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-200">
                  <div>
                    <div className="text-3xl font-black text-red-600 tracking-tight">
                      1.2M+
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
                      Total Votes
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                      500K+
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
                      Active Users
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                      300+
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
                      Brands Battled
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-red-600 tracking-tight">
                      95%
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
                      Engagement Rate
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dashboard Preview Card */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-6 text-white space-y-4">
                  {/* Dashboard Header Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-slate-400 ml-2">
                        ROAST ARENA • Brand Command Center
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-800 px-2 py-0.5 rounded text-emerald-400">
                      LIVE ANALYTICS
                    </span>
                  </div>

                  {/* Dashboard Content Mockup */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Live Brand Roasts
                      </div>
                      <div className="text-xl font-black text-white mt-1">42 Battles</div>
                      <div className="text-[9px] text-emerald-400 mt-0.5 font-bold">
                        +18% this week
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Audience Heckles
                      </div>
                      <div className="text-xl font-black text-white mt-1">128,490</div>
                      <div className="text-[9px] text-emerald-400 mt-0.5 font-bold">
                        98.4% savage rate
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Voter Conversion
                      </div>
                      <div className="text-xl font-black text-red-500 mt-1">74.2%</div>
                      <div className="text-[9px] text-amber-400 mt-0.5 font-bold">
                        Perk claimed rate
                      </div>
                    </div>
                  </div>

                  {/* Active Match Graphic in Dashboard */}
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-300 uppercase tracking-wider">
                        Active Showdown: Nike vs Adidas
                      </span>
                      <span className="text-red-500 font-bold">62% Winning</span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
                      <div className="bg-red-600 h-full w-[62%]" />
                      <div className="bg-blue-600 h-full w-[38%]" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Nike • 18,392 Votes (62%)</span>
                      <span>Adidas • 11,248 Votes (38%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. LANDING FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight">
              ROAST ARENA
            </span>
            <span className="text-slate-400">— Where Rival Brands Roast & Users Pick the Winner</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-950 transition-colors">
              How It Works
            </a>
            <Link href="/battles" className="hover:text-slate-950 transition-colors">
              Live Battles
            </Link>
            <Link href="/leaderboard" className="hover:text-slate-950 transition-colors">
              Leaderboard
            </Link>
            <Link href="/perks" className="hover:text-slate-950 transition-colors">
              Perks
            </Link>
            <a href="#for-brands" className="hover:text-slate-950 transition-colors">
              For Brands
            </a>
          </div>
        </div>
      </footer>

      {/* Video Trailer Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-red-500 flex items-center gap-2">
                <Flame className="w-4 h-4 fill-red-500" />
                Roast Arena Official Trailer
              </h3>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-xs bg-slate-800 px-3 py-1.5 rounded-lg"
              >
                Close ✕
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-800">
              <img
                src="/hero-clash.jpg"
                alt="Trailer Preview"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50 animate-pulse">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  Experience the Clash
                </span>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/battles"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30"
              >
                <span>Enter The Arena Now →</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal if triggered */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => router.push("/battles")}
      />
    </div>
  );
}
