"use client";

import { ShieldCheck } from "lucide-react";

export default function StrengthCard() {

  const strengths = [

    "Embedded Systems",

    "PCB Design",

    "IoT Development",

    "Arduino & ESP32",

    "Problem Solving",

    "Hackathon Experience"

  ];

  return (

    <div className="rounded-3xl bg-white p-8 shadow">

      <div className="flex items-center gap-3">

        <ShieldCheck className="h-8 w-8 text-green-600"/>

        <h2 className="text-2xl font-bold">

          AI Strength Analysis

        </h2>

      </div>

      <div className="mt-8 space-y-4">

        {strengths.map((item,index)=>(

          <div
            key={index}
            className="rounded-xl bg-green-50 p-4 font-medium text-green-700"
          >

            ✅ {item}

          </div>

        ))}

      </div>

    </div>

  );

}