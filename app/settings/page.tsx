"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  Link2,
  Database,
  Ban,
  Globe,
  Palette,
  Trash2,
  ChevronRight,
  X,
} from "lucide-react";
import { ArenaNavbar } from "@/components/ArenaNavbar";
import { ArenaSidebar } from "@/components/ArenaSidebar";

type SettingsTab =
  | "general"
  | "notifications"
  | "privacy"
  | "accounts"
  | "data"
  | "blocked"
  | "language"
  | "appearance";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Account Info State
  const [accountInfo, setAccountInfo] = useState({
    username: "player",
    email: "player@example.com",
    name: "Player",
    bio: "I live for brand battles and savage comebacks. 🔥🥊",
    country: "Global",
  });

  useEffect(() => {
    let hasSession = false;
    try {
      const stored = localStorage.getItem("coroast_voter_session");
      const userObj = localStorage.getItem("coroast_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) {
          hasSession = true;
          setIsAuthenticated(true);
          setAccountInfo((prev) => ({
            ...prev,
            name: parsed.name,
            username: parsed.name.toLowerCase().replace(/\s+/g, ""),
          }));
        }
      } else if (userObj) {
        const parsed = JSON.parse(userObj);
        if (parsed?.username) {
          hasSession = true;
          setIsAuthenticated(true);
          setAccountInfo((prev) => ({
            ...prev,
            username: parsed.username,
            name: parsed.name || parsed.username,
            email: parsed.email || prev.email,
          }));
        }
      }
    } catch {}

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setIsAuthenticated(true);
          setAccountInfo((prev) => ({
            ...prev,
            username: data.user.username,
            email: data.user.email,
            name: data.user.name || data.user.username,
          }));
        } else {
          setIsAuthenticated(false);
          router.replace("/login?redirect=/settings");
        }
      })
      .catch(() => {
        if (!hasSession) {
          setIsAuthenticated(false);
          router.replace("/login?redirect=/settings");
        }
      });
  }, [router]);

  // Preferences State
  const [defaultView, setDefaultView] = useState("Live Battles");
  const [theme, setTheme] = useState("Light");
  const [contentLang, setContentLang] = useState("English");
  const [showMature, setShowMature] = useState(true);

  // Notifications State
  const [notifs, setNotifs] = useState({
    newBattle: true,
    roundResults: true,
    battleResults: true,
    commentVotes: true,
    commentReplies: true,
    xpLevel: true,
    newBadge: true,
    dailyQuests: true,
    offersPerks: false,
    productUpdates: false,
  });

  // Privacy & Security State
  const [privacy, setPrivacy] = useState({
    visibility: "Everyone",
    showBattleActivity: true,
    showOnlineStatus: false,
    allowFollow: true,
  });

  // Edit Modal State
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const openEdit = (field: keyof typeof accountInfo) => {
    setEditingField(field);
    setEditValue(accountInfo[field]);
  };

  const saveEdit = () => {
    if (editingField) {
      setAccountInfo((prev) => ({ ...prev, [editingField]: editValue }));
      setEditingField(null);
    }
  };

  const navTabs = [
    { id: "general" as SettingsTab, label: "General", icon: User },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { id: "privacy" as SettingsTab, label: "Privacy & Security", icon: Shield },
    { id: "accounts" as SettingsTab, label: "Connected Accounts", icon: Link2 },
    { id: "data" as SettingsTab, label: "Data & Storage", icon: Database },
    { id: "blocked" as SettingsTab, label: "Blocked Users", icon: Ban },
    { id: "language" as SettingsTab, label: "Language", icon: Globe },
    { id: "appearance" as SettingsTab, label: "Appearance", icon: Palette },
  ];

  if (isAuthenticated === false || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Universal Fixed Navbar */}
      <ArenaNavbar />

      {/* Main Container With Sidebar */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side Navbar */}
          <div className="lg:col-span-2 hidden lg:block">
            <ArenaSidebar activeItem="Settings" />
          </div>

          {/* Main Settings Stream */}
          <main className="lg:col-span-10 space-y-6">
            {/* 2-Column Inner Layout: Sub-nav (3 cols) & Form (9 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Settings Sub-Nav List */}
              <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-3 shadow-xs space-y-1">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? "bg-red-50 text-red-600 font-black shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-red-600" : "text-slate-400"
                        }`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Settings Form Content Area */}
              <div className="lg:col-span-9 space-y-6">
                {/* TAB 1: GENERAL */}
                {activeTab === "general" && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        <span>SETTINGS</span>
                      </div>
                      <h1 className="text-3xl font-black tracking-tight text-slate-950">
                        General
                      </h1>
                      <p className="text-xs text-slate-500 font-medium">
                        Manage your account and preferences.
                      </p>
                    </div>

                    {/* ACCOUNT INFORMATION */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                        ACCOUNT INFORMATION
                      </h3>

                      <div className="space-y-4 divide-y divide-slate-100 text-xs">
                        {/* Username */}
                        <div className="flex items-center justify-between pt-3 first:pt-0">
                          <div>
                            <div className="text-slate-400 font-bold uppercase text-[10px]">
                              Username
                            </div>
                            <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                              {accountInfo.username}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEdit("username")}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                          >
                            Edit
                          </button>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between pt-4">
                          <div>
                            <div className="text-slate-400 font-bold uppercase text-[10px]">
                              Email
                            </div>
                            <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                              {accountInfo.email}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEdit("email")}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                          >
                            Edit
                          </button>
                        </div>

                        {/* Name */}
                        <div className="flex items-center justify-between pt-4">
                          <div>
                            <div className="text-slate-400 font-bold uppercase text-[10px]">
                              Name
                            </div>
                            <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                              {accountInfo.name}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEdit("name")}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                          >
                            Edit
                          </button>
                        </div>

                        {/* Bio */}
                        <div className="flex items-center justify-between pt-4">
                          <div className="max-w-md">
                            <div className="text-slate-400 font-bold uppercase text-[10px]">
                              Bio
                            </div>
                            <div className="font-medium text-slate-900 text-xs mt-0.5">
                              {accountInfo.bio}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEdit("bio")}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs shrink-0"
                          >
                            Edit
                          </button>
                        </div>

                        {/* Country */}
                        <div className="flex items-center justify-between pt-4">
                          <div>
                            <div className="text-slate-400 font-bold uppercase text-[10px]">
                              Country
                            </div>
                            <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                              {accountInfo.country}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEdit("country")}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PREFERENCES */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                        PREFERENCES
                      </h3>

                      <div className="space-y-4 divide-y divide-slate-100 text-xs">
                        {/* Default Battle View */}
                        <div className="flex items-center justify-between pt-3 first:pt-0">
                          <span className="font-bold text-slate-900">
                            Default Battle View
                          </span>
                          <select
                            value={defaultView}
                            onChange={(e) => setDefaultView(e.target.value)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/30"
                          >
                            <option>Live Battles</option>
                            <option>Ending Soon</option>
                            <option>New Battles</option>
                            <option>All Battles</option>
                          </select>
                        </div>

                        {/* Theme */}
                        <div className="flex items-center justify-between pt-4">
                          <span className="font-bold text-slate-900">Theme</span>
                          <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/30"
                          >
                            <option>Light</option>
                            <option>Dark</option>
                            <option>System</option>
                          </select>
                        </div>

                        {/* Content Language */}
                        <div className="flex items-center justify-between pt-4">
                          <span className="font-bold text-slate-900">
                            Content Language
                          </span>
                          <select
                            value={contentLang}
                            onChange={(e) => setContentLang(e.target.value)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/30"
                          >
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Spanish</option>
                            <option>French</option>
                          </select>
                        </div>

                        {/* Show mature content */}
                        <div className="flex items-center justify-between pt-4">
                          <div>
                            <div className="font-bold text-slate-900">
                              Show mature content
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Display roasts that may contain mature humor.
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowMature(!showMature)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                              showMature ? "bg-red-600" : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                showMature ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: NOTIFICATIONS */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        <span>SETTINGS</span>
                      </div>
                      <h1 className="text-3xl font-black tracking-tight text-slate-950">
                        Notifications
                      </h1>
                      <p className="text-xs text-slate-500 font-medium">
                        Choose what you want to be notified about.
                      </p>
                    </div>

                    {/* ACTIVITY NOTIFICATIONS */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                        ACTIVITY NOTIFICATIONS
                      </h3>

                      <div className="space-y-4 divide-y divide-slate-100 text-xs">
                        {[
                          {
                            key: "newBattle" as const,
                            title: "New battle started",
                            desc: "Get notified when a new battle goes live",
                          },
                          {
                            key: "roundResults" as const,
                            title: "Round results",
                            desc: "Get notified when a round is completed",
                          },
                          {
                            key: "battleResults" as const,
                            title: "Battle results",
                            desc: "Get notified when a battle is completed",
                          },
                          {
                            key: "commentVotes" as const,
                            title: "Someone votes on your comment",
                            desc: "Get notified when someone upvotes your comment",
                          },
                          {
                            key: "commentReplies" as const,
                            title: "Replies to your comment",
                            desc: "Get notified when someone replies to your comment",
                          },
                        ].map((item, idx) => (
                          <div
                            key={item.key}
                            className={`flex items-center justify-between ${
                              idx > 0 ? "pt-4" : "pt-2"
                            }`}
                          >
                            <div>
                              <div className="font-bold text-slate-900 text-xs">
                                {item.title}
                              </div>
                              <div className="text-slate-400 text-[11px]">
                                {item.desc}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setNotifs((prev) => ({
                                  ...prev,
                                  [item.key]: !prev[item.key],
                                }))
                              }
                              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                notifs[item.key] ? "bg-red-600" : "bg-slate-300"
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  notifs[item.key]
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* UPDATES */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                        UPDATES
                      </h3>

                      <div className="space-y-4 divide-y divide-slate-100 text-xs">
                        {[
                          {
                            key: "xpLevel" as const,
                            title: "XP & level up",
                            desc: "Get notified when you earn XP or level up",
                          },
                          {
                            key: "newBadge" as const,
                            title: "New badge unlocked",
                            desc: "Get notified when you unlock a new badge",
                          },
                          {
                            key: "dailyQuests" as const,
                            title: "Daily quests",
                            desc: "Get reminded about your daily quests",
                          },
                        ].map((item, idx) => (
                          <div
                            key={item.key}
                            className={`flex items-center justify-between ${
                              idx > 0 ? "pt-4" : "pt-2"
                            }`}
                          >
                            <div>
                              <div className="font-bold text-slate-900 text-xs">
                                {item.title}
                              </div>
                              <div className="text-slate-400 text-[11px]">
                                {item.desc}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setNotifs((prev) => ({
                                  ...prev,
                                  [item.key]: !prev[item.key],
                                }))
                              }
                              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                notifs[item.key] ? "bg-red-600" : "bg-slate-300"
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  notifs[item.key]
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* MARKETING */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                        MARKETING
                      </h3>

                      <div className="space-y-4 divide-y divide-slate-100 text-xs">
                        {[
                          {
                            key: "offersPerks" as const,
                            title: "Offers and perks",
                            desc: "Get notified about special offers and perks",
                          },
                          {
                            key: "productUpdates" as const,
                            title: "Product updates",
                            desc: "Get updates about new features",
                          },
                        ].map((item, idx) => (
                          <div
                            key={item.key}
                            className={`flex items-center justify-between ${
                              idx > 0 ? "pt-4" : "pt-2"
                            }`}
                          >
                            <div>
                              <div className="font-bold text-slate-900 text-xs">
                                {item.title}
                              </div>
                              <div className="text-slate-400 text-[11px]">
                                {item.desc}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setNotifs((prev) => ({
                                  ...prev,
                                  [item.key]: !prev[item.key],
                                }))
                              }
                              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                notifs[item.key] ? "bg-red-600" : "bg-slate-300"
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  notifs[item.key]
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: PRIVACY & SECURITY */}
                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        <span>SETTINGS</span>
                      </div>
                      <h1 className="text-3xl font-black tracking-tight text-slate-950">
                        Privacy & Security
                      </h1>
                      <p className="text-xs text-slate-500 font-medium">
                        Manage your privacy and secure your account.
                      </p>
                    </div>

                    {/* PRIVACY */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                        PRIVACY
                      </h3>

                      <div className="space-y-4 divide-y divide-slate-100 text-xs">
                        {/* Profile visibility */}
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <div className="font-bold text-slate-900">
                              Profile visibility
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Choose who can see your profile
                            </div>
                          </div>
                          <select
                            value={privacy.visibility}
                            onChange={(e) =>
                              setPrivacy((prev) => ({
                                ...prev,
                                visibility: e.target.value,
                              }))
                            }
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/30"
                          >
                            <option>Everyone</option>
                            <option>Followers Only</option>
                            <option>Private</option>
                          </select>
                        </div>

                        {/* Show battle activity */}
                        <div className="flex items-center justify-between pt-4">
                          <div>
                            <div className="font-bold text-slate-900">
                              Show battle activity
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Show your votes and activity on your profile
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setPrivacy((prev) => ({
                                ...prev,
                                showBattleActivity: !prev.showBattleActivity,
                              }))
                            }
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                              privacy.showBattleActivity
                                ? "bg-red-600"
                                : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                privacy.showBattleActivity
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Show online status */}
                        <div className="flex items-center justify-between pt-4">
                          <div>
                            <div className="font-bold text-slate-900">
                              Show online status
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Let others see when you are online
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setPrivacy((prev) => ({
                                ...prev,
                                showOnlineStatus: !prev.showOnlineStatus,
                              }))
                            }
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                              privacy.showOnlineStatus
                                ? "bg-red-600"
                                : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                privacy.showOnlineStatus
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Allow people to follow you */}
                        <div className="flex items-center justify-between pt-4">
                          <div>
                            <div className="font-bold text-slate-900">
                              Allow people to follow you
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Let others follow your profile
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setPrivacy((prev) => ({
                                ...prev,
                                allowFollow: !prev.allowFollow,
                              }))
                            }
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                              privacy.allowFollow ? "bg-red-600" : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                privacy.allowFollow
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SECURITY */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                        SECURITY
                      </h3>

                      <div className="space-y-4 divide-y divide-slate-100 text-xs">
                        {/* Change password */}
                        <div className="flex items-center justify-between pt-2 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                          <div>
                            <div className="font-bold text-slate-900">
                              Change password
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Update your password regularly
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Two-factor authentication */}
                        <div className="flex items-center justify-between pt-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                          <div>
                            <div className="font-bold text-slate-900">
                              Two-factor authentication
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Add an extra layer of security
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                            <span>Off</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Login sessions */}
                        <div className="flex items-center justify-between pt-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                          <div>
                            <div className="font-bold text-slate-900">
                              Login sessions
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Manage your active sessions
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* DANGER ZONE: DELETE ACCOUNT */}
                    <div className="bg-red-50/50 border border-red-200/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                          <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-red-700 text-sm">
                            Delete account
                          </div>
                          <div className="text-red-500/80 text-xs font-medium">
                            Permanently delete your account and all data
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            "Account deletion requested. Please contact support or confirm via email."
                          )
                        }
                        className="px-5 py-2 rounded-xl border border-red-400 text-red-600 font-extrabold text-xs hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-2xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Other tabs placeholder fallback */}
                {activeTab !== "general" &&
                  activeTab !== "notifications" &&
                  activeTab !== "privacy" && (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3 shadow-xs">
                      <h2 className="text-xl font-black text-slate-950 capitalize">
                        {activeTab} Settings
                      </h2>
                      <p className="text-xs text-slate-500">
                        Preferences for {activeTab} can be configured here.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Field Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingField(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black uppercase text-slate-950">
              Edit {editingField}
            </h3>

            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/30"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
