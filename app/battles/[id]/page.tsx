import { prisma } from "@/lib/prisma";
import { DuelArena } from "@/components/DuelArena";
import { AudienceHeckles } from "@/components/AudienceHeckles";
import { BattleLiveProvider } from "@/components/BattleLiveProvider";
import { ArrowLeft, Swords } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 10;

export default async function BattleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: battleIdOrSlug } = await params;

  // Fetch battle details on the server
  const battle = await prisma.battle.findFirst({
    where: {
      OR: [{ id: battleIdOrSlug }, { slug: battleIdOrSlug }],
    },
    include: {
      brandA: true,
      brandB: true,
      roastPosts: {
        include: { authorBrand: true },
        orderBy: { roundNumber: "asc" },
      },
      comments: {
        orderBy: { upvotesCount: "desc" },
        take: 25,
      },
    },
  });

  if (!battle) {
    notFound();
  }

  return (
    <BattleLiveProvider
      battleId={battle.id}
      battleStatus={battle.status}
      initialVotesCountA={battle.votesCountA}
      initialVotesCountB={battle.votesCountB}
      initialComments={battle.comments}
    >
      <div className="space-y-8 pb-16 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link
            href="/battles"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Battles</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
            <Swords className="w-4 h-4 text-red-600" />
            <span>{battle.title}</span>
          </div>
        </div>

        {/* Duel Arena Stage */}
        <DuelArena battle={battle} />

        {/* Audience Heckles Feed */}
        <section id="comments-section" className="max-w-5xl mx-auto">
          <AudienceHeckles battleId={battle.id} initialComments={battle.comments} />
        </section>
      </div>
    </BattleLiveProvider>
  );
}
