"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Swords,
  Globe,
  Share2,
  Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BrandOnboardingWizardPage() {
  // Wizard Stage: 0 (Role Selector), 1 (Details), 2 (Customize), 3 (Review), 4 (Under Review), 5 (Welcome Approved)
  const [stage, setStage] = useState<number>(0);

  // Form State
  const [brandName, setBrandName] = useState("NIKE");
  const [tagline, setTagline] = useState("Just Do It.");
  const [website, setWebsite] = useState("https://nike.com");
  const [category, setCategory] = useState("Apparel & Footwear");
  const [brandStory, setBrandStory] = useState(
    "Nike inspires athletes and empowers everyone to be their best. Innovation, performance and style - that's our game."
  );
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/nike");
  const [twitterUrl, setTwitterUrl] = useState("https://x.com/nike");

  // Customization State (Stage 2)
  const [logoUrl, setLogoUrl] = useState(
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80"
  );
  const [primaryColor, setPrimaryColor] = useState("#FF2D55");
  const [secondaryColor, setSecondaryColor] = useState("#0A84FF");
  const [bannerUrl, setBannerUrl] = useState(
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80"
  );
  const [personality, setPersonality] = useState("Savage");
  const [agreedTos, setAgreedTos] = useState(true);

  // Verification Simulation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleSubmitToArena = async () => {
    setIsSubmitting(true);

    try {
      // Register/claim the brand via API
      await fetch("/api/brands/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          workEmail: `corporate@${website.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "nike.com"}`,
          socialHandle: `@${brandName.toLowerCase()}`,
        }),
      });
    } catch {
      // ignore, advance wizard for smooth UI
    } finally {
      setIsSubmitting(false);
      setStage(4); // Advance to "Under Review" screen
    }
  };

  const handleSimulateAdminApproval = async () => {
    setIsApproving(true);
    try {
      await fetch("/api/business/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedBadge: true }),
      });
    } catch {
      // fallback for demo
    } finally {
      setIsApproving(false);
      setStage(5); // Advance to "Welcome to the Arena!" screen
    }
  };

  const categoriesList = [
    "Apparel & Footwear",
    "Food & Delivery",
    "Tech & Devices",
    "Productivity & SaaS",
    "Gaming & Esports",
    "Automotive & EVs",
    "Media & Entertainment",
  ];

  const personalityList = [
    { label: "Savage", icon: "🔥" },
    { label: "Funny", icon: "😂" },
    { label: "Bold", icon: "👑" },
    { label: "Witty", icon: "🧠" },
    { label: "Confident", icon: "🎯" },
    { label: "Other", icon: "✨" },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto text-slate-900">
      {/* Top Header Step Navigation (Shown for Stages 1 to 3) */}
      {stage >= 1 && stage <= 3 && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => setStage((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Stepper Progress Bar matching reference design */}
          <div className="flex items-center gap-2 sm:gap-6 text-xs font-extrabold">
            <div
              className={`flex items-center gap-1.5 ${
                stage >= 1 ? "text-red-600" : "text-slate-400"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                  stage > 1
                    ? "bg-emerald-500 text-white"
                    : stage === 1
                    ? "bg-red-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {stage > 1 ? "✓" : "1"}
              </span>
              <span className="hidden sm:inline">Brand Details</span>
            </div>

            <span className="text-slate-300 font-mono">→</span>

            <div
              className={`flex items-center gap-1.5 ${
                stage >= 2 ? "text-red-600" : "text-slate-400"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                  stage > 2
                    ? "bg-emerald-500 text-white"
                    : stage === 2
                    ? "bg-red-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {stage > 2 ? "✓" : "2"}
              </span>
              <span className="hidden sm:inline">Customize</span>
            </div>

            <span className="text-slate-300 font-mono">→</span>

            <div
              className={`flex items-center gap-1.5 ${
                stage >= 3 ? "text-red-600" : "text-slate-400"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                  stage === 3 ? "bg-red-600 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                3
              </span>
              <span className="hidden sm:inline">Review</span>
            </div>

            <span className="text-slate-300 font-mono">→</span>

            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-black">
                4
              </span>
              <span className="hidden sm:inline">Submit</span>
            </div>
          </div>

          <div className="w-12" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ========================================================= */}
        {/* SCREEN 1: Entry Role Selector (Stage 0) */}
        {/* ========================================================= */}
        {stage === 0 && (
          <motion.div
            key="stage-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10 py-6 text-center max-w-4xl mx-auto"
          >
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tight text-slate-900">
                Add Your Brand to the <span className="text-red-600">Arena</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium">
                Step up. Get roasted. Win the crowd.
              </p>
            </div>

            {/* 2 Main Cards matching Screen 1 from design collage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Red Card: I Want to Roast */}
              <div className="glass-card rounded-3xl p-8 border-2 border-red-500/50 bg-white text-center space-y-6 flex flex-col justify-between shadow-md relative group hover:border-red-600 transition-all">
                <div className="space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-red-500/20">
                    <Flame className="w-8 h-8 fill-white" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                      I Want to Roast
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Add your brand and challenge a rival.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-left text-xs font-semibold text-slate-700 max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">✓</span>
                      <span>Start epic 1v1 battles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">✓</span>
                      <span>Get votes & win perks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">✓</span>
                      <span>Grow your brand hype</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setStage(1)}
                  className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
                >
                  ADD MY BRAND
                </button>
              </div>

              {/* Blue Card: I Just Want to Vote */}
              <div className="glass-card rounded-3xl p-8 border border-slate-200 bg-white text-center space-y-6 flex flex-col justify-between shadow-md relative group hover:border-blue-400 transition-all">
                <div className="space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                      I Just Want to Vote
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Vote on battles and earn rewards.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-left text-xs font-semibold text-slate-700 max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>Vote on savage comebacks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>Earn points & badges</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>Unlock exclusive perks</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/"
                  className="w-full py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer"
                >
                  JUST VOTE
                </Link>
              </div>
            </div>

            {/* Bottom Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-left max-w-4xl mx-auto shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">How it works?</h4>
                  <p className="text-[11px] text-slate-600">
                    Brands battle. People vote. The winner earns glory (and perks).
                  </p>
                </div>
              </div>
              <Link
                href="/how-it-works"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 shrink-0"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: Step 1 — Tell Us About Your Brand (Stage 1) */}
        {/* ========================================================= */}
        {stage === 1 && (
          <motion.div
            key="stage-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            <div className="space-y-1 border-b border-slate-200 pb-4">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase italic">
                Tell Us About Your Brand
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Let the arena know who&apos;s stepping in.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white space-y-5 shadow-sm">
              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Brand Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your brand name (e.g. NIKE)"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-extrabold text-slate-700">
                  <span>Tagline / Slogan</span>
                  <span className="text-[10px] text-slate-400">0/50</span>
                </div>
                <input
                  type="text"
                  placeholder="Your brand in one line (e.g. Just Do It.)"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://yourbrand.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Story */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-extrabold text-slate-700">
                  <span>Brand Story (Optional)</span>
                  <span className="text-[10px] text-slate-400">0/300</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Tell us about your brand, your vibe and what makes you different."
                  value={brandStory}
                  onChange={(e) => setBrandStory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Social Links (Optional)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      placeholder="Instagram URL"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Share2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      placeholder="X (Twitter) URL"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStage(2)}
                  disabled={!brandName.trim()}
                  className="px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-red-500/20 disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: Step 2 — Upload & Customize Your Brand (Stage 2) */}
        {/* ========================================================= */}
        {stage === 2 && (
          <motion.div
            key="stage-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="space-y-1 border-b border-slate-200 pb-4">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase italic">
                Upload & Customize Your Brand
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Add your brand identity to make some noise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column: Logo & Banner Upload (6 Cols) */}
              <div className="md:col-span-6 space-y-6">
                <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                    Brand Logo <span className="text-red-600">*</span>
                  </label>

                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                    <div className="w-24 h-24 rounded-full bg-white p-2 border-2 border-slate-200 shadow-md flex items-center justify-center overflow-hidden relative">
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                    <button
                      onClick={() =>
                        setLogoUrl(
                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80"
                        )
                      }
                      className="px-4 py-1.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Change Logo
                    </button>
                    <span className="text-[10px] text-slate-400">PNG, JPG or SVG. Max 2MB.</span>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                    Arena Banner (Optional)
                  </label>

                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-36 bg-slate-100 flex items-center justify-center group">
                    <img
                      src={bannerUrl}
                      alt="Banner preview"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md backdrop-blur-md absolute cursor-pointer">
                      Upload Banner
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 block text-center">
                    Recommended size: 1200x400px
                  </span>
                </div>
              </div>

              {/* Right Column: Colors & Personality (6 Cols) */}
              <div className="md:col-span-6 space-y-6">
                <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                    Brand Colors (Optional)
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Primary Color</span>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                          {primaryColor}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Secondary Color</span>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                          {secondaryColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                    What&apos;s your brand personality?
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {personalityList.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => setPersonality(p.label)}
                        className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          personality === p.label
                            ? "bg-red-50 text-red-600 border-red-300 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900"
                        }`}
                      >
                        <span>{p.label}</span>
                        <span>{p.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setStage(3)}
                    className="px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 4: Step 3 — Review Your Submission (Stage 3) */}
        {/* ========================================================= */}
        {stage === 3 && (
          <motion.div
            key="stage-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-5xl mx-auto"
          >
            <div className="space-y-1 border-b border-slate-200 pb-4">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase italic">
                Review Your Submission
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Make sure everything looks perfect before entering the arena.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column: Live Brand Card Preview (6 Cols) */}
              <div className="md:col-span-6 space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 block">
                  BRAND PREVIEW
                </span>

                <div className="glass-card rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm space-y-4">
                  {/* Banner */}
                  <div className="h-32 relative bg-slate-100">
                    <img
                      src={bannerUrl}
                      alt="Banner"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="w-16 h-16 rounded-full bg-white p-1 border-2 border-slate-200 shadow-md absolute -bottom-8 left-6 flex items-center justify-center">
                      <img
                        src={logoUrl}
                        alt={brandName}
                        className="w-12 h-12 object-contain rounded-full"
                      />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 pt-10 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                          {brandName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase">
                          {personality} 🔥
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-500">{tagline}</p>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-3 font-medium">
                      {brandStory}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold">{category}</span>
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        {instagramUrl && <span className="text-slate-500">IG</span>}
                        {twitterUrl && <span className="text-slate-500">X</span>}
                        <span>{website}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Submission Summary & Submit Button (6 Cols) */}
              <div className="md:col-span-6 space-y-6">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 block">
                  SUBMISSION SUMMARY
                </span>

                <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 text-xs shadow-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-bold">Brand Name</span>
                    <strong className="text-slate-900 uppercase">{brandName}</strong>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-bold">Tagline</span>
                    <span className="text-slate-700 font-medium">{tagline}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-bold">Category</span>
                    <span className="text-slate-700 font-medium">{category}</span>
                  </div>

                  <div className="space-y-1 border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-bold block">Brand Story</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed italic">
                      &ldquo;{brandStory}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Brand Colors</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>
                  </div>
                </div>

                {/* TOS Checkbox */}
                <div className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    id="tos"
                    checked={agreedTos}
                    onChange={(e) => setAgreedTos(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 bg-white text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="tos" className="leading-snug cursor-pointer">
                    By submitting, you agree to our Terms of Service and confirm that you own the rights to the brand and uploaded content.
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setStage(2)}
                    className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    Edit Details
                  </button>

                  <button
                    onClick={handleSubmitToArena}
                    disabled={isSubmitting || !agreedTos}
                    className="px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
                  >
                    <span>{isSubmitting ? "Submitting..." : "Submit to Arena 🔥"}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 5: Step 4 — Your Brand is Under Review (Stage 4) */}
        {/* ========================================================= */}
        {stage === 4 && (
          <motion.div
            key="stage-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8 py-6 text-center max-w-3xl mx-auto"
          >
            {/* Hourglass Icon */}
            <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-sm relative">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
                Your Brand is Under Review
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
                Our team is checking your submission.
              </p>
            </div>

            {/* What Happens Next Card matching Screen 5 from design collage */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white space-y-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                WHAT HAPPENS NEXT?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto font-black text-sm">
                    🧠
                  </div>
                  <h4 className="text-xs font-black text-slate-900">1. We Review</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    We&apos;ll check your brand and details.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto font-black text-sm">
                    ⚡️
                  </div>
                  <h4 className="text-xs font-black text-slate-900">2. We Approve</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    You&apos;ll get notified once it&apos;s approved.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto font-black text-sm">
                    🔥
                  </div>
                  <h4 className="text-xs font-black text-slate-900">3. You Battle</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Start roasting and win the crowd!
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500 font-medium border-t border-slate-100">
                You&apos;ll receive an email at{" "}
                <span className="text-amber-600 font-bold font-mono">
                  corporate@{website.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "brand.com"}
                </span>{" "}
                once there&apos;s an update.
              </div>
            </div>

            {/* Action Buttons: Back to Home + Simulate Admin Approval Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/"
                className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xs transition-all cursor-pointer w-full sm:w-auto"
              >
                Back to Home
              </Link>

              <button
                onClick={handleSimulateAdminApproval}
                disabled={isApproving}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isApproving ? "Approving..." : "⚡️ Simulate Admin Approval (Instant Approve)"}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 6: Step 5 — Welcome to the Arena! (Stage 5 - Approved) */}
        {/* ========================================================= */}
        {stage === 5 && (
          <motion.div
            key="stage-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8 py-6 text-center max-w-4xl mx-auto"
          >
            {/* Green Shield Icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
                Welcome to the Arena!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Your brand has been approved.
              </p>
            </div>

            {/* Approved Brand Summary Card matching Screen 6 */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 bg-white space-y-6 shadow-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-16 h-16 rounded-full bg-white p-1 border-2 border-emerald-500 shadow-md flex items-center justify-center overflow-hidden">
                    <img
                      src={logoUrl}
                      alt={brandName}
                      className="w-12 h-12 object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase">{brandName}</h3>
                    <p className="text-xs font-bold text-slate-500">{tagline}</p>
                  </div>
                </div>

                <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  APPROVED
                </span>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Category</span>
                  <strong className="text-slate-900 truncate block">{category}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Rank</span>
                  <strong className="text-amber-600 block">Unranked</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Battles</span>
                  <strong className="text-slate-900 block font-mono">0</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Win Rate</span>
                  <strong className="text-emerald-600 block font-mono">0%</strong>
                </div>
              </div>
            </div>

            {/* Action Cards ("What's Next?") matching Screen 6 */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                WHAT&apos;S NEXT?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                {/* 1. Find an Opponent */}
                <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 flex flex-col justify-between shadow-sm">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
                      <Swords className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900">Find an Opponent</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Challenge a rival brand to start a battle.
                    </p>
                  </div>
                  <Link
                    href="/battles/new"
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all text-center block shadow-xs"
                  >
                    Find Opponent
                  </Link>
                </div>

                {/* 2. Customize Profile */}
                <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 flex flex-col justify-between shadow-sm">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900">Customize Profile</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Add more info and make your brand shine.
                    </p>
                  </div>
                  <Link
                    href="/business/dashboard"
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-extrabold text-xs uppercase tracking-wider transition-all text-center block"
                  >
                    Edit Profile
                  </Link>
                </div>

                {/* 3. Share Your Brand */}
                <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 flex flex-col justify-between shadow-sm">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900">Share Your Brand</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Let your fans know you&apos;re in the arena!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText?.(window.location.href);
                      alert("Brand arena link copied to clipboard!");
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Share Now
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Action CTA */}
            <div className="pt-4">
              <Link
                href="/business/dashboard"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
              >
                <span>Go to Arena</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
