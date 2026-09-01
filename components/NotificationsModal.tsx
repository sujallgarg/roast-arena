"use client";

import { X, Bell, Flame, Gift, Trophy, Swords } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const notifications = [
    {
      id: "1",
      icon: <Flame className="w-4 h-4 text-red-500" />,
      title: "Round 3 is live: Nike vs Adidas",
      desc: "Vote now to keep Nike in the lead!",
      time: "2m ago",
      link: "/#live-arena",
      unread: true,
    },
    {
      id: "2",
      icon: <Gift className="w-4 h-4 text-emerald-400" />,
      title: "You unlocked Exclusive Discount!",
      desc: "From Nike • 50% Off Voucher",
      time: "1h ago",
      link: "/perks",
      unread: true,
    },
    {
      id: "3",
      icon: <Swords className="w-4 h-4 text-blue-400" />,
      title: "McDonald's vs Burger King has ended!",
      desc: "Burger King won Round 3 by 58%",
      time: "3h ago",
      link: "/battles",
      unread: false,
    },
    {
      id: "4",
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
      title: "You earned +10 points!",
      desc: "For voting in Swiggy vs Zomato arena",
      time: "1d ago",
      link: "/profile",
      unread: false,
    },
    {
      id: "5",
      icon: <Flame className="w-4 h-4 text-purple-400" />,
      title: "New battle alert: Tesla vs BYD",
      desc: "EV clash round 1 is now active",
      time: "1d ago",
      link: "/battles",
      unread: false,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 pt-20">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Panel Card Container */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-xl p-5 space-y-4 z-10 overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-600" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
                  Notifications
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Mark all as read
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={onClose}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                    item.unread
                      ? "bg-red-50/50 border-red-200/80 hover:bg-red-50"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-xs">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="truncate text-slate-900">{item.title}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
