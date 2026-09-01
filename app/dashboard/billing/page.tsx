"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Check, ShieldCheck, ArrowLeft, Download } from "lucide-react";

export default function B2BBillingPage() {
  const [currentPlan, setCurrentPlan] = useState("Pro");

  const plans = [
    {
      name: "Free Starter",
      price: "₹0",
      period: "forever",
      description: "Basic brand profile and 1 live arena battle per month.",
      features: [
        "Brand profile page",
        "1 Battle per month",
        "Basic vote count",
        "Standard support",
      ],
      badge: "STARTER",
      cta: "Current Plan",
    },
    {
      name: "Pro Arena Plan",
      price: "₹9,999",
      period: "per month",
      description: "For active challenger brands seeking viral engagement and perk drops.",
      features: [
        "Unlimited arena battles",
        "Verified Brand Badge ✓",
        "AI Roast Assistant V2.0",
        "Perk Drop Manager",
        "Full Telemetry & ROI Analytics",
        "Priority 1-hour moderation review",
      ],
      badge: "MOST POPULAR",
      isPopular: true,
      cta: "Upgrade to Pro",
    },
    {
      name: "Campaign Battle Pass",
      price: "₹49,999",
      period: "per campaign",
      description: "Guaranteed homepage hero placement and sponsored battle marketing.",
      features: [
        "Homepage Hero takeover placement",
        "Custom rival battle matchmaking",
        "100,000+ guaranteed voter reach",
        "Dedicated campaign manager",
        "Stripe checkout integration",
      ],
      badge: "FEATURED CAMPAIGN",
      cta: "Launch Campaign",
    },
  ];

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
            Monetization & Billing Portal <CreditCard className="w-6 h-6 text-emerald-600" />
          </h1>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          ACTIVE PRO SUBSCRIPTION
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`glass-card rounded-3xl p-6 sm:p-8 border bg-white space-y-6 flex flex-col justify-between shadow-sm relative ${
              p.isPopular
                ? "border-2 border-red-500 shadow-red-500/10"
                : "border-slate-200"
            }`}
          >
            {p.isPopular && (
              <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider absolute -top-3 left-6 shadow-md">
                {p.badge}
              </span>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{p.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 font-mono">{p.price}</span>
                <span className="text-xs text-slate-500 font-bold">/{p.period}</span>
              </div>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-700 font-medium">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setCurrentPlan(p.name)}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 ${
                p.isPopular
                  ? "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200"
              }`}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Invoice & Payment History */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
          PAYMENT HISTORY & INVOICES
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <strong className="text-slate-900 block font-bold">INV-2026-0801 (Pro Plan)</strong>
              <span className="text-slate-500 font-mono text-[11px]">August 1, 2026 • Stripe Verified</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-emerald-600 font-bold">₹9,999</span>
              <button className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
