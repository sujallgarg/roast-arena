"use client";

import { useState } from "react";
import { ShieldCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";

export interface RoastPostItem {
  id: string;
  authorBrandId: string;
  roundNumber: number;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  likesCount: number;
  createdAt: Date | string;
  authorBrand: {
    id: string;
    name: string;
    handle: string;
    logoUrl: string;
    verifiedBadge: boolean;
    brandColor: string;
  };
}

interface RoastBubbleProps {
  post: RoastPostItem;
  isBrandA: boolean;
  brandAColor: string;
  brandBColor: string;
}

export function RoastBubble({
  post,
  isBrandA,
}: RoastBubbleProps) {
  const [likes, setLikes] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const brandColor = post.authorBrand.brandColor || (isBrandA ? "#ef4444" : "#3b82f6");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 sm:gap-4 my-4 ${
        isBrandA ? "flex-row justify-start" : "flex-row-reverse justify-start"
      }`}
    >
      {/* Brand Avatar */}
      <div className="shrink-0 pt-1">
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-0.5 bg-white border border-slate-700 shadow-md relative"
          style={{ borderColor: `${brandColor}aa` }}
        >
          <div className="w-full h-full rounded-lg overflow-hidden relative bg-white flex items-center justify-center font-bold text-xs">
            {post.authorBrand.logoUrl ? (
              <img
                src={post.authorBrand.logoUrl}
                alt={post.authorBrand.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            <span className="absolute text-xs font-black text-slate-900">
              {post.authorBrand.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Roast Chat Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] space-y-2 rounded-2xl p-4 sm:p-5 border shadow-md relative text-left bg-white text-slate-900 ${
          isBrandA
            ? "rounded-tl-xs border-red-300"
            : "rounded-tr-xs border-blue-300"
        }`}
        style={{
          borderLeftColor: isBrandA ? brandColor : undefined,
          borderRightColor: !isBrandA ? brandColor : undefined,
          borderLeftWidth: isBrandA ? "4px" : undefined,
          borderRightWidth: !isBrandA ? "4px" : undefined,
        }}
      >
        {/* Header line: Name, Badge, Round tag, Timestamp */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
              {post.authorBrand.name}
            </span>
            {post.authorBrand.verifiedBadge && (
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            )}
            <span className="text-[11px] font-mono text-slate-400">
              {post.authorBrand.handle}
            </span>
          </div>

          <span
            className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
            style={{
              backgroundColor: `${brandColor}22`,
              color: brandColor,
            }}
          >
            Round {post.roundNumber}
          </span>
        </div>

        {/* Text Content */}
        <p className="text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-wrap text-slate-800">
          {post.content}
        </p>

        {/* Optional Media Attachment */}
        {post.mediaUrl && (
          <div className="pt-2">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-72">
              <img
                src={post.mediaUrl}
                alt="Roast attachment"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer Actions: Like Button & Share */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all active:scale-95 cursor-pointer ${
              hasLiked
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                hasLiked ? "fill-rose-500 text-rose-600" : ""
              }`}
            />
            <span>{likes.toLocaleString()}</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>
              {new Date(post.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
