"use client";

import { useState } from "react";
import { Flame, Check } from "lucide-react";
import { triggerConfettiBurst, triggerEmojiExplosion, ReactionType } from "@/lib/emojiBurst";
import { motion, AnimatePresence } from "framer-motion";

interface VotePanelProps {
  battleId: string;
  brandA: {
    id: string;
    name: string;
    brandColor: string;
  };
  brandB: {
    id: string;
    name: string;
    brandColor: string;
  };
  onVoteSuccess?: (data: {
    votesCountA: number;
    votesCountB: number;
    chosenBrandId: string;
  }) => void;
}

export function VotePanel({
  battleId,
  brandA,
  brandB,
  onVoteSuccess,
}: VotePanelProps) {
  const [selectedSide, setSelectedSide] = useState<"A" | "B" | null>(null);
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleVote = async (
    side: "A" | "B",
    reaction: ReactionType,
    event: React.MouseEvent
  ) => {
    const chosenBrand = side === "A" ? brandA : brandB;

    // 1. Trigger instantaneous haptic visual particle explosion
    triggerEmojiExplosion(reaction, event);
    if (reaction === "SAVAGE") {
      triggerConfettiBurst(chosenBrand.brandColor);
    }

    // 2. Set optimistic client state
    setSelectedSide(side);
    setActiveReaction(reaction);
    setFeedbackMsg(`Voted ${reaction} for ${chosenBrand.name}! 🔥`);

    // Clear feedback message after 3s
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3000);

    setIsSubmitting(true);

    try {
      // 3. Post to API route
      const res = await fetch(`/api/battles/${battleId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chosenBrandId: chosenBrand.id,
          reactionType: reaction,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (onVoteSuccess) {
          onVoteSuccess({
            votesCountA: data.votesCountA,
            votesCountB: data.votesCountB,
            chosenBrandId: chosenBrand.id,
          });
        }
      }
    } catch (err) {
      console.error("Failed to submit vote:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reactionButtons: { type: ReactionType; label: string; emoji: string; colorClass: string }[] = [
    {
      type: "SAVAGE",
      label: "Savage",
      emoji: "🔥",
      colorClass: "hover:bg-amber-50 hover:border-amber-300 text-amber-900",
    },
    {
      type: "MID",
      label: "Mid",
      emoji: "🥱",
      colorClass: "hover:bg-slate-100 hover:border-slate-300 text-slate-700",
    },
    {
      type: "CRINGE",
      label: "Cringe",
      emoji: "💀",
      colorClass: "hover:bg-rose-50 hover:border-rose-300 text-rose-900",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
            Cast Your Vote — Who Won the Banter?
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          1 Vote per IP • Live Swing
        </span>
      </div>

      {/* Floating Feedback Notification */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{feedbackMsg}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Recorded</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split Reaction Voting Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Brand A Side Reactions */}
        <div
          className={`p-4 rounded-xl border transition-all space-y-3 ${
            selectedSide === "A"
              ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: brandA.brandColor }}
              />
              {brandA.name}
            </span>
            {selectedSide === "A" && (
              <span className="text-[10px] uppercase font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                Your Vote
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {reactionButtons.map((btn) => {
              const isSelected = selectedSide === "A" && activeReaction === btn.type;
              return (
                <button
                  key={btn.type}
                  onClick={(e) => handleVote("A", btn.type, e)}
                  disabled={isSubmitting}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : `bg-white border-slate-200 ${btn.colorClass}`
                  }`}
                >
                  <span className="text-base">{btn.emoji}</span>
                  <span className="text-[11px]">{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand B Side Reactions */}
        <div
          className={`p-4 rounded-xl border transition-all space-y-3 ${
            selectedSide === "B"
              ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: brandB.brandColor }}
              />
              {brandB.name}
            </span>
            {selectedSide === "B" && (
              <span className="text-[10px] uppercase font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                Your Vote
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {reactionButtons.map((btn) => {
              const isSelected = selectedSide === "B" && activeReaction === btn.type;
              return (
                <button
                  key={btn.type}
                  onClick={(e) => handleVote("B", btn.type, e)}
                  disabled={isSubmitting}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : `bg-white border-slate-200 ${btn.colorClass}`
                  }`}
                >
                  <span className="text-base">{btn.emoji}</span>
                  <span className="text-[11px]">{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
