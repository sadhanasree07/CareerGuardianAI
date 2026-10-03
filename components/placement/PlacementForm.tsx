"use client";

import { useState } from "react";
import { Brain } from "lucide-react";

export default function PlacementForm({
  onPredict,
}: {
  onPredict: (data: any) => void;
}) {
  const [form, setForm] = useState({
    cgpa: "",
    skills: "",
    projects: "",
    internships: "",
    certifications: "",
    aptitude: "Intermediate",
    communication: "Intermediate",
    targetCompany: "",
  });

  function update(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function predict() {
  try {
    const payload = {
      ...form,

      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),

      projects: Number(form.projects),

      internships: Number(form.internships),

      certifications: Number(form.certifications),
    };

    // Call AI Placement API
    const response = await fetch("/api/placement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      alert(json.message || "Placement Prediction Failed");
      return;
    }

    // Show AI Prediction
    onPredict(json.data);

    // Save report
    await fetch("/api/reports/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        module: "Placement Predictor",
        title:
          form.targetCompany.trim() !== ""
            ? `Placement Prediction - ${form.targetCompany}`
            : "Placement Prediction",
        score: json.data.score,
        result: json.data,
      }),
    });

  } catch (error) {
    console.error(error);
    alert("Something went wrong.");
  }
}

  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="text-3xl font-bold">
        Placement Details
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        <Input
          label="CGPA"
          name="cgpa"
          value={form.cgpa}
          onChange={update}
        />

        <Input
          label="Target Company"
          name="targetCompany"
          value={form.targetCompany}
          onChange={update}
        />

        <Input
          label="Projects Completed"
          name="projects"
          value={form.projects}
          onChange={update}
        />

        <Input
          label="Internships"
          name="internships"
          value={form.internships}
          onChange={update}
        />

        <Input
          label="Certifications"
          name="certifications"
          value={form.certifications}
          onChange={update}
        />

        <div>
          <label className="mb-2 block font-medium">
            Aptitude Level
          </label>

          <select
            name="aptitude"
            value={form.aptitude}
            onChange={update}
            className="w-full rounded-xl border border-slate-300 p-3"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Communication
          </label>

          <select
            name="communication"
            value={form.communication}
            onChange={update}
            className="w-full rounded-xl border border-slate-300 p-3"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

      </div>

      <div className="mt-8">

        <label className="mb-2 block font-medium">
          Technical Skills (comma separated)
        </label>

        <textarea
          rows={5}
          name="skills"
          value={form.skills}
          onChange={update}
          placeholder="C, Embedded C, Arduino, ESP32, PCB Design..."
          className="w-full rounded-xl border border-slate-300 p-4"
        />

      </div>

      <button
        onClick={predict}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 py-4 text-lg font-semibold text-white transition hover:opacity-90"
      >

        <Brain className="h-6 w-6" />

        Predict Placement

      </button>

    </div>
  );
}

function Input({
  label,
  ...props
}: any) {
  return (
    <div>

      <label className="mb-2 block font-medium">
        {label}
      </label>

      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
      />

    </div>
  );
}