"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swords, Upload, Sparkles, CheckCircle2 } from "lucide-react";

export default function CreateBattlePage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.user) {
          router.replace("/login?redirect=/battles/new");
        }
      })
      .catch(() => {
        router.replace("/login?redirect=/battles/new");
      });
  }, [router]);
  const [brand1, setBrand1] = useState("Swiggy");
  const [brand2, setBrand2] = useState("Zomato");
  const [category, setCategory] = useState("Food & Delivery");
  const [rounds, setRounds] = useState("3");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);

    // Simulate battle launch creation
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg("🔥 New 1v1 Battle Arena created successfully!");
      setTimeout(() => {
        router.push("/battles");
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-3xl mx-auto text-slate-900">
      {/* Header matching View 8 */}
      <div className="space-y-1 border-b border-slate-200 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[11px] font-black uppercase tracking-wider">
          <Swords className="w-3.5 h-3.5" />
          <span>ARENA MANAGEMENT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase italic tracking-tight">
          CREATE A <span className="text-red-600">NEW BATTLE</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          Set up a new 1v1 brand duel arena for crowd voting.
        </p>
      </div>

      {/* Form Card matching View 8 screenshot */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white text-slate-900 shadow-sm space-y-6">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Battle Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Battle Title / Tagline
            </label>
            <input
              type="text"
              placeholder="e.g. The Great Food Delivery Showdown: Midnight Cravings"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>

          {/* Brand 1 & Brand 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-red-600">
                Brand 1 (Contender A)
              </label>
              <select
                value={brand1}
                onChange={(e) => setBrand1(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Swiggy">Swiggy (@swiggy)</option>
                <option value="Nike">Nike (@nike)</option>
                <option value="Apple">Apple (@apple)</option>
                <option value="Notion">Notion (@notionhq)</option>
                <option value="McDonald's">McDonald&apos;s (@mcdonalds)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                Brand 2 (Contender B)
              </label>
              <select
                value={brand2}
                onChange={(e) => setBrand2(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Zomato">Zomato (@zomato)</option>
                <option value="Adidas">Adidas (@adidas)</option>
                <option value="Samsung">Samsung (@samsung)</option>
                <option value="Obsidian">Obsidian (@obsdmd)</option>
                <option value="Burger King">Burger King (@burgerking)</option>
              </select>
            </div>
          </div>

          {/* Category & Rounds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Food & Delivery">Food & Delivery</option>
                <option value="Tech & Devices">Tech & Devices</option>
                <option value="Fashion & Shoes">Fashion & Shoes</option>
                <option value="Productivity">Productivity</option>
                <option value="Gaming">Gaming</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Number of Rounds
              </label>
              <select
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="3">Best of 3 Rounds</option>
                <option value="5">Best of 5 Rounds</option>
              </select>
            </div>
          </div>

          {/* Upload Logos Area matching View 8 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2 hover:border-slate-300 transition-all cursor-pointer">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <span className="text-xs font-bold text-slate-700 block">
                Upload Brand 1 Logo
              </span>
              <span className="text-[10px] text-slate-400 block">PNG or SVG format</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2 hover:border-slate-300 transition-all cursor-pointer">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <span className="text-xs font-bold text-slate-700 block">
                Upload Brand 2 Logo
              </span>
              <span className="text-[10px] text-slate-400 block">PNG or SVG format</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? "Launching Arena..." : "Launch 1v1 Battle Arena 🔥"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
