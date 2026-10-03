"use client";

import { useState } from "react";
import {
  GraduationCap,
  Code2,
  FolderGit2,
  Briefcase,
  BrainCircuit,
} from "lucide-react";

interface Props {
  onAnalyze: (profile: any) => void;
}

export default function StudentForm({
  onAnalyze,
}: Props) {
  const [profile, setProfile] = useState({
    degree: "",
    year: "",
    cgpa: "",
    skills: "",
    projects: "",
    internship: "",
    github: "",
    linkedin: "",
  });

  function update(
    key: string,
    value: string
  ) {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-blue-100 p-4">

          <BrainCircuit className="h-8 w-8 text-blue-600" />

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            Guardian Career DNA™

          </h2>

          <p className="text-slate-500">

            Tell Guardian AI about yourself.

          </p>

        </div>

      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">

        <Input
          icon={<GraduationCap />}
          title="Degree"
          placeholder="B.E ECE"
          value={profile.degree}
          onChange={(v: string) => update("degree", v)}
        />

        <Input
          icon={<GraduationCap />}
          title="Current Year"
          placeholder="3rd Year"
          value={profile.year}
          onChange={(v: string) => update("year", v)}
        />

        <Input
          icon={<GraduationCap />}
          title="CGPA"
          placeholder="8.5"
          value={profile.cgpa}
          onChange={(v: string) => update("cgpa", v)}
        />

        <Input
          icon={<Code2 />}
          title="Skills"
          placeholder="Embedded C, PCB, Arduino"
          value={profile.skills}
          onChange={(v: string) => update("skills", v)}
        />

        <Input
          icon={<FolderGit2 />}
          title="Projects"
          placeholder="Smart Blind Stick, IoT Meter..."
          value={profile.projects}
          onChange={(v: string) => update("projects", v)}
        />

        <Input
          icon={<Briefcase />}
          title="Internship"
          placeholder="Embedded Internship"
          value={profile.internship}
          onChange={(v: string) => update("internship", v)}
        />

        <Input
          icon={<Code2 />}
          title="GitHub"
          placeholder="https://github.com/..."
          value={profile.github}
          onChange={(v: string) => update("github", v)}
        />

        <Input
          icon={<Code2 />}
          title="LinkedIn"
          placeholder="https://linkedin.com/in/..."
          value={profile.linkedin}
          onChange={(v: string) => update("linkedin", v)}
        />

      </div>

      <button
        onClick={() => onAnalyze(profile)}
        className="mt-10 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-5 text-lg font-bold text-white transition hover:scale-[1.02]"
      >
        Generate AI Career DNA
      </button>

    </div>
  );
}

function Input({
  icon,
  title,
  placeholder,
  value,
  onChange,
}: any) {
  return (
    <div>

      <label className="mb-2 flex items-center gap-2 font-semibold">

        {icon}

        {title}

      </label>

      <input
        className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-600"
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>
  );
}