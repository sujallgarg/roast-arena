"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Building2, Swords, ArrowRight } from "lucide-react";

export default function GlobalSearchPage() {
  const [query, setQuery] = useState("");

  const sampleBrands = [
    { name: "Swiggy", handle: "@swiggy", category: "Food & Delivery", verified: true, slug: "swiggy" },
    { name: "Zomato", handle: "@zomato", category: "Food & Delivery", verified: true, slug: "zomato" },
    { name: "Nike", handle: "@nike", category: "Apparel & Footwear", verified: true, slug: "nike" },
    { name: "Adidas", handle: "@adidas", category: "Apparel & Footwear", verified: true, slug: "adidas" },
    { name: "The Burger Club", handle: "@burgerclub", category: "Food & Delivery", verified: false, slug: "burger-club" },
  ];

  const sampleBattles = [
    { title: "Swiggy vs Zomato: Delivery Speed Showdown", category: "Food & Delivery", slug: "swiggy-vs-zomato" },
    { title: "Nike vs Adidas: Sneaker Culture War", category: "Apparel & Footwear", slug: "nike-vs-adidas" },
  ];

  const filteredBrands = sampleBrands.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.handle.toLowerCase().includes(query.toLowerCase())
  );

  const filteredBattles = sampleBattles.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto text-slate-900">
      <div className="space-y-2 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight text-slate-900">
          Search ROAST <span className="text-red-600">ARENA</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          Search for rival brands, live battles, categories, or voter handles across the platform.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brands e.g. Nike, Swiggy, Zomato..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm"
        />
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Brands Found */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>MATCHING BRANDS ({filteredBrands.length})</span>
          </h3>

          <div className="space-y-2.5">
            {filteredBrands.map((b) => (
              <Link
                key={b.slug}
                href={`/brand/${b.slug}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase">
                      {b.name}
                    </strong>
                    {b.verified && (
                      <span className="text-emerald-600 font-black text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{b.handle} • {b.category}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Battles Found */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Swords className="w-4 h-4 text-red-600" />
            <span>MATCHING BATTLES ({filteredBattles.length})</span>
          </h3>

          <div className="space-y-2.5">
            {filteredBattles.map((b) => (
              <Link
                key={b.slug}
                href={`/?battle=${b.slug}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-400 transition-all group"
              >
                <div>
                  <strong className="text-xs font-extrabold text-slate-900 group-hover:text-red-600 transition-colors block">
                    {b.title}
                  </strong>
                  <span className="text-[11px] font-mono text-slate-500">{b.category}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
