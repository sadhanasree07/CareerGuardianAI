"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Languages,
  Volume2,
  VolumeX,
  Save,
  CheckCircle2,
  Globe2,
  Bell,
} from "lucide-react";

import { useLanguage } from "@/src/context/LanguageContext";
import { speakText } from "@/src/lib/speech";

const languages = [
  { code: "en", name: "English" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
];

const notificationCategories = [
  { value: "new-openings", labelKey: "settings.newOpenings" },
  { value: "internships", labelKey: "settings.internships" },
  { value: "remote", labelKey: "settings.remote" },
  { value: "career-recommendations", labelKey: "settings.careerRecommendations" },
] as const;

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [jobSettings, setJobSettings] = useState({ enabled: false, frequency: "daily", minimumMatchScore: 60, categories: ["new-openings", "career-recommendations"] });

  useEffect(() => {
    const savedVoice =
      localStorage.getItem("guardian-voice");

    if (savedVoice) {
      setVoiceEnabled(savedVoice === "true");
    }
    fetch("/api/settings/notifications", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((result) => {
      if (result?.preferences) setJobSettings(result.preferences);
    }).catch(() => undefined);
  }, []);

  function saveSettings() {
    localStorage.setItem(
      "guardian-voice",
      String(voiceEnabled)
    );

    fetch("/api/settings/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobSettings),
    }).catch((error) => console.error("Notification settings save failed", error));

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function testVoice() {
    if (!voiceEnabled) return;

    speakText(t("voiceTestMessage"), language);
  }

  return (
    <main className="min-h-screen bg-slate-100">

      <section className="mx-auto max-w-4xl px-6 py-10">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />

          {t("back")} {t("dashboard")}
        </Link>

        <div className="mt-8">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-blue-600 p-4 text-white">

              <Globe2 className="h-8 w-8" />

            </div>

            <div>

              <h1 className="text-4xl font-black text-slate-900">

                {t("languageSettingsTitle")}

              </h1>

              <p className="mt-2 text-slate-500">

                {t("languageSettingsSubtitle")}

              </p>

            </div>

          </div>

        </div>

        <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-cyan-100 p-3"><Bell className="h-7 w-7 text-cyan-700" /></div>
            <div><h2 className="text-2xl font-black text-slate-900">{t("settings.notificationsTitle")}</h2><p className="mt-1 text-slate-500">{t("settings.notificationsDescription")}</p></div>
            <button type="button" aria-label={t("settings.enableNotifications")} onClick={() => setJobSettings((prev) => ({ ...prev, enabled: !prev.enabled }))} className={`relative ml-auto h-9 w-16 rounded-full transition ${jobSettings.enabled ? "bg-cyan-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition ${jobSettings.enabled ? "left-8" : "left-1"}`} /></button>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="font-bold text-slate-700">{t("settings.frequency")}<select value={jobSettings.frequency} onChange={(event) => setJobSettings((prev) => ({ ...prev, frequency: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-4"><option value="instant">{t("settings.instant")}</option><option value="daily">{t("settings.daily")}</option><option value="weekly">{t("settings.weekly")}</option></select></label>
            <label className="font-bold text-slate-700">{t("settings.minimumMatchScore")}: {jobSettings.minimumMatchScore}%<input type="range" min="0" max="100" value={jobSettings.minimumMatchScore} onChange={(event) => setJobSettings((prev) => ({ ...prev, minimumMatchScore: Number(event.target.value) }))} className="mt-4 w-full accent-cyan-600" /></label>
          </div>
          <div className="mt-6"><p className="font-bold text-slate-700">{t("settings.categories")}</p><div className="mt-3 flex flex-wrap gap-2">{notificationCategories.map(({ value, labelKey }) => <label key={value} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm"><input type="checkbox" checked={jobSettings.categories.includes(value)} onChange={() => setJobSettings((prev) => ({ ...prev, categories: prev.categories.includes(value) ? prev.categories.filter((item) => item !== value) : [...prev.categories, value] }))} />{t(labelKey)}</label>)}</div></div>
        </div>

        {/* LANGUAGE */}

        <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-blue-100 p-3">

              <Languages className="h-7 w-7 text-blue-600" />

            </div>

            <div>

              <h2 className="text-2xl font-black text-slate-900">

                {t("speakYourLanguage")}

              </h2>

              <p className="mt-1 text-slate-500">

                {t("choosePreferredLanguage")}

              </p>

            </div>

          </div>

          <div className="mt-7">

            <label className="mb-3 block font-bold text-slate-700">

              {t("preferredLanguage")}

            </label>

            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-semibold outline-none focus:border-blue-500"
            >

              {languages.map((item) => (

                <option
                  key={item.code}
                  value={item.code}
                >

                  {item.name}

                </option>

              ))}

            </select>

          </div>

        </div>

        {/* VOICE */}

        <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-purple-100 p-3">

                {voiceEnabled ? (

                  <Volume2 className="h-7 w-7 text-purple-600" />

                ) : (

                  <VolumeX className="h-7 w-7 text-purple-600" />

                )}

              </div>

              <div>

                <h2 className="text-2xl font-black text-slate-900">

                  {t("voiceOutput")}

                </h2>

                <p className="mt-1 text-slate-500">

                  {t("voiceOutputDescription")}

                </p>

              </div>

            </div>

            <button
              onClick={() =>
                setVoiceEnabled(!voiceEnabled)
              }
              className={`relative h-9 w-16 rounded-full transition ${
                voiceEnabled
                  ? "bg-purple-600"
                  : "bg-slate-300"
              }`}
            >

              <span
                className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition ${
                  voiceEnabled
                    ? "left-8"
                    : "left-1"
                }`}
              />

            </button>

          </div>

          {voiceEnabled && (

            <button
              onClick={testVoice}
              className="mt-7 flex items-center gap-2 rounded-xl bg-purple-100 px-5 py-3 font-bold text-purple-700 transition hover:bg-purple-200"
            >

              <Volume2 className="h-5 w-5" />

              {t("testVoice")}

            </button>

          )}

        </div>

        {/* INFO */}

        <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-6">

          <h3 className="font-black text-blue-900">

            {t("aiLanguageSupport")}

          </h3>

          <p className="mt-2 leading-7 text-blue-700">

            {t("aiLanguageSupportText")}

          </p>

        </div>

        {/* SAVE */}

        <button
          onClick={saveSettings}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 text-lg font-black text-white shadow-lg transition hover:scale-[1.01]"
        >

          {saved ? (

            <>
              <CheckCircle2 className="h-6 w-6" />

              {t("settingsSaved")}
            </>

          ) : (

            <>
              <Save className="h-6 w-6" />

              {t("savePreferences")}
            </>

          )}

        </button>

      </section>

    </main>
  );
}