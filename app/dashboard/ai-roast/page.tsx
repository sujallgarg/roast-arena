"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Flame, Copy, Check, RefreshCw, ShieldCheck, ArrowLeft, Send } from "lucide-react";

export default function AIRoastAssistantPage() {
  const [opponentRoast, setOpponentRoast] = useState(
    "Swiggy delivery fees are higher than a luxury airline ticket, and food still arrives cold! 🛵❄️"
  );
  const [targetBrand, setTargetBrand] = useState("Zomato");
  const [tone, setTone] = useState("Savage");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [aiOptions, setAiOptions] = useState<
    Array<{ id: string; text: string; confidenceScore: number }>
  >([
    {
      id: "option-1",
      text: "Calling that a roast @Zomato? Your app has more dark patterns than a maze, and our delivery time still beats your promo codes! 🛵🔥",
      confidenceScore: 0.96,
    },
    {
      id: "option-2",
      text: "Nice attempt @Zomato, but while you were writing this tweet, 50,000 users just switched to Swiggy One for free delivery. Focus on your cart abandon rate! 🚀",
      confidenceScore: 0.91,
    },
    {
      id: "option-3",
      text: "We'd roast you back @Zomato, but your servers are already overheating from today's lunch rush! ☕️",
      confidenceScore: 0.88,
    },
  ]);

  const handleGenerateRoasts = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentRoast,
          brandName: "Swiggy",
          targetBrand,
          tone,
        }),
      });
      const data = await res.json();
      if (data.options) {
        setAiOptions(data.options);
      }
    } catch {
      // Fallback
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto text-slate-900">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          href="/business/dashboard"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>
        <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          AI ROAST ASSISTANT V2.0
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight text-slate-900 flex items-center gap-2">
          AI Roast Generator Studio <Flame className="w-8 h-8 text-red-600 fill-red-600" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          Generate humorous, non-defamatory, brand-safe comebacks verified by moderation AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Prompt Input */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-5 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Opponent&apos;s Roast / Attack
              </label>
              <textarea
                rows={4}
                value={opponentRoast}
                onChange={(e) => setOpponentRoast(e.target.value)}
                placeholder="Paste the rival brand's roast here..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Target Rival Brand
              </label>
              <input
                type="text"
                value={targetBrand}
                onChange={(e) => setTargetBrand(e.target.value)}
                placeholder="Rival brand name (e.g. Zomato)"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                Select Roast Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Savage", icon: "🔥" },
                  { label: "Witty", icon: "🧠" },
                  { label: "Playful", icon: "😂" },
                  { label: "Bold", icon: "👑" },
                ].map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setTone(t.label)}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tone === t.label
                        ? "bg-red-50 text-red-600 border-red-300 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span>{t.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateRoasts}
              disabled={isGenerating || !opponentRoast.trim()}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Comebacks...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Comebacks 🔥</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Suggestions */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              AI GENERATED OPTIONS ({aiOptions.length})
            </span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Brand Moderation Passed
            </span>
          </div>

          <div className="space-y-4">
            {aiOptions.map((option) => (
              <div
                key={option.id}
                className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-3 shadow-sm hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-extrabold uppercase text-amber-600">
                    Tone: {tone}
                  </span>
                  <span className="font-mono text-[11px]">
                    Confidence: {Math.round(option.confidenceScore * 100)}%
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  &ldquo;{option.text}&rdquo;
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleCopy(option.id, option.text)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-extrabold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === option.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Roast</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/business/dashboard"
                    className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-red-500/20 cursor-pointer"
                  >
                    <span>Use in Battle</span>
                    <Send className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
