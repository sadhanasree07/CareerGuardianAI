"use client";

import { Award, X } from "lucide-react";

interface BadgeUnlockedProps {
  badge: any;
  onClose: () => void;
}

export default function BadgeUnlocked({
  badge,
  onClose,
}: BadgeUnlockedProps) {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-6">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">

        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100">
          <Award className="h-12 w-12 text-yellow-500" />
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-wider text-blue-600">
          Achievement Unlocked
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-900">
          🎉 Badge Unlocked!
        </h2>

        <div className="mt-6 rounded-2xl bg-slate-50 p-6">

          <div className="text-5xl">
            {badge.icon}
          </div>

          <h3 className="mt-3 text-2xl font-bold text-slate-900">
            {badge.name}
          </h3>

          <p className="mt-2 text-slate-600">
            {badge.description}
          </p>

        </div>

        <button
          onClick={onClose}
          className="mt-7 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 font-bold text-white shadow-lg transition hover:scale-[1.02]"
        >
          Continue
        </button>

      </div>
    </div>
  );
}