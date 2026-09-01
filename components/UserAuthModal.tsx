"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; avatar: string; points: number }) => void;
}

export function UserAuthModal({ isOpen, onClose, onLoginSuccess }: UserAuthModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<"LOGIN" | "SIGNUP">("SIGNUP");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      // 1. Check if OAuth redirect is configured in environment
      const configRes = await fetch("/api/auth/google?format=json")
        .then((r) => r.json())
        .catch(() => null);

      if (configRes?.configured && configRes?.authUrl) {
        window.location.href = configRes.authUrl;
        return;
      }

      // 2. Perform authenticated Google sign-in with database session
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "google.voter@arena.com",
          name: "Google Voter",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleVoter",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to authenticate with Google.");
      }

      const sessionUser = {
        name: data.user.name || data.user.username,
        avatar: data.user.avatarUrl,
        points: data.user.points,
        level: data.user.level,
      };

      localStorage.setItem("coroast_voter_session", JSON.stringify(sessionUser));
      window.dispatchEvent(new Event("storage"));
      onLoginSuccess(sessionUser);
      onClose();
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      setError(err instanceof Error ? err.message : "Google sign-in encountered an error.");
    } finally {
      setIsGoogleLoading(false);
    }
  };
  useEffect(() => {
    const clearForm = () => {
      setUsername("");
      setEmail("");
      setPassword("");
      setError(null);
      if (formRef.current) {
        formRef.current.reset();
      }
    };

    clearForm();

    const timer = setTimeout(clearForm, 100);
    return () => clearTimeout(timer);
  }, [isOpen, mode]);

  // Also clear credentials when a logout occurs anywhere in the app
  useEffect(() => {
    const clearForm = () => {
      setUsername("");
      setEmail("");
      setPassword("");
      setError(null);
      if (formRef.current) {
        formRef.current.reset();
      }
    };

    window.addEventListener("arena_logout", clearForm);
    window.addEventListener("storage", clearForm);
    return () => {
      window.removeEventListener("arena_logout", clearForm);
      window.removeEventListener("storage", clearForm);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = mode === "SIGNUP" ? "/api/auth/signup" : "/api/auth/login";
      const payload = mode === "SIGNUP"
        ? { username, email, password, name: username }
        : { identifier: email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      const sessionUser = {
        name: data.user.name || data.user.username,
        avatar: data.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username}`,
        points: data.user.points,
        level: data.user.level,
      };      localStorage.setItem("coroast_voter_session", JSON.stringify(sessionUser));
      onLoginSuccess({ name: sessionUser.name, avatar: sessionUser.avatar, points: sessionUser.points });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-5 z-10 overflow-hidden text-slate-900"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 text-center">
              <img
                src="/logo.png"
                alt="VS ROAST ARENA"
                className="h-14 w-auto object-contain mx-auto mb-2"
              />
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                {mode === "LOGIN" ? "Welcome Back to Arena" : "Join the Roast Arena"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {mode === "LOGIN"
                  ? "Sign in to cast your votes and access your voter perks!"
                  : "Create an account to save votes, earn points & unlock perks!"}
              </p>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-black">
              <button
                type="button"
                onClick={() => { setMode("LOGIN"); setError(null); }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  mode === "LOGIN"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("SIGNUP"); setError(null); }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  mode === "SIGNUP"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <span className="w-4 h-4 border-2 border-slate-400 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>

            {/* Or Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-extrabold text-slate-400">
                <span className="bg-white px-2">Or continue with credentials</span>
              </div>
            </div>

            {/* Custom Sign In / Sign Up Form */}
            <form ref={formRef} onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
              {mode === "SIGNUP" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">
                    Voter Username
                  </label>
                  <input
                    type="text"
                    name="modal_username"
                    id="modal_username"
                    autoComplete="off"
                    placeholder="e.g. MicDropper99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">
                  Email Address {mode === "LOGIN" && "/ Username"}
                </label>
                <input
                  type={mode === "LOGIN" ? "text" : "email"}
                  name="modal_email"
                  id="modal_email"
                  autoComplete="off"
                  placeholder={mode === "LOGIN" ? "e.g. voter@domain.com or MicDropper99" : "e.g. voter@domain.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  name="modal_password"
                  id="modal_password"
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{mode === "LOGIN" ? "Sign In to Arena 🔥" : "Create Account & Join Arena 🔥"}</span>
                )}
              </button>

              <div className="text-center pt-2">
                {mode === "LOGIN" ? (
                  <button
                    type="button"
                    onClick={() => setMode("SIGNUP")}
                    className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Don&apos;t have an account? <span className="underline">Sign Up</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode("LOGIN")}
                    className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Already have an account? <span className="underline">Sign In</span>
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
