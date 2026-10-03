"use client";

import {
  useState,
} from "react";

import {
  AlertTriangle,
  Send,
  Loader2,
} from "lucide-react";

export default function ReportScam() {

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      company: "",
      website: "",
      description: "",
      location: "",
    });

  function update(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,

      [e.target.name]:
        e.target.value,
    });
  }

  async function submitReport() {

    if (!form.company.trim()) {
      alert(
        "Please enter the company name."
      );

      return;
    }

    try {

      setLoading(true);

      const userId =
        localStorage.getItem(
          "userId"
        );

      const response =
        await fetch(
          "/api/report-scam",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              ...form,

              userId,
            }),
          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Thank you! Your community report has been submitted."
        );

        setForm({
          company: "",
          website: "",
          description: "",
          location: "",
        });

      } else {

        alert(
          result.message ||
          "Failed to submit report."
        );

      }

    } catch (error) {

      console.error(error);

      alert(
        "Something went wrong."
      );

    } finally {

      setLoading(false);

    }
  }

  return (

    <section
      id="report-scam"
      className="mt-16 rounded-3xl bg-white p-8 shadow-xl"
    >

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-red-100 p-4">

          <AlertTriangle className="h-7 w-7 text-red-600" />

        </div>

        <div>

          <h2 className="text-2xl font-black text-slate-900">

            Report Suspicious Recruitment

          </h2>

          <p className="mt-1 text-slate-500">

            Help protect other students by
            reporting suspicious opportunities.

          </p>

        </div>

      </div>

      <div className="mt-8 space-y-5">

        <input
          name="company"
          value={form.company}
          onChange={update}
          placeholder="Company or Organization Name"
          className="w-full rounded-xl border p-4"
        />

        <input
          name="website"
          value={form.website}
          onChange={update}
          placeholder="Website (optional)"
          className="w-full rounded-xl border p-4"
        />

        <input
          name="location"
          value={form.location}
          onChange={update}
          placeholder="City / Location (optional)"
          className="w-full rounded-xl border p-4"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={update}
          placeholder="Explain why you believe this recruitment opportunity is suspicious..."
          rows={5}
          className="w-full rounded-xl border p-4"
        />

      </div>

      <div className="mt-5 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">

        ⚠️ A community report does not
        automatically mean that a company is
        officially classified as a scam.

        Multiple reports are used to generate
        community confidence levels.

      </div>

      <button
        onClick={submitReport}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 py-4 font-bold text-white disabled:opacity-60"
      >

        {loading ? (

          <>
            <Loader2 className="h-5 w-5 animate-spin" />

            Submitting Report...

          </>

        ) : (

          <>
            <Send className="h-5 w-5" />

            Submit Community Report

          </>

        )}

      </button>

    </section>

  );
}