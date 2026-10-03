"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Loader2 } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";

export default function SignupForm() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
  });

  function update(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function signup() {
    if (
      !form.name ||
      !form.email ||
      !form.password
    ) {
      alert(t("auth.fillRequired"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (json.success) {
        alert(t("auth.accountCreated"));

        window.location.href = "/login";
      } else {
        alert(t("auth.signupFailed"));
      }
    } catch {
      alert(t("auth.signupFailed"));
    }

    setLoading(false);
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">

      <h2 className="text-3xl font-bold">
        {t("auth.createAccount")}
      </h2>

      <p className="mt-2 text-slate-500">
        {t("auth.welcome")}
      </p>

      <div className="mt-8 space-y-5">

        <input
          name="name"
          placeholder={t("auth.fullName")}
          aria-label={t("auth.fullName")}
          value={form.name}
          onChange={update}
          className="w-full rounded-xl border p-4"
        />

        <input
          name="email"
          type="email"
          placeholder={t("auth.email")}
          aria-label={t("auth.email")}
          value={form.email}
          onChange={update}
          className="w-full rounded-xl border p-4"
        />

        <input
          name="college"
          placeholder={t("auth.college")}
          aria-label={t("auth.college")}
          value={form.college}
          onChange={update}
          className="w-full rounded-xl border p-4"
        />

        <input
          name="password"
          type="password"
          placeholder={t("auth.password")}
          aria-label={t("auth.password")}
          value={form.password}
          onChange={update}
          className="w-full rounded-xl border p-4"
        />

      </div>

      <button
        onClick={signup}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-4 text-lg font-semibold text-white"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("auth.creating")}
          </>
        ) : (
          <>
            <UserPlus className="h-5 w-5" />
            {t("auth.createAccount")}
          </>
        )}
      </button>

      <p className="mt-6 text-center text-slate-500">

        {t("auth.hasAccount")}

        <Link
          href="/login"
          className="ml-2 font-semibold text-blue-600"
        >
          {t("auth.login")}
        </Link>

      </p>

    </div>
  );
}