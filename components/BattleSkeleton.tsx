"use client";

export function BattleSkeleton() {
  return (
    <div className="animate-pulse space-y-8 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header Skeleton */}
      <div className="h-10 bg-slate-200 rounded-2xl w-3/4 mx-auto" />
      <div className="h-5 bg-slate-200 rounded-xl w-1/2 mx-auto" />

      {/* Main Duel Arena Card Skeleton */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Brand vs Brand Header Skeleton */}
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-slate-200 rounded-2xl shrink-0" />
            <div className="space-y-2 w-full">
              <div className="h-5 bg-slate-200 rounded-lg w-32" />
              <div className="h-3 bg-slate-200 rounded-lg w-20" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <div className="space-y-2 text-right w-full">
              <div className="h-5 bg-slate-200 rounded-lg w-32 ml-auto" />
              <div className="h-3 bg-slate-200 rounded-lg w-20 ml-auto" />
            </div>
            <div className="w-14 h-14 bg-slate-200 rounded-2xl shrink-0" />
          </div>
        </div>

        {/* Vote Progress Bar Skeleton */}
        <div className="h-6 bg-slate-200 rounded-full w-full" />

        {/* Roast Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="h-32 bg-slate-100 border border-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-100 border border-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
