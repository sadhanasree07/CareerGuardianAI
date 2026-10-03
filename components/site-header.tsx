"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShieldCheck,
  LayoutDashboard,
  ChevronDown,
  Radar,
  FileText,
  TriangleAlert,
  GraduationCap,
  Mic2,
  Bot,
  Compass,
} from "lucide-react";

import { useLanguage } from "@/src/context/LanguageContext";
import type { TranslationKey } from "@/src/lib/translations";
import UserMenu from "@/components/UserMenu";
import Logo from "@/components/branding/Logo";
import NotificationBell from "@/components/NotificationBell";

/* =========================================================
   NAVIGATION DATA
========================================================= */

const growItems: NavItem[] = [
  {
    label: "careerDNA",
    href: "/career-dna",
    icon: Compass,
  },
  {
    label: "resumeBuilder",
    href: "/resume-builder",
    icon: FileText,
  },
  {
    label: "placementPredictor",
    href: "/placement",
    icon: GraduationCap,
  },
  {
    label: "interviewSimulator",
    href: "/interview",
    icon: Mic2,
  },
  {
    label: "aiMentor",
    href: "/ai-mentor",
    icon: Bot,
  },
  {
    label: "opportunityRadar",
    href: "/opportunities",
    icon: Radar,
  },
];

/* =========================================================
   TYPES
========================================================= */

type NavItem = {
  label: TranslationKey;
  href: string;
  icon?: typeof ShieldCheck;
};

/* =========================================================
   SITE HEADER
========================================================= */

export function SiteHeader() {
  const { t } = useLanguage();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileSection, setOpenMobileSection] =
    useState<string | null>(null);

  /* -------------------------------------------------------
     CLOSE ALL NAVIGATION
  ------------------------------------------------------- */

  const closeNavigation = () => {
    setOpenDropdown(null);
    setOpenMobileSection(null);
    setMobileOpen(false);
  };

  /* -------------------------------------------------------
     TOGGLE DESKTOP DROPDOWN
  ------------------------------------------------------- */

  const toggleDropdown = (name: string) => {
    setOpenDropdown((current) => {
      if (current === name) {
        return null;
      }

      return name;
    });
  };

  /* -------------------------------------------------------
     CHECK ACTIVE ROUTE
  ------------------------------------------------------- */

  const isActive = (href: string) => {
    const cleanHref = href.split("#")[0];

    if (cleanHref === "/") {
      return pathname === "/";
    }

    return (
      pathname === cleanHref ||
      pathname.startsWith(`${cleanHref}/`)
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
        {/* =================================================
            LOGO

            IMPORTANT:
            Logo already contains its own Link.
            DO NOT wrap Logo inside another Link.
        ================================================= */}

        <div
          className="flex shrink-0 items-center"
          onClick={() => {
            closeNavigation();
          }}
        >
          <Logo size="sm" />
        </div>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav className="hidden h-full min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
          {/* =================================================
              VERIFY
          ================================================= */}

          <Link
            href="/verify"
            onClick={closeNavigation}
            className={`inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-bold leading-none transition ${
              isActive("/verify") || isActive("/analyze")
                ? "bg-blue-800 text-white"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
          >
            {t("verify")}
          </Link>

          {/* =================================================
              RECOVER
          ================================================= */}

          <Link
            href="/emergency"
            onClick={closeNavigation}
            className={`inline-flex h-10 items-center justify-center rounded-lg border border-red-200 px-3 text-sm font-bold leading-none transition ${
              isActive("/emergency")
                ? "bg-red-50 text-red-800"
                : "text-red-700 hover:bg-red-50"
            }`}
          >
            <TriangleAlert aria-hidden="true" className="mr-2 h-4 w-4" />
            {t("recover")}
          </Link>

          {/* BUILD YOUR CAREER */}

          <DesktopDropdown
            title={t("grow")}
            items={growItems}
            pathname={pathname}
            open={openDropdown === "grow"}
            onToggle={() => toggleDropdown("grow")}
            onNavigate={closeNavigation}
            isActive={growItems.some((item) => isActive(item.href))}
          />

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Link
            href="/dashboard"
            onClick={closeNavigation}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg px-2 text-sm font-bold leading-none transition xl:px-3 ${
              isActive("/dashboard")
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-700 hover:bg-slate-100 hover:text-cyan-700"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("dashboard")}
          </Link>
        </nav>

        {/* =================================================
            DESKTOP RIGHT SIDE
        ================================================= */}

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <NotificationBell />

          <UserMenu />
        </div>

        {/* =================================================
            MOBILE MENU BUTTON
        ================================================= */}

        <button
          type="button"
          aria-label={
              mobileOpen ? t("closeNavigation") : t("openNavigation")
          }
          aria-expanded={mobileOpen}
          onClick={() => {
            setMobileOpen((current) => !current);
            setOpenDropdown(null);
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg p-0 transition hover:bg-slate-100 lg:hidden"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="space-y-2 p-5">
            {/* VERIFY */}

            <Link
              href="/verify"
              onClick={closeNavigation}
              className={`block rounded-xl px-4 py-3 text-sm font-bold transition ${
                isActive("/verify") || isActive("/analyze")
                  ? "bg-blue-800 text-white"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              }`}
            >
              {t("verify")}
            </Link>

            {/* RECOVER */}

            <Link
              href="/emergency"
              onClick={closeNavigation}
              className={`flex items-center rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                isActive("/emergency")
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-transparent text-red-700 hover:border-red-200 hover:bg-red-50"
              }`}
            >
              <TriangleAlert aria-hidden="true" className="mr-3 h-4 w-4" />
              {t("recover")}
            </Link>

              {/* BUILD YOUR CAREER */}

              <MobileSection
                title={t("grow")}
                section="grow"
                items={growItems}
                open={openMobileSection === "grow"}
                onToggle={() => setOpenMobileSection((current) => current === "grow" ? null : "grow")}
                onNavigate={closeNavigation}
                isItemActive={isActive}
              />

            {/* DASHBOARD */}

            <Link
              href="/dashboard"
              onClick={closeNavigation}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive("/dashboard")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              {t("dashboard")}
            </Link>

          </nav>

          {/* MOBILE USER AREA */}

          <div className="flex items-center gap-4 border-t border-slate-200 p-5">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      )}
    </header>
  );
}

/* =========================================================
   DESKTOP DROPDOWN
========================================================= */

function DesktopDropdown({
  title,
  items,
  pathname,
  open,
  onToggle,
  onNavigate,
  isActive: active,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  isActive: boolean;
}) {
  const { t } = useLanguage();

  const itemIsActive = (href: string) => {
    const cleanHref = href.split("#")[0];

    /*
      Recruitment Verification uses /analyze.
      If the user is on /verify, don't mark /analyze active.
    */

    if (href === "/analyze" && pathname === "/verify") {
      return false;
    }

    if (cleanHref === "/") {
      return pathname === "/";
    }

    return (
      pathname === cleanHref ||
      pathname.startsWith(`${cleanHref}/`)
    );
  };

  return (
    <div className="relative">
      {/* DROPDOWN BUTTON */}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
        className={`flex h-10 items-center justify-center gap-1 rounded-lg px-2 text-sm font-bold leading-none transition xl:px-3 ${
          active
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-700 hover:bg-slate-100 hover:text-cyan-700"
        }`}
      >
        <span>{title}</span>

        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN MENU */}

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-[100] mt-2 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/40"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const activeItem = itemIsActive(item.href);

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                role="menuitem"
                onClick={onNavigate}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                  activeItem
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {/* ICON */}

                {Icon && (
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      activeItem
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                )}

                {/* TEXT */}

                <span className="flex-1">
                  <span className="block text-sm font-semibold">
                    {t(item.label)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MOBILE SECTION
========================================================= */

function MobileSection({
  title,
  section,
  items,
  open,
  onToggle,
  onNavigate,
  isItemActive,
}: {
  title: string;
  section: string;
  items: NavItem[];
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  isItemActive: (href: string) => boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      {/* SECTION BUTTON */}

      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
          open
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span>{title}</span>

        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* SECTION ITEMS */}

      {open && (
        <div className="space-y-1 bg-slate-50/60 px-2 pb-2 pt-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);

            return (
              <Link
                key={`${section}-${item.href}-${item.label}`}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  active
                    ? "bg-indigo-100 font-semibold text-indigo-700"
                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`h-4 w-4 ${
                      active
                        ? "text-indigo-700"
                        : "text-indigo-600"
                    }`}
                  />
                )}

                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SiteHeader;
