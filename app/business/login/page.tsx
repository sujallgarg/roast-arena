"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, ArrowRight, Key, AlertCircle, Clock, Plus } from "lucide-react";
import Link from "next/link";

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  handle: string;
  logoUrl: string;
  brandColor: string;
  verifiedBadge: boolean;
  accessCode: string;
  contactEmail: string;
}

export default function BusinessLoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  
  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regHandle, setRegHandle] = useState("");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail("");
      setAccessCode("");
      setSelectedBrandId("");
      if (formRef.current) {
        formRef.current.reset();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch("/api/brands");
        if (res.ok) {
          const data = await res.json();
          if (data.brands) {
            setBrands(data.brands);
          }
        }
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    }
    fetchBrands();
  }, []);

  const handleDemoLogin = async (brandId: string, demoEmail?: string, demoCode?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/business/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          email: demoEmail,
          accessCode: demoCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/business/dashboard");
      } else {
        setErrorMsg(data.error || "Login failed.");
      }
    } catch {
      setErrorMsg("Network error trying to log in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !selectedBrandId) {
      setErrorMsg("Please enter your work email or select a brand.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/business/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrandId || undefined,
          email: email.trim() || undefined,
          accessCode: accessCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/business/dashboard");
      } else {
        setErrorMsg(data.error || "Authentication failed.");
      }
    } catch {
      setErrorMsg("Network error processing corporate login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.trim() || !regHandle.trim()) {
      setErrorMsg("Please provide your work email and official social handle.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/brands/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: regName.trim() || undefined,
          workEmail: regEmail.trim(),
          socialHandle: regHandle.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/business/dashboard");
      } else {
        setErrorMsg(data.error || "Business registration failed.");
      }
    } catch {
      setErrorMsg("Network error processing business registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifiedBrands = brands.filter((b) => b.verifiedBadge);
  const pendingBrands = brands.filter((b) => !b.verifiedBadge);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 text-slate-900">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-black uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>OFFICIAL BRAND PORTAL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase italic tracking-tight">
            BRAND <span className="text-blue-600">COMMAND CENTER</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
            Log in to publish official roasts, manage voter discount perks, and track savage arena analytics.
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 bg-white text-slate-900 shadow-sm space-y-6 relative overflow-hidden">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Credentials Panel */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-600" />
                DEMO LOGIN CREDENTIALS
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                1-Click Access
              </span>
            </div>

            <div className="space-y-3">
              {/* Verified Brands */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  VERIFIED BRANDS (Full Dashboard Access):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleDemoLogin("swiggy", "swiggy@coroast.com", "SWIGGY2026")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-left transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-600">
                      Swiggy
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Code: SWIGGY2026
                    </div>
                  </button>

                  <button
                    onClick={() => handleDemoLogin("nike", "nike@coroast.com", "NIKE2026")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-left transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-600">
                      Nike
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Code: NIKE2026
                    </div>
                  </button>

                  <button
                    onClick={() => handleDemoLogin("zomato", "zomato@coroast.com", "ZOMATO2026")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-left transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-600">
                      Zomato
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Code: ZOMATO2026
                    </div>
                  </button>
                </div>
              </div>

              {/* Unverified Brand (Pending Verification) */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-extrabold text-amber-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  UNVERIFIED BRAND (Pending Verification Screen):
                </span>
                <button
                  onClick={() => handleDemoLogin("burger-club", "biz@burgerclub.com", "PENDING2026")}
                  disabled={isLoading}
                  className="w-full p-2.5 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-left transition-all cursor-pointer group flex items-center justify-between shadow-xs"
                >
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 group-hover:text-amber-600 flex items-center gap-1.5">
                      The Burger Club
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                        Pending Review
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Code: PENDING2026 • biz@burgerclub.com
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab("LOGIN")}
              className={`text-xs font-black uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "LOGIN"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Corporate Login
            </button>
            <Link
              href="/brand/add"
              className="text-xs font-black uppercase tracking-wider pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1"
            >
              + Add / Claim New Brand (Wizard)
            </Link>
          </div>

          {/* Tab 1: Corporate Login Form */}
          {activeTab === "LOGIN" && (
            <form ref={formRef} onSubmit={handleCustomLogin} autoComplete="off" className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Select Brand Account
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value);
                    const b = brands.find((x) => x.id === e.target.value);
                    if (b) {
                      setEmail(b.contactEmail || `${b.slug}@official.com`);
                      setAccessCode(b.accessCode || "");
                    }
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Brand --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.verifiedBadge ? "✓ Verified" : "🕒 Pending Review"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Corporate Work Email
                </label>
                <input
                  type="email"
                  name="corporate_email"
                  id="corporate_email"
                  autoComplete="off"
                  placeholder="e.g. representative@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Access Verification Code
                </label>
                <input
                  type="password"
                  name="corporate_access_code"
                  id="corporate_access_code"
                  autoComplete="new-password"
                  placeholder="e.g. SWIGGY2026 or PENDING2026"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <span>{isLoading ? "Authenticating..." : "Enter Brand Command Center →"}</span>
              </button>
            </form>
          )}

          {/* Tab 2: Register New Business */}
          {activeTab === "REGISTER" && (
            <form onSubmit={handleRegisterBusiness} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Brand / Business Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pixel Games Ltd."
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Official Work Email (Domain Verified)
                </label>
                <input
                  type="email"
                  placeholder="e.g. press@pixelgames.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Official Social Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. @pixelgames"
                  value={regHandle}
                  onChange={(e) => setRegHandle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{isLoading ? "Submitting..." : "Submit Brand Registration (Pending Verification) →"}</span>
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              ← Back to Audience Arena
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
