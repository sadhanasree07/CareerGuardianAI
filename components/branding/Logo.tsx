"use client";

import Link from "next/link";

interface LogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({
  showTagline = true,
  size = "md",
}: LogoProps) {
  const iconSize =
    size === "sm"
      ? "h-10 w-10"
      : size === "lg"
      ? "h-16 w-16"
      : "h-12 w-12";

  const compact = size === "sm";
  const brandTextSize = compact ? "text-[1rem] sm:text-[1.05rem] lg:text-[1.12rem]" : size === "lg" ? "text-4xl" : "text-2xl";
  const aiTextSize = compact ? "text-[0.78rem] sm:text-[0.82rem] lg:text-[0.86rem]" : size === "lg" ? "text-[1.05rem]" : "text-[0.9rem]";
  const taglineSize = compact ? "text-[0.56rem] sm:text-[0.6rem] lg:text-[0.62rem] tracking-[0.16em] sm:tracking-[0.2em]" : "text-[0.6rem] sm:text-[0.7rem] lg:text-[0.72rem] tracking-[0.24em] sm:tracking-[0.34em]";

  return (
    <Link href="/" className="inline-flex items-center gap-3 lg:gap-4">
      <div className="relative shrink-0 flex items-center justify-center">
        <div className={`flex ${iconSize} items-center justify-center rounded-[1.2rem] bg-white shadow-none`}>
          <svg viewBox="0 0 512 512" className={size === "lg" ? "h-16 w-16" : size === "sm" ? "h-10 w-10" : "h-12 w-12"}>
            <defs>
              <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
              <linearGradient id="shieldFillL" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#111827" />
              </linearGradient>
              <linearGradient id="shieldFillR" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="aiLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path d="M256 34c-41 24-111 56-144 70-18 8-30 25-30 45v72c0 83 39 132 103 178 19 14 36 22 71 22 35 0 52-8 71-22 64-46 103-95 103-178v-72c0-20-12-37-30-45-33-14-103-46-144-70Z" fill="url(#shieldFillL)" stroke="url(#shieldBorder)" strokeWidth="20" />
            <path d="M256 34c58 34 112 62 144 70 18 8 30 25 30 45v72c0 83-39 132-103 178-19 14-36 22-71 22V34Z" fill="url(#shieldFillR)" />

            <g transform="translate(256 256)">
              <circle cx="0" cy="0" r="104" fill="#FFFFFF" opacity="0.96" />
              <circle cx="0" cy="0" r="90" fill="none" stroke="#E2E8F0" strokeWidth="4" />
              <path d="M-60 -60c33-33 87-33 120 0 33 33 33 87 0 120" fill="none" stroke="#0EA5E9" strokeWidth="12" strokeLinecap="round" />
              <path d="M-38 -38c19-19 49-19 68 0 19 19 19 49 0 68" fill="none" stroke="#2563EB" strokeWidth="10" strokeLinecap="round" />
              <path d="M-14 -14c8-8 20-8 28 0 8 8 8 20 0 28" fill="none" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round" />
              <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#2563EB" strokeWidth="6" />
              <path d="M-98 -98 0 -164" stroke="#2563EB" strokeWidth="10" strokeLinecap="round" />
              <path d="M0 -164 -24 -138" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
              <path d="M98 -98 164 -64" stroke="#2563EB" strokeWidth="10" strokeLinecap="round" />
              <path d="M164 -64 138 -90" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
              <path d="M88 104 168 136" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
              <path d="M-84 88 -154 124" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
              <g filter="url(#glow)">
                <path d="M-140 120c20-12 30-26 34-48" stroke="url(#aiLine)" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M128 100c24 8 44 28 52 56" stroke="url(#aiLine)" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M-72 132c12-12 26-18 44-20" stroke="url(#aiLine)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M120 124c10-8 18-18 22-32" stroke="url(#aiLine)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </g>
              <circle cx="-140" cy="120" r="5" fill="#38BDF8" />
              <circle cx="-72" cy="132" r="5" fill="#8B5CF6" />
              <circle cx="120" cy="124" r="5" fill="#38BDF8" />
              <circle cx="168" cy="136" r="5" fill="#8B5CF6" />
              <rect x="-60" y="-88" width="120" height="92" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="4" />
              <circle cx="-28" cy="-54" r="16" fill="#0F172A" opacity="0.9" />
              <path d="M-34 -54  -26 -44  -10 -62" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="-38" y="-24" width="68" height="8" rx="4" fill="#CBD5E1" />
              <rect x="-38" y="-8" width="56" height="8" rx="4" fill="#CBD5E1" />
              <rect x="-38" y="8" width="48" height="8" rx="4" fill="#CBD5E1" />
              <circle cx="44" cy="38" r="12" fill="#2563EB" />
              <path d="M39 38 43 42 50 34" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            <g transform="translate(256 390)">
              <path d="M-44 -12c0-22 18-40 40-40h8c22 0 40 18 40 40v24h-88v-24Z" fill="url(#shieldFillR)" stroke="#FFFFFF" strokeWidth="8" />
              <path d="M-36 -12c0-16 13-28 28-28h4c15 0 28 12 28 28v18h-60v-18Z" fill="#2563EB" />
              <path d="M-8 -30 0 -20 16 -36" stroke="#FFFFFF" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            <path d="M166 310c-24-10-38-30-43-56" stroke="#2563EB" strokeWidth="10" strokeLinecap="round" />
            <path d="M148 312c-18-8-30-20-35-38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-start justify-center leading-none">
        <div className="flex items-center gap-2 whitespace-nowrap sm:gap-3">
          <span className={`${brandTextSize} font-black uppercase tracking-[0.12em] text-[#0F172A]`}>CAREER</span>
          <span className={`${brandTextSize} bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#7C3AED] bg-clip-text font-black uppercase tracking-[0.12em] text-transparent`}>GUARDIAN</span>
        </div>
        <div className="mt-1 flex items-center gap-2 self-center sm:gap-3">
          <div className="h-px w-6 sm:w-8 lg:w-10 bg-gradient-to-r from-transparent to-[#2563EB]" />
          <span className={`${aiTextSize} bg-gradient-to-r from-[#2563EB] via-[#0EA5E9] to-[#3B82F6] bg-clip-text font-black uppercase tracking-[0.3em] text-transparent sm:tracking-[0.34em]`}>AI</span>
          <div className="h-px w-6 sm:w-8 lg:w-10 bg-gradient-to-l from-transparent to-[#7C3AED]" />
        </div>
        {showTagline && (
          <p className={`${compact ? "mt-1" : "mt-2"} whitespace-nowrap font-semibold uppercase leading-none text-[#0F172A] ${taglineSize}`}>
            <span className="text-[#2563EB]">●</span> PROTECT <span className="text-[#7C3AED]">●</span> VERIFY <span className="text-[#2563EB]">●</span> SUCCEED
          </p>
        )}
      </div>
    </Link>
  );
}
