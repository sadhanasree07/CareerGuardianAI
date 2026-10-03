"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/src/context/LanguageContext";
import {
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface UserData {
  name: string;
  email: string;
}

export default function UserMenu() {
  const { t } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    loadProfile();

    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (res.status === 401 || res.status === 403) {
        setUser(null);
        return;
      }

      if (!res.ok) {
        throw new Error(`Profile request failed with status ${res.status}`);
      }

      const json = await res.json();

      if (json.success) {
        setUser(json.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn("Profile fetch skipped because user is not authenticated.");
      setUser(null);
    }
  }
  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout request failed");
      }

      // Clear local user state immediately
      setUser(null);

      // Close dropdown
      setOpen(false);

      // Go to home page with fresh reload
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label={t("login")}
        title={t("login")}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-cyan-700"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
    >
      <button
        type="button"
        aria-label={t("myProfile")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-cyan-700"
      >
        <User className="h-5 w-5" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <Link
              href="/profile"
              role="menuitem"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              {t("myProfile")}
            </Link>

            <Link
              href="/settings"
              role="menuitem"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              {t("settings")}
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
        </div>
      )}

    </div>
  );
}
