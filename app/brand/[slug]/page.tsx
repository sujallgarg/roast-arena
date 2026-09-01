import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Swords, ArrowLeft, CheckCircle2 } from "lucide-react";

export const revalidate = 30;

export default async function PublicBrandProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const brand = await prisma.brand.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
    },
    include: {
      battlesAsBrandA: { include: { brandB: true } },
      battlesAsBrandB: { include: { brandA: true } },
    },
  });

  if (!brand) {
    // Fallback brand profile for demo
    return (
      <div className="space-y-8 pb-16 max-w-4xl mx-auto text-slate-900">
        <Link
          href="/battles"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Battles</span>
        </Link>

        <div className="glass-card rounded-3xl p-8 border border-slate-200 bg-white text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-100 p-2 border-2 border-emerald-500 shadow-md mx-auto flex items-center justify-center text-slate-900 font-black text-2xl uppercase">
            {slug.slice(0, 2)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-black uppercase text-slate-900">{slug.replace("-", " ")}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase border border-emerald-200">
                ✓ VERIFIED BRAND
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium font-mono">@{slug.toLowerCase()}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Battles</span>
              <strong className="text-slate-900 block font-mono text-base">3</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Win Rate</span>
              <strong className="text-emerald-600 block font-mono text-base">67%</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Savage Rank</span>
              <strong className="text-amber-600 block font-mono text-base">#2</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalBattles = brand.battlesAsBrandA.length + brand.battlesAsBrandB.length;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto text-slate-900">
      <Link
        href="/battles"
        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Battles</span>
      </Link>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white space-y-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white p-1 border-2 border-emerald-500 shadow-md flex items-center justify-center overflow-hidden">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-14 h-14 object-contain rounded-full"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-slate-900 uppercase">{brand.name}</h1>
                {brand.verifiedBadge && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    VERIFIED BRAND
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-500 font-mono">{brand.handle}</p>
            </div>
          </div>

          <Link
            href={`/battles/new`}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>Challenge Brand</span>
          </Link>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {brand.description || "Official brand competitor in ROAST ARENA."}
        </p>

        {/* Brand Telemetry Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Battles</span>
            <strong className="text-slate-900 block font-mono text-lg">{totalBattles}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Win Rate</span>
            <strong className="text-emerald-600 block font-mono text-lg">75%</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Savage Score</span>
            <strong className="text-amber-600 block font-mono text-lg">4,890</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Official Rank</span>
            <strong className="text-blue-600 block font-mono text-lg">#3</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
