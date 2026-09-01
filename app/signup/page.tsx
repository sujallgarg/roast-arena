"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Flame,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AtSign,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear credentials on mount, after logout, or when autofill attempts to pre-populate
  useEffect(() => {
    const clearForm = () => {
      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      if (formRef.current) {
        formRef.current.reset();
      }
    };

    clearForm();
    const timer = setTimeout(clearForm, 100);

    window.addEventListener("arena_logout", clearForm);
    window.addEventListener("storage", clearForm);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("arena_logout", clearForm);
      window.removeEventListener("storage", clearForm);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      if (data.user) {
        localStorage.setItem("coroast_user", JSON.stringify(data.user));
        localStorage.setItem(
          "coroast_voter_session",
          JSON.stringify({
            userId: data.user.id,
            name: data.user.name || data.user.username,
            avatar:
              data.user.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username}`,
            points: data.user.points || 500,
            level: data.user.level || "Arena Rookie",
          })
        );
        window.dispatchEvent(new Event("storage"));
      }

      router.push("/battles");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const configRes = await fetch("/api/auth/google?format=json")
        .then((r) => r.json())
        .catch(() => null);

      if (configRes?.configured && configRes?.authUrl) {
        window.location.href = configRes.authUrl;
        return;
      }

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "google.voter@arena.com",
          name: "RoastMaster",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google sign up failed");
      }

      if (data.user) {
        localStorage.setItem("coroast_user", JSON.stringify(data.user));
        localStorage.setItem(
          "coroast_voter_session",
          JSON.stringify({
            userId: data.user.id,
            name: data.user.name || data.user.username,
            avatar:
              data.user.avatarUrl ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
            points: data.user.points || 2540,
            level: data.user.level || "Level 12",
          })
        );
        window.dispatchEvent(new Event("storage"));
      }

      router.push("/battles");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to continue with Google");
      }
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between font-sans selection:bg-red-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background with Red & Black Boxing Gloves */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/auth-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center opacity-90"
        />
        {/* Soft center fade mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f8fafc]/80 to-transparent" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-950 italic">
            ROAST<span className="text-red-600">ARENA</span>
          </span>
        </Link>

        <div className="text-xs font-semibold text-slate-500">
          <span>Already have an account? </span>
          <Link
            href="/login"
            className="text-red-600 font-extrabold hover:text-red-700 underline underline-offset-2 transition-colors"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Centered Auth Card */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-6">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          {/* Card Title & Subtitle */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Join the Arena! ⚔️
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create your account and start voting.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-3.5 text-xs"
          >
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="block font-bold text-slate-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label
                htmlFor="username"
                className="block font-bold text-slate-700"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  placeholder="Choose a unique username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 shadow-2xs"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium pl-1">
                This is how others will see you.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block font-bold text-slate-700"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block font-bold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium pl-1">
                Minimum 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="block font-bold text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-wider uppercase transition-all shadow-md shadow-red-600/30 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Sign Up</span>
                )}
              </button>
            </div>
          </form>

          {/* Divider: or continue with */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              or continue with
            </span>
          </div>

          {/* ONLY Google Continue Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-98"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Terms notice */}
          <div className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
            <span>By continuing, you agree to our </span>
            <Link
              href="/"
              className="text-red-600 font-bold hover:underline"
            >
              Terms of Service
            </Link>
            <span> and </span>
            <Link
              href="/"
              className="text-red-600 font-bold hover:underline"
            >
              Privacy Policy
            </Link>
            <span>.</span>
          </div>
        </div>
      </main>

      {/* Bottom spacer for clean centering */}
      <footer className="h-6" />
    </div>
  );
}
