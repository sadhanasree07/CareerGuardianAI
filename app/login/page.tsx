"use client";

import AuthHeader from "@/components/auth/AuthHeader";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      <section className="mx-auto max-w-6xl px-6 py-14">

        <AuthHeader />

        <div className="mx-auto mt-12 max-w-xl">

          <LoginForm />

        </div>

      </section>

    </main>
  );
}