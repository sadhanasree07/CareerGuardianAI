"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Trophy,
  Brain,
  ShieldCheck,
} from "lucide-react";

export default function ProfileCard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");

        const json = await res.json();

        if (json.success) {
          setUser(json.user);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();
  }, []);

  if (!user) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow">
        <h2 className="text-xl font-semibold">
          Loading Profile...
        </h2>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">

      {/* Profile Header */}

      <div className="flex items-center gap-5">

        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-4xl font-bold">

          {user.name?.charAt(0).toUpperCase()}

        </div>

        <div>

          <h1 className="text-3xl font-bold">

            {user.name}

          </h1>

          <p className="text-slate-500">

            {user.email}

          </p>

        </div>

      </div>

      {/* Details */}

      <div className="mt-10 grid gap-6 md:grid-cols-2">

        <Info
          icon={<User className="h-5 w-5 text-blue-600" />}
          title="Full Name"
          value={user.name}
        />

        <Info
          icon={<Mail className="h-5 w-5 text-green-600" />}
          title="Email"
          value={user.email}
        />

        <Info
          icon={<GraduationCap className="h-5 w-5 text-violet-600" />}
          title="College"
          value={user.college || "Not Added"}
        />

        <Info
          icon={<Calendar className="h-5 w-5 text-orange-600" />}
          title="Joined"
          value={
            user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "-"
          }
        />

      </div>

      {/* AI Stats */}

      <div className="mt-10 grid gap-6 md:grid-cols-3">

        <Stat
          icon={<Brain className="h-8 w-8 text-blue-600" />}
          title="Career DNA"
          value={user.careerScore ?? 0}
        />

        <Stat
          icon={<ShieldCheck className="h-8 w-8 text-green-600" />}
          title="Reports"
          value={user.reports ?? 0}
        />

        <Stat
          icon={<Trophy className="h-8 w-8 text-yellow-500" />}
          title="Achievements"
          value={user.badges ?? 0}
        />

      </div>

    </div>
  );
}

function Info({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">

      <div className="flex items-center gap-2">

        {icon}

        <span className="text-slate-500">

          {title}

        </span>

      </div>

      <h3 className="mt-3 text-lg font-semibold">

        {value}

      </h3>

    </div>
  );
}

function Stat({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 text-center">

      <div className="flex justify-center">

        {icon}

      </div>

      <h2 className="mt-4 text-4xl font-bold">

        {value}

      </h2>

      <p className="mt-2 text-slate-500">

        {title}

      </p>

    </div>
  );
}