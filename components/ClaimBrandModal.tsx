"use client";

import { useState } from "react";
import { ShieldCheck, X, Building2, Mail, Link as LinkIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClaimBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandList?: { id: string; name: string; handle: string }[];
}

export function ClaimBrandModal({
  isOpen,
  onClose,
  brandList = [
    { id: "1", name: "Swiggy", handle: "@swiggy" },
    { id: "2", name: "Zomato", handle: "@zomato" },
    { id: "3", name: "Apple", handle: "@apple" },
    { id: "4", name: "Samsung", handle: "@samsung" },
    { id: "5", name: "Notion", handle: "@notionhq" },
    { id: "6", name: "Obsidian", handle: "@obsdmd" },
  ],
}: ClaimBrandModalProps) {
  const [selectedBrand, setSelectedBrand] = useState(brandList[0]?.name || "");
  const [workEmail, setWorkEmail] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    ticketId: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/brands/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: selectedBrand,
          workEmail,
          socialHandle,
          roleDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit verification request");
        return;
      }

      setSuccessData({
        ticketId: data.ticketId,
        message: data.message,
      });
    } catch (err) {
      console.error("Claim request error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccessData(null);
    setErrorMsg(null);
    setWorkEmail("");
    setSocialHandle("");
    setRoleDescription("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetForm}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 z-10 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    Claim Your Brand
                    <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      Official
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Verify your social media team to post official roasts.
                  </p>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success View */}
            {successData ? (
              <div className="space-y-6 py-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-extrabold text-slate-900">
                    Verification Request Submitted!
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {successData.message}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-600 flex items-center justify-between">
                  <span>Reference ID:</span>
                  <strong className="text-slate-900">{successData.ticketId}</strong>
                </div>

                <button
                  onClick={resetForm}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Brand Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    Select Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    {brandList.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.handle})
                      </option>
                    ))}
                    <option value="New Brand Request">+ Request New Brand</option>
                  </select>
                </div>

                {/* Corporate Work Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    Work Email (Official Domain)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. alex@swiggy.in"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    Must use official company domain (e.g. @brand.com).
                  </p>
                </div>

                {/* Official X / LinkedIn Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    Official X / LinkedIn Profile Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/swiggy or https://linkedin.com/company/swiggy"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                {/* Role / Position */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900">
                    Your Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Head of Social Media Strategy"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !workEmail || !socialHandle}
                    className="w-full py-3 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Submit Verification Request</span>
                  </button>

                  <div className="text-center pt-1">
                    <a
                      href="/business/login"
                      onClick={onClose}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Already verified? Go to Business Login →
                    </a>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
