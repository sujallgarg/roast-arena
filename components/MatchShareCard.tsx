"use client";

import { useRef, useState } from "react";
import { Download, Share2, Check, Flame, X, Copy, Camera } from "lucide-react";
import { toPng } from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";

interface MatchShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  battle: {
    title: string;
    brandA: { name: string; handle: string; logoUrl: string; brandColor: string };
    brandB: { name: string; handle: string; logoUrl: string; brandColor: string };
    votesCountA: number;
    votesCountB: number;
    topRoast?: string;
  };
}

export function MatchShareCard({
  isOpen,
  onClose,
  battle,
}: MatchShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<"TWITTER" | "INSTAGRAM">("TWITTER");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const total = battle.votesCountA + battle.votesCountB;
  const percentA = total > 0 ? Math.round((battle.votesCountA / total) * 100) : 50;
  const percentB = 100 - percentA;

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `brandbanter-${battle.brandA.name.toLowerCase()}-vs-${battle.brandB.name.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image card:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 z-10 overflow-hidden my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Export Shareable Match Card
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format Selector Tabs */}
            <div className="flex items-center gap-2 justify-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setFormat("TWITTER")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                  format === "TWITTER"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>X / Twitter (16:9 Landscape)</span>
              </button>

              <button
                onClick={() => setFormat("INSTAGRAM")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                  format === "INSTAGRAM"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Camera className="w-4 h-4 text-pink-500" />
                <span>Instagram Story (9:16 Portrait)</span>
              </button>
            </div>

            {/* Visual HTML Preview Card (Export Target) */}
            <div className="flex justify-center overflow-hidden py-2">
              <div
                ref={cardRef}
                className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-lg select-none ${
                  format === "TWITTER"
                    ? "w-full max-w-xl aspect-[16/9]"
                    : "w-72 aspect-[9/16]"
                }`}
              >
                {/* Background Brand Glows */}
                <div
                  className="absolute -top-16 -left-16 w-56 h-56 rounded-full blur-2xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: battle.brandA.brandColor }}
                />
                <div
                  className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-2xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: battle.brandB.brandColor }}
                />

                {/* Top Watermark */}
                <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase text-slate-400 border-b border-slate-100 pb-3 relative z-10">
                  <span className="flex items-center gap-1 text-slate-900">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    BrandBanter
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    LIVE ARENA CLASH
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
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 bg-white border border-slate-200 mx-auto shadow-sm flex items-center justify-center font-black text-slate-900 text-lg"
                        style={{ borderColor: battle.brandA.brandColor }}
                      >
                        {battle.brandA.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="font-extrabold text-xs text-slate-900">
                        {battle.brandA.name}
                      </div>
                      <div
                        className="font-mono font-black text-base"
                        style={{ color: battle.brandA.brandColor }}
                      >
                        {percentA}%
                      </div>
                    </div>

                    <span className="font-black italic text-slate-300 text-sm">VS</span>

                    {/* Brand B */}
                    <div className="text-center space-y-1">
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 bg-white border border-slate-200 mx-auto shadow-sm flex items-center justify-center font-black text-slate-900 text-lg"
                        style={{ borderColor: battle.brandB.brandColor }}
                      >
                        {battle.brandB.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="font-extrabold text-xs text-slate-900">
                        {battle.brandB.name}
                      </div>
                      <div
                        className="font-mono font-black text-base"
                        style={{ color: battle.brandB.brandColor }}
                      >
                        {percentB}%
                      </div>
                    </div>
                  </div>

                  {/* Tug of war bar representation */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 p-0.5">
                    <div
                      className="h-full rounded-l-full"
                      style={{
                        width: `${percentA}%`,
                        backgroundColor: battle.brandA.brandColor,
                      }}
                    />
                    <div
                      className="h-full rounded-r-full"
                      style={{
                        width: `${percentB}%`,
                        backgroundColor: battle.brandB.brandColor,
                      }}
                    />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-100 relative z-10">
                  <span>{total.toLocaleString()} Votes Cast</span>
                  <span className="font-sans font-bold text-slate-900">
                    Vote at BrandBanter.com 🚀
                  </span>
                </div>
              </div>
            </div>

            {/* Action Export Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDownloadPNG}
                disabled={isExporting}
                className="py-3 px-4 rounded-2xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{isExporting ? "Generating PNG..." : "Download High-Res PNG"}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="py-3 px-4 rounded-2xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200 active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Battle Link</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
