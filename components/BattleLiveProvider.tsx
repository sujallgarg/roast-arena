"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  BATTLE_POLL_INTERVAL_LIVE_MS,
  BATTLE_POLL_INTERVAL_HIDDEN_MS,
} from "@/lib/constants";
import { ReactionType } from "@/lib/emojiBurst";

export interface CommentItem {
  id: string;
  authorName: string;
  authorHandle?: string | null;
  authorAvatar: string;
  content: string;
  upvotesCount: number;
  createdAt: Date | string;
}

interface UserVoteState {
  chosenBrandId: string;
  reactionType: string;
}

interface BattleLiveContextType {
  battleId: string;
  battleStatus: string;
  votesCountA: number;
  votesCountB: number;
  totalVotes: number;
  percentA: number;
  percentB: number;
  comments: CommentItem[];
  userVote: UserVoteState | null;
  castVote: (chosenBrandId: string, reactionType?: ReactionType) => Promise<void>;
  postComment: (authorName: string, authorHandle: string, content: string) => Promise<void>;
  upvoteComment: (commentId: string) => Promise<void>;
  refetchLiveState: () => Promise<void>;
}

const BattleLiveContext = createContext<BattleLiveContextType | null>(null);

interface BattleLiveProviderProps {
  battleId: string;
  battleStatus: string;
  initialVotesCountA: number;
  initialVotesCountB: number;
  initialComments: CommentItem[];
  children: React.ReactNode;
}

export function BattleLiveProvider({
  battleId,
  battleStatus,
  initialVotesCountA,
  initialVotesCountB,
  initialComments = [],
  children,
}: BattleLiveProviderProps) {
  const [votesCountA, setVotesCountA] = useState(initialVotesCountA);
  const [votesCountB, setVotesCountB] = useState(initialVotesCountB);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [userVote, setUserVote] = useState<UserVoteState | null>(null);

  const totalVotes = votesCountA + votesCountB;
  const percentA = totalVotes > 0 ? Math.round((votesCountA / totalVotes) * 100) : 50;
  const percentB = 100 - percentA;

  // Single fetcher function for deduplicated live updates
  const refetchLiveState = useCallback(async () => {
    if (!battleId) return;

    try {
      // 1. Fetch vote status
      const voteRes = await fetch(`/api/battles/${battleId}/vote`, { cache: "no-store" });
      if (voteRes.ok) {
        const voteData = await voteRes.json();
        if (voteData.votesCountA !== undefined && voteData.votesCountB !== undefined) {
          setVotesCountA(voteData.votesCountA);
          setVotesCountB(voteData.votesCountB);
        }
        if (voteData.userVote) {
          setUserVote(voteData.userVote);
        }
      }

      // 2. Fetch comments status
      const commentsRes = await fetch(`/api/battles/${battleId}/comments`, { cache: "no-store" });
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        if (commentsData.comments && Array.isArray(commentsData.comments)) {
          setComments((prevComments) => {
            const existingMap = new Map(prevComments.map((c) => [c.id, c]));
            let updated = false;

            commentsData.comments.forEach((incoming: CommentItem) => {
              const existing = existingMap.get(incoming.id);
              if (!existing) {
                existingMap.set(incoming.id, incoming);
                updated = true;
              } else if (existing.upvotesCount !== incoming.upvotesCount) {
                existingMap.set(incoming.id, {
                  ...incoming,
                  upvotesCount: Math.max(existing.upvotesCount, incoming.upvotesCount),
                });
                updated = true;
              }
            });

            return updated ? Array.from(existingMap.values()) : prevComments;
          });
        }
      }
    } catch (err) {
      console.error("Error fetching live battle state:", err);
    }
  }, [battleId]);

  // Single Smart Polling Effect
  useEffect(() => {
    // If battle is ENDED, do NOT poll (0 requests)
    if (battleStatus === "ENDED") return;

    let timerId: NodeJS.Timeout;

    const scheduleNextPoll = () => {
      const isHidden = typeof document !== "undefined" && document.hidden;
      const intervalMs = isHidden
        ? BATTLE_POLL_INTERVAL_HIDDEN_MS
        : BATTLE_POLL_INTERVAL_LIVE_MS;

      timerId = setTimeout(async () => {
        if (typeof document !== "undefined" && !document.hidden) {
          await refetchLiveState();
        }
        scheduleNextPoll();
      }, intervalMs);
    };

    scheduleNextPoll();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchLiveState();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      clearTimeout(timerId);
      if (typeof window !== "undefined") {
        window.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [battleStatus, refetchLiveState]);

  // Optimized Cast Vote Action
  const castVote = useCallback(
    async (chosenBrandId: string, reactionType: ReactionType = "SAVAGE") => {
      // Optimistic update
      setUserVote({ chosenBrandId, reactionType });

      try {
        const res = await fetch(`/api/battles/${battleId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chosenBrandId, reactionType }),
        });

        const data = await res.json();
        if (res.ok && data.votesCountA !== undefined && data.votesCountB !== undefined) {
          setVotesCountA(data.votesCountA);
          setVotesCountB(data.votesCountB);
        }
      } catch (err) {
        console.error("Failed to cast vote:", err);
      }
    },
    [battleId]
  );

  // Optimized Post Comment Action
  const postComment = useCallback(
    async (authorName: string, authorHandle: string, content: string) => {
      const tempId = `temp-${Date.now()}`;
      const tempComment: CommentItem = {
        id: tempId,
        authorName,
        authorHandle: authorHandle || `@${authorName.toLowerCase().replace(/\s+/g, "_")}`,
        authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`,
        content,
        upvotesCount: 1,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [tempComment, ...prev]);

      try {
        const res = await fetch(`/api/battles/${battleId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorName, authorHandle, content }),
        });

        const data = await res.json();
        if (res.ok && data.comment) {
          setComments((prev) =>
            prev.map((c) => (c.id === tempId ? data.comment : c))
          );
        }
      } catch (err) {
        console.error("Failed to post comment:", err);
      }
    },
    [battleId]
  );

  // Optimized Upvote Comment Action
  const upvoteComment = useCallback(
    async (commentId: string) => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, upvotesCount: c.upvotesCount + 1 } : c
        )
      );

      try {
        await fetch(`/api/battles/${battleId}/comments`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commentId, action: "upvote" }),
        });
      } catch (err) {
        console.error("Failed to upvote comment:", err);
      }
    },
    [battleId]
  );

  return (
    <BattleLiveContext.Provider
      value={{
        battleId,
        battleStatus,
        votesCountA,
        votesCountB,
        totalVotes,
        percentA,
        percentB,
        comments,
        userVote,
        castVote,
        postComment,
        upvoteComment,
        refetchLiveState,
      }}
    >
      {children}
    </BattleLiveContext.Provider>
  );
}

export function useBattleLive() {
  return useContext(BattleLiveContext);
}
