"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";

interface PendingBrand {
  id: string;
  name: string;
  handle: string;
  verifiedBadge: boolean;
  contactEmail: string | null;
  website: string | null;
}

export default function AdminModerationPage() {
  const [brands, setBrands] = useState<PendingBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBrands(data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBrands();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleApproveBrand = async (brandId: string) => {
    try {
      await fetch("/api/business/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, verifiedBadge: true }),
      });
      setActionSuccess(`Brand approved successfully!`);
      fetchBrands();
    } catch {
      alert("Failed to update brand status");
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto text-slate-900">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Center</span>
        </Link>
        <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          ADMIN MODERATION QUEUE
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
          Content & Brand Moderation
        </h1>
        <p className="text-xs text-slate-600 font-medium">
          Approve or reject pending brand applications and battle roast submissions.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Brands Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
            BRAND REGISTRATION APPLICATIONS ({brands.length})
          </h3>
          <button
            onClick={fetchBrands}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading moderation queue...</div>
        ) : brands.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No pending brands.</div>
        ) : (
          <div className="space-y-3">
            {brands.map((b) => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-900 font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{b.name}</h4>
                      {b.verifiedBadge ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-200">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase border border-amber-200">
                          PENDING
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      {b.handle} • {b.contactEmail || "No email"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!b.verifiedBadge && (
                    <button
                      onClick={() => handleApproveBrand(b.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Brand</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
