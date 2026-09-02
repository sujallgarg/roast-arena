"use client";

import { useRef, useState, useEffect } from "react";
import {
  Download,
  Share2,
  Check,
  Flame,
  X,
  Copy,
  Camera,
  Code,
  Globe,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Swords,
  Building2,
} from "lucide-react";
import { toPng } from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export interface ShareBattleData {
  id?: string;
  slug?: string;
  title: string;
  brandA: {
    name: string;
    handle?: string;
    logoUrl?: string;
    brandColor?: string;
  };
  brandB: {
    name: string;
    handle?: string;
    logoUrl?: string;
    brandColor?: string;
  };
  votesCountA: number;
  votesCountB: number;
  topRoast?: string;
}

interface MatchShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  battle: ShareBattleData;
}

export function MatchShareCard({
  isOpen,
  onClose,
  battle,
}: MatchShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"QUICK_SHARE" | "FOR_BRANDS" | "MATCH_CARD">("QUICK_SHARE");
  const [format, setFormat] = useState<"TWITTER" | "INSTAGRAM">("TWITTER");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedBrandA, setCopiedBrandA] = useState(false);
  const [copiedBrandB, setCopiedBrandB] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  const total = battle.votesCountA + battle.votesCountB;
  const percentA = total > 0 ? Math.round((battle.votesCountA / total) * 100) : 50;
  const percentB = 100 - percentA;

  const brandAColor = battle.brandA.brandColor || "#ef4444";
  const brandBColor = battle.brandB.brandColor || "#3b82f6";

  const getShareUrl = () => {
    if (typeof window === "undefined") return "https://roastarena.com/battles";
    if (battle.id && !window.location.pathname.includes(battle.id)) {
      return `${window.location.origin}/battles/${battle.id}`;
    }
    return window.location.href;
  };

  const shareUrl = typeof window !== "undefined" ? getShareUrl() : "https://roastarena.com/battles";

  // Trigger tracking & award XP
  const recordShareAction = async () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"],
      });

      const endpoint = battle.id ? `/api/battles/${battle.id}/share` : "/api/battles/live/share";
      const res = await fetch(endpoint, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data?.xpAwarded && data.xpAwarded > 0) {
          setShareFeedback(`🎉 +${data.xpAwarded} XP awarded for sharing!`);
          setTimeout(() => setShareFeedback(null), 4000);
        }
      }
    } catch {}
  };

  // 1. Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    recordShareAction();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 2. Native Web Share
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `⚔️ ${battle.title} | Roast Arena`,
          text: `Who has the better roast? Cast your vote now in ${battle.brandA.name} vs ${battle.brandB.name} on Roast Arena! 🔥`,
          url: shareUrl,
        });
        recordShareAction();
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  // 3. Social share helpers
  const shareToTwitter = (customText?: string) => {
    const text =
      customText ||
      `⚔️ Who has the better comeback? Cast your vote in ${battle.brandA.name} vs ${battle.brandB.name} on Roast Arena! 🔥`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(
      `RoastArena,${battle.brandA.name.replace(/\s+/g, "")},${battle.brandB.name.replace(/\s+/g, "")}`
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
    recordShareAction();
  };

  const shareToWhatsApp = () => {
    const text = `⚔️ ${battle.title}! Cast your vote in the live brand clash on Roast Arena: ${shareUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    recordShareAction();
  };

  const shareToTelegram = () => {
    const text = `⚔️ Cast your vote in ${battle.title} on Roast Arena!`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    recordShareAction();
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    recordShareAction();
  };

  // 4. Brand Campaign Helpers
  const brandARally = `🔥 Team #${battle.brandA.name.replace(/\s+/g, "")}: We need your votes! Head to Roast Arena and drop your savage roasts against ${battle.brandB.name}. Vote now: ${shareUrl}`;
  const brandBRally = `🔥 Team #${battle.brandB.name.replace(/\s+/g, "")}: Time to show ${battle.brandA.name} who runs the arena! Drop your votes & comebacks here: ${shareUrl}`;

  const embedSnippet = `<iframe src="${shareUrl}" width="100%" height="520" frameborder="0" style="border-radius:16px;border:1px solid #e2e8f0;" title="${battle.title} on Roast Arena"></iframe>`;

  const handleCopyBrandA = () => {
    navigator.clipboard.writeText(brandARally);
    setCopiedBrandA(true);
    recordShareAction();
    setTimeout(() => setCopiedBrandA(false), 2500);
  };

  const handleCopyBrandB = () => {
    navigator.clipboard.writeText(brandBRally);
    setCopiedBrandB(true);
    recordShareAction();
    setTimeout(() => setCopiedBrandB(false), 2500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    recordShareAction();
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  // 5. Download PNG
  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `roast-arena-${battle.brandA.name.toLowerCase()}-vs-${battle.brandB.name.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      recordShareAction();
    } catch (err) {
      console.error("Failed to generate image card:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-5 sm:p-7 space-y-5 z-10 overflow-hidden my-6 max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200/80 flex items-center justify-center text-red-600 shadow-2xs">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight uppercase italic flex items-center gap-2">
                    <span>SHARE THE BATTLE</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black not-italic tracking-wider border border-red-200">
                      +20 XP
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Rally your audience, challenge friends, and export match graphics!
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* XP Feedback Banner */}
            {shareFeedback && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{shareFeedback}</span>
              </div>
            )}

            {/* Main Category Tabs: Everyone vs For Brands vs Match Card */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("QUICK_SHARE")}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === "QUICK_SHARE"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-red-500" />
                <span className="truncate">Quick Share</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("FOR_BRANDS")}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === "FOR_BRANDS"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">For Brands 🏢</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("MATCH_CARD")}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === "MATCH_CARD"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate">Match Graphic</span>
              </button>
            </div>

            {/* TAB 1: QUICK SHARE (FOR EVERYONE) */}
            {activeTab === "QUICK_SHARE" && (
              <div className="space-y-4 pt-1">
                {/* 1-Click Copy Link Box */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Battle Link
                  </label>
                  <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-transparent px-3 text-xs font-mono text-slate-700 focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        copiedLink
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25"
                      }`}
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Native Device Share (Mobile & Supported Browsers) */}
                {canNativeShare && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                  >
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Share via Device (Instagram, WhatsApp, Messages)</span>
                  </button>
                )}

                {/* Social Share Grid */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Direct Social Share
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* X (Twitter) */}
                    <button
                      type="button"
                      onClick={() => shareToTwitter()}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs hover:scale-102 cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span>X / Twitter</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={shareToWhatsApp}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-2xs hover:scale-102 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Telegram */}
                    <button
                      type="button"
                      onClick={shareToTelegram}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-2xs hover:scale-102 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Telegram</span>
                    </button>

                    {/* LinkedIn */}
                    <button
                      type="button"
                      onClick={shareToLinkedIn}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-2xs hover:scale-102 cursor-pointer"
                    >
                      <Globe className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FOR BRANDS & CREATORS */}
            {activeTab === "FOR_BRANDS" && (
              <div className="space-y-4 pt-1">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200/80 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-xs text-slate-900">
                      Brand Campaign & Team Rally Toolkit
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Mobilize your brand community, post official rally cries, or embed the live voting duel widget onto your company website!
                    </p>
                  </div>
                </div>

                {/* Team Brand A Rally */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandAColor }} />
                      <span>Team {battle.brandA.name} Rally Post</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => shareToTwitter(brandARally)}
                      className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Post to X</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded-xl border border-slate-200 select-all">
                    {brandARally}
                  </p>

                  <button
                    type="button"
                    onClick={handleCopyBrandA}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedBrandA ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied Rally Post!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Team {battle.brandA.name} Post</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Team Brand B Rally */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandBColor }} />
                      <span>Team {battle.brandB.name} Rally Post</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => shareToTwitter(brandBRally)}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Post to X</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded-xl border border-slate-200 select-all">
                    {brandBRally}
                  </p>

                  <button
                    type="button"
                    onClick={handleCopyBrandB}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedBrandB ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied Rally Post!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Team {battle.brandB.name} Post</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Website Embed Code */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-slate-600" />
                      <span>Embed Live Duel Widget (Website & Blog)</span>
                    </span>
                  </div>

                  <pre className="text-[11px] text-slate-600 font-mono bg-white p-2.5 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap select-all">
                    {embedSnippet}
                  </pre>

                  <button
                    type="button"
                    onClick={handleCopyEmbed}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedEmbed ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Embed Code Copied!</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-3.5 h-3.5" />
                        <span>Copy Embed HTML Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: EXPORT MATCH GRAPHIC CARD */}
            {activeTab === "MATCH_CARD" && (
              <div className="space-y-4 pt-1">
                {/* Format Selector Tabs */}
                <div className="flex items-center gap-2 justify-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFormat("TWITTER")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      format === "TWITTER"
                        ? "bg-white text-slate-900 shadow-xs font-black"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-slate-900" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Twitter / X (16:9 Landscape)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat("INSTAGRAM")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      format === "INSTAGRAM"
                        ? "bg-white text-slate-900 shadow-xs font-black"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram Story (9:16 Portrait)</span>
                  </button>
                </div>

                {/* HTML Preview Card */}
                <div className="flex justify-center overflow-hidden py-1">
                  <div
                    ref={cardRef}
                    className={`bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 flex flex-col justify-between space-y-5 relative overflow-hidden shadow-lg select-none ${
                      format === "TWITTER"
                        ? "w-full max-w-xl aspect-[16/9]"
                        : "w-72 aspect-[9/16]"
                    }`}
                  >
                    {/* Background Brand Glows */}
                    <div
                      className="absolute -top-16 -left-16 w-56 h-56 rounded-full blur-2xl opacity-20 pointer-events-none"
                      style={{ backgroundColor: brandAColor }}
                    />
                    <div
                      className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-2xl opacity-20 pointer-events-none"
                      style={{ backgroundColor: brandBColor }}
                    />

                    {/* Top Watermark */}
                    <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase text-slate-400 border-b border-slate-100 pb-2.5 relative z-10">
                      <span className="flex items-center gap-1 text-slate-950 font-black italic">
                        <Flame className="w-4 h-4 text-red-600 fill-red-600" />
                        ROAST ARENA
                      </span>
                      <span className="text-[10px] font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                        LIVE CLASH
                      </span>
                    </div>

                    {/* Main 1v1 Split Graphic */}
                    <div className="space-y-4 text-center relative z-10 my-auto">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-2">
                        {battle.title}
                      </h4>

                      <div className="flex items-center justify-between gap-4 px-2">
                        {/* Brand A */}
                        <div className="text-center space-y-1">
                          <div
                            className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl p-1 bg-white border border-slate-200 mx-auto shadow-xs flex items-center justify-center font-black text-slate-900 text-base"
                            style={{ borderColor: brandAColor }}
                          >
                            {battle.brandA.logoUrl ? (
                              <img
                                src={battle.brandA.logoUrl}
                                alt={battle.brandA.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              battle.brandA.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="font-extrabold text-xs text-slate-900">
                            {battle.brandA.name}
                          </div>
                          <div
                            className="font-mono font-black text-base"
                            style={{ color: brandAColor }}
                          >
                            {percentA}%
                          </div>
                        </div>

                        <span className="font-black italic text-slate-300 text-sm">VS</span>

                        {/* Brand B */}
                        <div className="text-center space-y-1">
                          <div
                            className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl p-1 bg-white border border-slate-200 mx-auto shadow-xs flex items-center justify-center font-black text-slate-900 text-base"
                            style={{ borderColor: brandBColor }}
                          >
                            {battle.brandB.logoUrl ? (
                              <img
                                src={battle.brandB.logoUrl}
                                alt={battle.brandB.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              battle.brandB.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="font-extrabold text-xs text-slate-900">
                            {battle.brandB.name}
                          </div>
                          <div
                            className="font-mono font-black text-base"
                            style={{ color: brandBColor }}
                          >
                            {percentB}%
                          </div>
                        </div>
                      </div>

                      {/* Tug of war bar */}
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 p-0.5">
                        <div
                          className="h-full rounded-l-full transition-all"
                          style={{
                            width: `${percentA}%`,
                            backgroundColor: brandAColor,
                          }}
                        />
                        <div
                          className="h-full rounded-r-full transition-all"
                          style={{
                            width: `${percentB}%`,
                            backgroundColor: brandBColor,
                          }}
                        />
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2.5 border-t border-slate-100 relative z-10">
                      <span>{total.toLocaleString()} Votes Cast</span>
                      <span className="font-sans font-bold text-slate-900">
                        Vote at RoastArena.com 🥊
                      </span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  disabled={isExporting}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{isExporting ? "Generating PNG Graphic..." : "Download High-Res Match Graphic"}</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
