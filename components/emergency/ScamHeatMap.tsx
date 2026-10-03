"use client";

import { useEffect, useState } from "react";
import { MapPinned, ShieldAlert } from "lucide-react";

type LocationReport = {
  location: string;
  reportCount: number;
  latestReport: string;
  categories: string[];
};

export default function ScamHeatMap() {
  const [locations, setLocations] = useState<LocationReport[]>([]);
  const [selected, setSelected] = useState<LocationReport | null>(null);
  const [status, setStatus] = useState("Loading reported locations...");

  useEffect(() => {
    let active = true;
    fetch("/api/community-alerts", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);
        if (!active) return;
        const data = Array.isArray(result.locations) ? result.locations as LocationReport[] : [];
        setLocations(data);
        setStatus(data.length ? "Aggregated community reports by location" : "No location-based community reports yet.");
      })
      .catch(() => active && setStatus("Reported locations are temporarily unavailable."));
    return () => { active = false; };
  }, []);

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-blue-50 p-3 text-blue-800"><MapPinned className="h-6 w-6" /></div>
        <div><p className="text-sm font-semibold uppercase text-blue-800">Community data</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Scam reports by location</h2><p className="mt-2 text-sm text-slate-600">Aggregated reports only. Exact addresses and personal details are not shown.</p></div>
      </div>
      <p role="status" className="mt-5 text-sm text-slate-600">{status}</p>
      {locations.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{locations.map((item) => <button type="button" key={item.location} onClick={() => setSelected(item)} className={`rounded-lg border p-4 text-left transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${selected?.location === item.location ? "border-red-400 bg-red-50" : "border-slate-200"}`}><div className="flex items-center justify-between gap-3"><span className="font-semibold text-slate-900">{item.location}</span><span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">{item.reportCount} {item.reportCount === 1 ? "report" : "reports"}</span></div><span className="mt-2 block text-xs text-slate-500">Latest: {new Date(item.latestReport).toLocaleDateString()}</span></button>)}</div>}
      {selected && <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4" aria-live="polite"><h3 className="font-semibold text-blue-950">{selected.location} · {selected.reportCount} reports</h3><p className="mt-2 text-sm text-blue-900">Categories: {selected.categories.join(", ") || "Not specified"}</p><p className="mt-1 text-sm text-blue-900">Most recent incident date: {new Date(selected.latestReport).toLocaleDateString()}</p></div>}
      {locations.length === 0 && status.startsWith("No ") && <div className="mt-5 flex items-center gap-3 rounded-lg border border-dashed p-5 text-sm text-slate-600"><ShieldAlert className="h-5 w-5 shrink-0 text-slate-400" />Location visualization will appear when reports include a city or region.</div>}
    </section>
  );
}