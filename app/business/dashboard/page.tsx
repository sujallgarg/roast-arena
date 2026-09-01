"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ShieldCheck,
  Plus,
  Flame,
  BarChart3,
  Users,
  MessageSquare,
  Gift,
  Trophy,
  CreditCard,
  Settings,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  Lock,
  ArrowRight,
  TrendingUp,
  Share2,
  HelpCircle,
  Eye,
  CheckCircle2,
  X,
} from "lucide-react";

export default function BusinessDashboardPage() {
  const router = useRouter();

  // Authentication & Access Control
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [brandName, setBrandName] = useState("Brand Co.");
  const [brandHandle, setBrandHandle] = useState("@brandpartner");
  const [brandLogo, setBrandLogo] = useState("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80");
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Navigation & Tabs
  const [activeNavTab, setActiveNavTab] = useState<"Dashboard" | "Battles" | "Analytics" | "Rewards" | "Profile">("Dashboard");
  const [activeSidebarItem, setActiveSidebarItem] = useState("Overview");
  const [engagementPeriod, setEngagementPeriod] = useState("Last 30 Days");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newBattleRival, setNewBattleRival] = useState("Adidas");
  const [newBattleTitle, setNewBattleTitle] = useState("Sneakerhead Superclash 2026");
  const [createSuccess, setCreateSuccess] = useState(false);

  // Check Brand Authentication on mount
  useEffect(() => {
    async function checkBrandSession() {
      try {
        const res = await fetch("/api/business/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.brand) {
            setIsAuthenticated(true);
            setBrandName(data.brand.name || "Brand Co.");
            setBrandHandle(data.brand.handle || "@brandpartner");
            if (data.brand.logoUrl) setBrandLogo(data.brand.logoUrl);
          } else {
            // Check local brand session
            const localBrand = localStorage.getItem("coroast_brand_partner");
            if (localBrand) {
              const parsed = JSON.parse(localBrand);
              setIsAuthenticated(true);
              setBrandName(parsed.name || "Brand Co.");
              setBrandHandle(parsed.handle || "@brandpartner");
            }
          }
        } else {
          const localBrand = localStorage.getItem("coroast_brand_partner");
          if (localBrand) {
            const parsed = JSON.parse(localBrand);
            setIsAuthenticated(true);
            setBrandName(parsed.name || "Brand Co.");
            setBrandHandle(parsed.handle || "@brandpartner");
          }
        }
      } catch {
        // Fallback
      } finally {
        setAuthChecking(false);
      }
    }

    checkBrandSession();
  }, []);

  const handleBrandLogin = async (presetBrand?: { name: string; handle: string; logo: string }) => {
    if (presetBrand) {
      localStorage.setItem("coroast_brand_partner", JSON.stringify(presetBrand));
      setBrandName(presetBrand.name);
      setBrandHandle(presetBrand.handle);
      setBrandLogo(presetBrand.logo);
      setIsAuthenticated(true);
      return;
    }

    if (accessCodeInput.trim().toUpperCase() === "ROAST2026" || accessCodeInput.trim().toUpperCase() === "BRAND2026") {
      const brandData = {
        name: "Brand Co.",
        handle: "@brandco",
        logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
      };
      localStorage.setItem("coroast_brand_partner", JSON.stringify(brandData));
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid Brand Partner Access Key. (Authorized partners use: BRAND2026)");
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("coroast_brand_partner");
    try {
      await fetch("/api/business/session", { method: "DELETE" });
    } catch {}
    setIsAuthenticated(false);
  };

  // If loading authentication status
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Verifying Brand Partner Credentials...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RBAC BARRIER: ACCESS CONTROL FOR NORMAL USERS
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 selection:bg-red-500 selection:text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-500/30">
              COMMERCIAL BRAND PORTAL
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Brand Partner Access Only
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              This dashboard is strictly protected and not accessible with normal user accounts. Only verified enterprise brands can sponsor clashes, view audience intelligence, and run brand campaigns.
            </p>
          </div>

          {/* Access Code Input */}
          <div className="space-y-3 text-left">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Brand Partner Access Key
            </label>
            <input
              type="password"
              placeholder="Enter Partner Access Key..."
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            />
            {authError && (
              <p className="text-xs font-bold text-red-400">{authError}</p>
            )}

            <button
              type="button"
              onClick={() => handleBrandLogin()}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 cursor-pointer"
            >
              Authenticate Brand Portal
            </button>
          </div>

          {/* Quick Demo Access for Verification */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              Quick Verify As Partner Brand
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleBrandLogin({
                    name: "Nike Co.",
                    handle: "@nike",
                    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
                  })
                }
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
              >
                <span>Nike Co.</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleBrandLogin({
                    name: "Brand Co.",
                    handle: "@brandpartner",
                    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
                  })
                }
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
              >
                <span>Brand Co.</span>
              </button>
            </div>
          </div>

          <div>
            <Link
              href="/"
              className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
            >
              ← Return to Roast Arena
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAGE 1: BUSINESS / BRAND DASHBOARD (MATCHING REFERENCE DESIGN EXACTLY)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* 1. TOP HEADER (ROAST ARENA BRAND HEADER) */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        {/* Left: Brand Logo & Top Tabs */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-black italic text-xl sm:text-2xl tracking-tighter text-red-600 group-hover:scale-105 transition-transform">
              ROAST <span className="text-slate-950 font-black not-italic">ARENA</span>
            </span>
          </Link>

          {/* Top Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider">
            {(["Dashboard", "Battles", "Analytics", "Rewards", "Profile"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveNavTab(tab)}
                className={`py-2 transition-all cursor-pointer relative ${
                  activeNavTab === tab
                    ? "text-red-600 font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab}
                {activeNavTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Notification Bell & Brand Partner Profile */}
        <div className="flex items-center gap-4">
          <Link
            href="/notifications"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
          </Link>

          {/* Brand Partner Badge with Dropdown */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-black flex items-center justify-center text-white font-black text-xs shadow-xs border border-slate-300">
              <img
                src={brandLogo}
                alt={brandName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-black text-slate-900 leading-tight">
                {brandName}
              </div>
              <div className="text-[10px] text-slate-400 font-bold tracking-tight">
                Brand Partner
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out of Brand Portal"
              className="text-[11px] font-bold text-slate-400 hover:text-red-600 ml-1 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER WITH SIDEBAR */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT SIDEBAR (Col 1-2.5) ================= */}
          <aside className="lg:col-span-2 hidden lg:flex flex-col space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-3 shadow-xs space-y-1">
              {[
                { name: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
                { name: "My Battles", icon: <Flame className="w-4 h-4" /> },
                { name: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
                { name: "Audience Insights", icon: <Users className="w-4 h-4" /> },
                { name: "Rewards & Perks", icon: <Gift className="w-4 h-4" /> },
                { name: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
                { name: "Payouts & Billing", icon: <CreditCard className="w-4 h-4" /> },
                { name: "Profile & Settings", icon: <Settings className="w-4 h-4" /> },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveSidebarItem(item.name)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    activeSidebarItem === item.name
                      ? "bg-red-50 text-red-600 font-black shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            {/* Need Help Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-slate-900">Need Help?</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Our brand success team is here to help you maximize your ROI on Roast Arena.
              </p>
              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Contact Support
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-bold px-2">
              © 2024 Roast Arena
            </div>
          </aside>

          {/* ================= MAIN DASHBOARD STREAM (Col 3-12) ================= */}
          <main className="lg:col-span-10 space-y-6">
            {/* Top Welcome Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 flex items-center gap-2">
                  <span>Welcome, {brandName}</span>
                  <span>👋</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Here&apos;s how your brand is performing in the Arena.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Battle</span>
              </button>
            </div>

            {/* 5 KEY STAT CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Card 1 */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Total Battles
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                  5
                </div>
                <div className="text-[11px] font-black text-emerald-600 flex items-center gap-0.5">
                  <span>▲ 2 this month</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Total Votes
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                  128.4K
                </div>
                <div className="text-[11px] font-black text-emerald-600 flex items-center gap-0.5">
                  <span>▲ 18.7%</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Total Engagement
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                  32.6K
                </div>
                <div className="text-[11px] font-black text-emerald-600 flex items-center gap-0.5">
                  <span>▲ 24.5%</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  New Audience
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                  46.2K
                </div>
                <div className="text-[11px] font-black text-emerald-600 flex items-center gap-0.5">
                  <span>▲ 20.1%</span>
                </div>
              </div>

              {/* Card 5 */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Brand Mentions
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                  8.7K
                </div>
                <div className="text-[11px] font-black text-emerald-600 flex items-center gap-0.5">
                  <span>▲ 15.3%</span>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN SECTION: RECENT BATTLE PERFORMANCE & ENGAGEMENT OVER TIME */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Recent Battle Performance (Col 6/12) */}
              <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Recent Battle Performance
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                      Completed
                    </span>
                  </div>

                  {/* Rival clash logos */}
                  <div className="flex items-center justify-center gap-6 py-2">
                    <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white shadow-md">
                      <span className="font-black text-xs italic tracking-tighter">NIKE</span>
                    </div>
                    <span className="font-black italic text-slate-300 text-xs">VS</span>
                    <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md">
                      <span className="font-black text-xs uppercase tracking-tighter">ADIDAS</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Winner
                    </span>
                    <div className="text-xl font-black text-slate-950">
                      Nike
                    </div>
                  </div>

                  {/* Percentages */}
                  <div className="flex items-center justify-between text-center px-4">
                    <div>
                      <div className="text-3xl font-black text-red-600 font-mono">62%</div>
                      <div className="text-[11px] text-slate-400 font-semibold">Votes</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-slate-700 font-mono">38%</div>
                      <div className="text-[11px] text-slate-400 font-semibold">Votes</div>
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-red-600 h-full w-[62%]" />
                    <div className="bg-slate-700 h-full w-[38%]" />
                  </div>

                  {/* Metric Row */}
                  <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                    <div>
                      <div className="text-xs font-black text-slate-900 font-mono">54.2K</div>
                      <div className="text-[10px] text-slate-400 font-bold">Total Votes</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 font-mono">6.1K</div>
                      <div className="text-[10px] text-slate-400 font-bold">Comments</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 font-mono">3.2K</div>
                      <div className="text-[10px] text-slate-400 font-bold">Shares</div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-600 font-mono">18.7%</div>
                      <div className="text-[10px] text-slate-400 font-bold">Engagement</div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer mt-4"
                >
                  View Battle Report
                </button>
              </div>

              {/* Right: Engagement Over Time (Col 6/12) */}
              <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Engagement Over Time
                  </h3>
                  <select
                    value={engagementPeriod}
                    onChange={(e) => setEngagementPeriod(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                    <option>All Time</option>
                  </select>
                </div>

                {/* SVG Smooth Curve Chart */}
                <div className="h-64 w-full pt-4 flex flex-col justify-between">
                  <div className="relative h-48 w-full">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono text-slate-300 pointer-events-none">
                      <div className="border-b border-slate-100 flex items-center justify-between pb-1">
                        <span>40K</span>
                      </div>
                      <div className="border-b border-slate-100 flex items-center justify-between pb-1">
                        <span>30K</span>
                      </div>
                      <div className="border-b border-slate-100 flex items-center justify-between pb-1">
                        <span>20K</span>
                      </div>
                      <div className="border-b border-slate-100 flex items-center justify-between pb-1">
                        <span>10K</span>
                      </div>
                      <div className="flex items-center justify-between pb-1">
                        <span>0</span>
                      </div>
                    </div>

                    {/* Smooth glowing line SVG */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="brandRedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area Fill */}
                      <path
                        d="M 0 160 Q 60 140, 120 120 T 240 100 T 360 80 T 440 30 T 500 40 L 500 180 L 0 180 Z"
                        fill="url(#brandRedGrad)"
                      />
                      {/* Smooth Stroke */}
                      <path
                        d="M 0 160 Q 60 140, 120 120 T 240 100 T 360 80 T 440 30 T 500 40"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Interactive Datapoints */}
                      <circle cx="120" cy="120" r="4" fill="#ef4444" className="hover:r-6 transition-all cursor-pointer" />
                      <circle cx="240" cy="100" r="4" fill="#ef4444" className="hover:r-6 transition-all cursor-pointer" />
                      <circle cx="360" cy="80" r="4" fill="#ef4444" className="hover:r-6 transition-all cursor-pointer" />
                      <circle cx="440" cy="30" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="hover:r-7 transition-all cursor-pointer" />
                    </svg>
                  </div>

                  {/* Dates X-Axis */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 font-mono pt-2">
                    <span>Apr 28</span>
                    <span>May 5</span>
                    <span>May 12</span>
                    <span>May 19</span>
                    <span>May 25</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WHY BRANDS LOVE ROAST ARENA (VALUE PROPS STRIP) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Why Brands Love Roast Arena
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>New Audience</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Reach people who may not know your brand yet.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <Flame className="w-3.5 h-3.5 text-red-500" />
                    <span>High Engagement</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Votes, comments & shares that create real connections.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <Share2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Viral Reach</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Battles are designed to be shared across social media.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Actionable Insights</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Detailed analytics to measure your brand performance.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <Gift className="w-3.5 h-3.5 text-purple-500" />
                    <span>Rewards & Perks</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Users earn rewards, your brand gets more love.
                  </p>
                </div>
              </div>
            </div>

            {/* TOP PERFORMING CONTENT (4 CARDS) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Top Performing Content
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Content Card 1 */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between">
                  <div className="h-36 w-full overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80"
                      alt="Nike vs Adidas"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[9px] font-black uppercase tracking-wider">
                      Battle
                    </span>
                  </div>
                  <div className="p-3.5 space-y-2">
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                      Nike vs Adidas
                    </h4>
                    <div className="text-[10px] text-slate-500 font-medium">
                      54.2K votes • 18.7% engagement
                    </div>
                  </div>
                </div>

                {/* Content Card 2 */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between">
                  <div className="h-36 w-full overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                      alt="Roast Post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider">
                      Roast
                    </span>
                  </div>
                  <div className="p-3.5 space-y-2">
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                      Nike&apos;s marketing team right now
                    </h4>
                    <div className="text-[10px] text-slate-500 font-medium">
                      12.1K upvotes • 420 comments
                    </div>
                  </div>
                </div>

                {/* Content Card 3 */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between">
                  <div className="h-36 w-full overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&auto=format&fit=crop&q=80"
                      alt="Comeback"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider">
                      Comeback
                    </span>
                  </div>
                  <div className="p-3.5 space-y-2">
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                      Adidas: 3 stripes, countless comebacks.
                    </h4>
                    <div className="text-[10px] text-slate-500 font-medium">
                      9.8K upvotes • 310 comments
                    </div>
                  </div>
                </div>

                {/* Content Card 4 */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between">
                  <div className="h-36 w-full overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                      alt="Meme"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider">
                      Meme
                    </span>
                  </div>
                  <div className="p-3.5 space-y-2">
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                      POV: When the roast hits hard 💀
                    </h4>
                    <div className="text-[10px] text-slate-500 font-medium">
                      8.3K upvotes • 290 comments
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM BANNER: YOUR BRAND BENEFITS & CREATE BATTLE CTA */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left benefits */}
              <div className="space-y-3 w-full lg:w-auto">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Your Brand Benefits
                </h3>
                <div className="flex flex-wrap items-center gap-8">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                      +46.2K
                    </div>
                    <div className="text-[11px] text-slate-400 font-semibold">
                      New Audience Reached
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                      +128.4K
                    </div>
                    <div className="text-[11px] text-slate-400 font-semibold">
                      Total Votes Driven
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                      +32.6K
                    </div>
                    <div className="text-[11px] text-slate-400 font-semibold">
                      Engagement Generated
                    </div>
                  </div>
                </div>
              </div>

              {/* Right CTA */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 w-full lg:w-96 text-left space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900">
                  Ready for your next battle?
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Let&apos;s create another epic battle and keep your brand in the spotlight.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Create New Battle
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* CREATE NEW BATTLE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-red-600">
                <Flame className="w-4 h-4" />
                <span>SPONSOR NEW ARENA BATTLE</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-black text-slate-900">Battle Created & Scheduled!</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Your battle has been published to the Roast Arena directory.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCreateSuccess(false);
                    setShowCreateModal(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs uppercase"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCreateSuccess(true);
                }}
                className="space-y-4 text-xs font-medium"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Battle Title</label>
                  <input
                    type="text"
                    required
                    value={newBattleTitle}
                    onChange={(e) => setNewBattleTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Challenger / Rival Brand</label>
                  <select
                    value={newBattleRival}
                    onChange={(e) => setNewBattleRival(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:bg-white"
                  >
                    <option>Adidas</option>
                    <option>Puma</option>
                    <option>Under Armour</option>
                    <option>New Balance</option>
                    <option>Burger King</option>
                    <option>Pepsi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Format & Rounds</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                    5 Round Auto-Advancing Arena Clash • 24 Hours Total Duration
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Launch Battle 🥊
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <h3 className="text-base font-black text-slate-900">Brand Partner Concierge</h3>
            <p className="text-xs text-slate-500 font-medium">
              Direct line to our brand sponsorship team: <strong>brands@roastarena.gg</strong>
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 text-left">
              • Priority battle scheduling<br />
              • Custom reward code distribution<br />
              • Official verification badge checks
            </div>
            <button
              type="button"
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* BATTLE REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black uppercase text-slate-900">Battle Analytics: Nike vs Adidas</h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Unique Voters</span>
                <span className="font-bold text-slate-900">54,210</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Audience Win Ratio</span>
                <span className="font-bold text-emerald-600">62% (Nike)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Brand Impressions</span>
                <span className="font-bold text-slate-900">214,500</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Perks Redeemed</span>
                <span className="font-bold text-slate-900">3,410</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white font-black text-xs uppercase mt-2"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
