"use client";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileCard from "@/components/profile/ProfileCard";
import EditProfile from "@/components/profile/EditProfile";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-50">

      <section className="mx-auto max-w-7xl px-6 py-10">

        <ProfileHeader />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <ProfileCard />

          <EditProfile />

        </div>

      </section>

    </main>
  );
}