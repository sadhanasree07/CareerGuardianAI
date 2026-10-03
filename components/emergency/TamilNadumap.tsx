"use client";

import { useState } from "react";
import { MapPin, AlertTriangle } from "lucide-react";

const cities = [
  {
    name: "Chennai",
    top: "12%",
    left: "72%",
    color: "bg-red-500",
    risk: "High Risk",
    cases: 52,
    scam: "Fake Railway Recruitment",
  },
  {
    name: "Coimbatore",
    top: "62%",
    left: "18%",
    color: "bg-green-500",
    risk: "Low Risk",
    cases: 18,
    scam: "Internship Scam",
  },
  {
    name: "Salem",
    top: "42%",
    left: "38%",
    color: "bg-orange-500",
    risk: "Medium Risk",
    cases: 31,
    scam: "Fake Job Portal",
  },
  {
    name: "Trichy",
    top: "58%",
    left: "52%",
    color: "bg-yellow-500",
    risk: "Medium Risk",
    cases: 21,
    scam: "WhatsApp Recruitment",
  },
  {
    name: "Madurai",
    top: "74%",
    left: "56%",
    color: "bg-yellow-500",
    risk: "Medium Risk",
    cases: 15,
    scam: "Fake Offer Letter",
  },
  {
    name: "Tirunelveli",
    top: "92%",
    left: "54%",
    color: "bg-red-500",
    risk: "High Risk",
    cases: 41,
    scam: "Government Job Scam",
  },
];

export default function TamilNaduMap() {
  const [selected, setSelected] = useState(cities[0]);

  return (
    <section className="grid gap-8 lg:grid-cols-2">

      {/* MAP */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <h2 className="mb-2 text-3xl font-bold">

          Tamil Nadu Scam Map

        </h2>

        <p className="text-slate-500">

          Click a city to view scam analytics.

        </p>

        <div className="relative mt-8 h-[620px] rounded-3xl bg-gradient-to-br from-slate-100 to-blue-50">

          {/* Tamil Nadu Shape */}

          <div className="absolute left-1/2 top-1/2 h-[520px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-[80px] bg-slate-300 shadow-inner" />

          {cities.map((city) => (

            <button
              key={city.name}
              onClick={() => setSelected(city)}
              className="absolute"
              style={{
                top: city.top,
                left: city.left,
              }}
            >

              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-4 border-white shadow-xl ${city.color}`}
              />

              <p className="mt-1 whitespace-nowrap text-xs font-semibold">

                {city.name}

              </p>

            </button>

          ))}

        </div>

      </div>

      {/* DETAILS */}

      <div className="space-y-6">

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <div className="flex items-center gap-3">

            <MapPin className="h-8 w-8 text-blue-600" />

            <div>

              <h2 className="text-3xl font-bold">

                {selected.name}

              </h2>

              <p className="text-slate-500">

                Scam Analytics

              </p>

            </div>

          </div>

          <div className="mt-8 grid grid-cols-2 gap-5">

            <div className="rounded-2xl bg-red-50 p-5">

              <h3 className="text-3xl font-bold text-red-600">

                {selected.cases}

              </h3>

              <p className="mt-2 text-slate-600">

                Reported Cases

              </p>

            </div>

            <div className="rounded-2xl bg-orange-50 p-5">

              <h3 className="text-xl font-bold text-orange-600">

                {selected.risk}

              </h3>

              <p className="mt-2 text-slate-600">

                Current Risk

              </p>

            </div>

          </div>

          <div className="mt-8 rounded-2xl bg-slate-100 p-6">

            <h3 className="text-xl font-bold">

              Most Reported Scam

            </h3>

            <p className="mt-3 text-slate-600">

              {selected.scam}

            </p>

          </div>

        </div>

        {/* AI Insight */}

        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white shadow-xl">

          <div className="flex items-center gap-3">

            <AlertTriangle className="h-8 w-8" />

            <h2 className="text-2xl font-bold">

              AI Insight

            </h2>

          </div>

          <p className="mt-5 leading-8 text-blue-100">

            CareerGuardian AI predicts an increase in recruitment
            scams in <b>{selected.name}</b>. Students are advised
            to verify company websites, recruiter emails and
            payment requests before applying.

          </p>

        </div>

        {/* Legend */}

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="mb-6 text-2xl font-bold">

            Risk Legend

          </h2>

          <div className="space-y-4">

            <div className="flex items-center gap-4">

              <div className="h-5 w-5 rounded-full bg-red-500" />

              High Risk

            </div>

            <div className="flex items-center gap-4">

              <div className="h-5 w-5 rounded-full bg-orange-500" />

              Medium Risk

            </div>

            <div className="flex items-center gap-4">

              <div className="h-5 w-5 rounded-full bg-green-500" />

              Low Risk

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}