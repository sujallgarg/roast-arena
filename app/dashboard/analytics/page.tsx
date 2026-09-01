"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, ArrowLeft, ArrowUpRight } from "lucide-react";

export default function B2BBrandAnalyticsPage() {
  const [timeframe, setTimeframe] = useState("30d");

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/business/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
            Brand Telemetry & Campaign Analytics <BarChart3 className="w-6 h-6 text-blue-600" />
          </h1>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl text-xs font-extrabold shadow-sm">
          {["7d", "30d", "90d", "All"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === t
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-2 shadow-sm">
          <span className="text-xs font-extrabold uppercase text-slate-500">Total Battle Views</span>
          <div className="text-2xl font-black text-slate-900 font-mono">1,48,920</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +18.4% vs last period
          </span>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-2 shadow-sm">
          <span className="text-xs font-extrabold uppercase text-slate-500">Votes Captured</span>
          <div className="text-2xl font-black text-red-600 font-mono">24,580</div>
          <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> 58.2% win rate
          </span>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-2 shadow-sm">
          <span className="text-xs font-extrabold uppercase text-slate-500">Perk Redemptions</span>
          <div className="text-2xl font-black text-amber-600 font-mono">3,890</div>
          <span className="text-[10px] text-amber-700 font-bold">15.8% conversion</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-2 shadow-sm">
          <span className="text-xs font-extrabold uppercase text-slate-500">Estimated Reach ROI</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">4.8x</div>
          <span className="text-[10px] text-emerald-600 font-bold">₹4,80,000 media value</span>
        </div>
      </div>

      {/* Conversion Funnel & Device Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Campaign Conversion Funnel (7 Cols) */}
        <div className="md:col-span-7 glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
            CAMPAIGN CONVERSION FUNNEL
          </h3>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-extrabold text-slate-700">
                <span>1. Battle Views</span>
                <span className="font-mono text-slate-900">1,48,920 (100%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div className="bg-blue-600 h-full rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-extrabold text-slate-700">
                <span>2. Audience Votes Cast</span>
                <span className="font-mono text-slate-900">24,580 (16.5%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div className="bg-red-600 h-full rounded-full w-[16.5%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-extrabold text-slate-700">
                <span>3. Perk Unlocks</span>
                <span className="font-mono text-slate-900">8,240 (5.5%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div className="bg-amber-500 h-full rounded-full w-[5.5%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-extrabold text-slate-700">
                <span>4. Store Redemptions & Checkout</span>
                <span className="font-mono text-slate-900">3,890 (2.6%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div className="bg-emerald-600 h-full rounded-full w-[2.6%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Audience Device Breakdown (5 Cols) */}
        <div className="md:col-span-5 glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
            AUDIENCE DEVICE & REFERRALS
          </h3>

          <div className="space-y-3 text-xs font-bold text-slate-700">
            <div className="flex justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span>📱 Mobile (iOS & Android)</span>
              <span className="font-mono text-red-600">74%</span>
            </div>

            <div className="flex justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span>💻 Desktop (macOS & Windows)</span>
              <span className="font-mono text-blue-600">22%</span>
            </div>

            <div className="flex justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span>🌐 Social Direct Shares</span>
              <span className="font-mono text-amber-600">4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
