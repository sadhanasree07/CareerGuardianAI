"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2 } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";

export default function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function update(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function login() {
    if (!form.email || !form.password) {
      alert(t("auth.enterCredentials"));
      return;
    }

    setLoading(true);

    const controller = new AbortController();

    const timeoutId = setTimeout(
      () => controller.abort(),
      15000
    );

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        signal: controller.signal,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (json.success) {

        // Save user ID for badges and progress tracking
        localStorage.setItem(
          "userId",
          json.user.id
        );

        // Save complete user information
        localStorage.setItem(
          "user",
          JSON.stringify(json.user)
        );

        alert(t("auth.loginSuccess"));

        window.location.href = "/dashboard";

        return;

      } else {
        alert(t("auth.loginFailed"));
      }

    } catch (error) {
      console.error(
        "Login request failed:",
        error
      );

      alert(
        error instanceof DOMException &&
        error.name === "AbortError"
          ? t("auth.loginTimeout")
          : t("auth.loginFailed")
      );

    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">

      <h2 className="text-3xl font-bold">
        {t("auth.login")}
      </h2>

      <p className="mt-2 text-slate-500">
        {t("auth.welcomeBack")}
      </p>

      <div className="mt-8 space-y-5">

        <input
          type="email"
          name="email"
          placeholder={t("auth.email")}
          aria-label={t("auth.email")}
          value={form.email}
          onChange={update}
          className="w-full rounded-xl border p-4"
        />

        <input
          type="password"
          name="password"
          placeholder={t("auth.password")}
          aria-label={t("auth.password")}
          value={form.password}
          onChange={update}
          className="w-full rounded-xl border p-4"
        />

      </div>

      <button
        onClick={login}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-4 text-lg font-semibold text-white"
      >

        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("auth.signingIn")}
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" />
            {t("auth.login")}
          </>
        )}

      </button>

      <p className="mt-6 text-center text-slate-500">

        {t("auth.noAccount")}

        <Link
          href="/signup"
          className="ml-2 font-semibold text-blue-600"
        >
          {t("auth.createAccount")}
        </Link>

      </p>

    </div>
  );
}