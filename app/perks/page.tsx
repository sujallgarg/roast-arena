"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Gift,
  Copy,
  Check,
  X,
  ChevronDown,
  ArrowRight,
  Settings,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ArenaNavbar } from "@/components/ArenaNavbar";
import { ArenaSidebar } from "@/components/ArenaSidebar";

interface PerkItem {
  id: string;
  brand: string;
  brandColor: string;
  discount: string;
  condition: string;
  xpCost: number;
  image: string;
  category: "food" | "shopping" | "entertainment" | "travel" | "tech";
  code: string;
}

export default function PerksPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedPerk, setSelectedPerk] = useState<PerkItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [userXp, setUserXp] = useState(2540);
  const [unlockedPerks, setUnlockedPerks] = useState<Record<string, boolean>>({});

  // Dynamic perks list loaded from API (initially 0 perks)
  const [perksList, setPerksList] = useState<PerkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active perks from PostgreSQL
  const fetchPerks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/perks");
      if (res.ok) {
        const data = await res.json();
        if (data?.perks) {
          setPerksList(data.perks);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerks();
  }, []);

  const handleUnlock = (perk: PerkItem) => {
    const hasSession =
      localStorage.getItem("coroast_voter_session") ||
      localStorage.getItem("coroast_user");
    if (
      !hasSession &&
      typeof document !== "undefined" &&
      !document.cookie.includes("user_session")
    ) {
      router.push("/login?redirect=/perks");
      return;
    }

    setSelectedPerk(perk);
    if (!unlockedPerks[perk.id]) {
      setUnlockedPerks((prev) => ({ ...prev, [perk.id]: true }));
      setUserXp((prev) => Math.max(0, prev - perk.xpCost));
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      try {
        fetch(`/api/perks/${perk.id}/claim`, { method: "POST" })
          .then((r) => r.json())
          .then((data) => {
            if (data?.claimedCount) {
              setPerksList((prev) =>
                prev.map((p) =>
                  p.id === perk.id ? { ...p, claimedCount: data.claimedCount } : p
                )
              );
            }
          })
          .catch(() => {});
      } catch {}
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText?.(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPerks = perksList.filter((p) => {
    if (activeCategory === "ALL") return true;
    return p.category === activeCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* 1. TOP UNIFIED NAVBAR */}
      <ArenaNavbar activeTab="Perks" />

      {/* MAIN CONTAINER WITH SIDEBAR */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side Navbar */}
          <div className="lg:col-span-2 hidden lg:block">
            <ArenaSidebar activeItem="Perks" />
          </div>

          {/* Main Perks Content */}
          <main className="lg:col-span-10 space-y-8">
        {/* 2. PAGE HEADER & USER XP CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Left Title & Subtitle */}
          <div className="lg:col-span-8 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-600">
              <Flame className="w-4 h-4 fill-red-600" />
              <span>PERKS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
              Vote. Earn XP. Unlock epic perks.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              The more you engage, the better the rewards.
            </p>
          </div>

          {/* Right: User XP Card */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400">
              <span>YOUR XP</span>
              <span className="text-slate-900 font-bold">Level 12</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-black text-slate-900">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                  ❄
                </span>
                <span>{userXp.toLocaleString()} XP</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                {userXp.toLocaleString()} / 5,000 XP
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (userXp / 5000) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. CATEGORY PILLS BAR */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === "ALL"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Perks
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("food")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === "food"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            🍽️ Food & Dining
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("shopping")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === "shopping"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Shopping
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("entertainment")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === "entertainment"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            🍿 Entertainment
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("travel")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === "travel"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            ✈️ Travel
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("tech")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === "tech"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            💻 Tech
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <span>More</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* 4. PERKS DISPLAY OR EMPTY STATE */}
        {filteredPerks.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-14 shadow-xs text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200/70 flex items-center justify-center text-red-600 shadow-2xs mx-auto">
              <Gift className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950">
                Perks Currently Not Available
              </h2>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                There are currently no active perks or discount vouchers available. New brand rewards and exclusive battle drops will be announced soon.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/battles"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30 cursor-pointer active:scale-95"
              >
                <span>Back to Battles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPerks.map((perk) => {
              const isUnlocked = unlockedPerks[perk.id];

              return (
                <div
                  key={perk.id}
                  className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Upper Half: Banner & Visual */}
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                    <img
                      src={perk.image}
                      alt={perk.brand}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40" />

                    {/* Brand Pill in Upper Corner */}
                    <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white font-black text-xs tracking-wider uppercase">
                      {perk.brand}
                    </div>

                    {/* Offer Headline over Image */}
                    <div className="absolute bottom-3.5 left-3.5 text-white">
                      <div className="text-xl font-black uppercase tracking-tight">
                        {perk.discount}
                      </div>
                      <div className="text-xs font-medium text-slate-300">
                        {perk.condition}
                      </div>
                    </div>
                  </div>

                  {/* Lower Half: XP Cost & Action Button */}
                  <div className="p-4 space-y-3 bg-white">
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600">
                      <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px]">
                        ❄
                      </span>
                      <span>XP {perk.xpCost.toLocaleString()}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnlock(perk)}
                      className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5 ${
                        isUnlocked
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-900"
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>UNLOCKED ✓</span>
                        </>
                      ) : (
                        <span>UNLOCK PERK</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. "HOW TO UNLOCK PERKS" SECTION */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
            HOW TO UNLOCK PERKS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-red-200 text-red-600 font-black text-base flex items-center justify-center mx-auto bg-red-50">
                1
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">
                Vote in battles
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Earn XP for every vote and action.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-red-200 text-red-600 font-black text-base flex items-center justify-center mx-auto bg-red-50">
                2
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">
                Climb levels
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                The more XP you earn, the higher you level up.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-red-200 text-red-600 font-black text-base flex items-center justify-center mx-auto bg-red-50">
                3
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">
                Unlock perks
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Redeem exclusive perks from top brands.
              </p>
            </div>
          </div>
        </div>

        {/* 6. BOTTOM BANNER */}
        <div className="rounded-3xl bg-slate-50 border border-slate-200/80 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs relative overflow-hidden">
          <div className="space-y-3 max-w-lg z-10 text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              More battles. More perks. More rewards!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Stay active, climb the leaderboard and unlock the best perks from top brands.
            </p>
            <div className="pt-2">
              <Link
                href="/battles"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 active:scale-95 transition-all"
              >
                <span>Start Earning Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Golden Trophy Asset */}
          <div className="relative shrink-0 z-10">
            <img
              src="/trophy.jpg"
              alt="Winner Championship Trophy"
              className="w-44 h-44 object-contain drop-shadow-2xl rounded-2xl"
            />
          </div>
        </div>
          </main>
        </div>
      </div>

      {/* Perk Claim Modal */}
      {selectedPerk && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedPerk(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-slate-950">
                  {selectedPerk.brand} — {selectedPerk.discount}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedPerk.condition}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-center">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Your Exclusive Voucher Code
              </div>
              <div className="text-lg font-black tracking-wider text-slate-900 font-mono select-all">
                {selectedPerk.code}
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(selectedPerk.code)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-extrabold text-slate-700 shadow-2xs hover:bg-slate-100 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Apply this promo code at checkout on {selectedPerk.brand} to claim your discount.
            </p>

            <button
              type="button"
              onClick={() => setSelectedPerk(null)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/30"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
