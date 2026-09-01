"use client";

import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, Send, User, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface CommentItem {
  id: string;
  authorName: string;
  authorHandle?: string | null;
  authorAvatar: string;
  content: string;
  upvotesCount: number;
  createdAt: Date | string;
}

interface AudienceHecklesProps {
  battleId: string;
  initialComments: CommentItem[];
}

import { useBattleLive } from "./BattleLiveProvider";

export function AudienceHeckles({
  battleId,
  initialComments = [],
}: AudienceHecklesProps) {
  const liveContext = useBattleLive();
  const [localComments, setLocalComments] = useState<CommentItem[]>(initialComments);
  const [sortBy, setSortBy] = useState<"TOP" | "LATEST">("TOP");

  const comments = liveContext ? liveContext.comments : localComments;

  // Form State
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  // Sort comments based on state
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "TOP") {
      return b.upvotesCount - a.upvotesCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Automatically fetch logged-in user from session
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem("coroast_voter_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) {
            setAuthorName(parsed.name);
          }
        }
      } catch {
        // fallback
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmitHeckle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setIsSubmitting(true);

    if (liveContext) {
      await liveContext.postComment(
        authorName.trim(),
        `@${authorName.trim().toLowerCase().replace(/\s+/g, "_")}`,
        content.trim()
      );
      setContent("");
      setIsSubmitting(false);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newCommentObj: CommentItem = {
      id: tempId,
      authorName: authorName.trim(),
      authorHandle: `@${authorName.trim().toLowerCase().replace(/\s+/g, "_")}`,
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        authorName.trim()
      )}`,
      content: content.trim(),
      upvotesCount: 1,
      createdAt: new Date().toISOString(),
    };

    setLocalComments((prev) => [newCommentObj, ...prev]);
    setContent("");

    try {
      const res = await fetch(`/api/battles/${battleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: newCommentObj.authorName,
          authorHandle: newCommentObj.authorHandle,
          content: newCommentObj.content,
        }),
      });

      const data = await res.json();
      if (res.ok && data.comment) {
        setLocalComments((prev) =>
          prev.map((c) => (c.id === tempId ? data.comment : c))
        );
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (commentId: string) => {
    const hasUpvoted = upvotedIds[commentId];
    setUpvotedIds((prev) => ({ ...prev, [commentId]: !hasUpvoted }));

    if (liveContext) {
      await liveContext.upvoteComment(commentId);
      return;
    }

    setLocalComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              upvotesCount: hasUpvoted
                ? c.upvotesCount - 1
                : c.upvotesCount + 1,
            }
          : c
      )
    );

    try {
      await fetch(`/api/battles/${battleId}/comments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          action: hasUpvoted ? "downvote" : "upvote",
        }),
      });
    } catch (err) {
      console.error("Failed to update upvote:", err);
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 bg-white shadow-sm">
      {/* Header with Live Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <MessageSquare className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Audience Heckles
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                {comments.length}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                LIVE CHAT
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Join the live crowd banter! Comments auto-update in real-time.
            </p>
          </div>
        </div>

        {/* Sort Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSortBy("TOP")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              sortBy === "TOP"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🔥 Most Savage
          </button>
          <button
            onClick={() => setSortBy("LATEST")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              sortBy === "LATEST"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ⚡️ Live Feed
          </button>
        </div>
      </div>

      {/* Live Heckle Submission Form */}
      <form
        onSubmit={handleSubmitHeckle}
        className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Your Name (e.g. Alex River)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Drop your live heckle or roast reaction..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Posting as <strong className="text-slate-900">{authorName ? `@${authorName}` : "Guest"}</strong></span>
          </span>

          <button
            type="submit"
            disabled={isSubmitting || !authorName.trim() || !content.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-white" />
            <span>{isSubmitting ? "Posting..." : "Drop Live Heckle 🔥"}</span>
          </button>
        </div>
      </form>

      {/* Heckles Feed List with Animated Entries */}
      <div className="space-y-3 pt-1">
        <AnimatePresence mode="popLayout">
          {sortedComments.map((comment) => {
            const hasUpvoted = upvotedIds[comment.id];

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-start justify-between gap-4 hover:border-slate-300 transition-all group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shrink-0 overflow-hidden relative shadow-xs">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold text-slate-900 truncate group-hover:text-red-600 transition-colors">
                        {comment.authorName}
                      </span>
                      {comment.authorHandle && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {comment.authorHandle}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleUpvote(comment.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer ${
                    hasUpvoted
                      ? "bg-amber-100 text-amber-700 border-amber-300"
                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  <ThumbsUp
                    className={`w-3.5 h-3.5 ${
                      hasUpvoted ? "fill-amber-600 text-amber-600" : ""
                    }`}
                  />
                  <span>{comment.upvotesCount}</span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
