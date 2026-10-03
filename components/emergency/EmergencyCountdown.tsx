"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

export default function EmergencyCountdown() {

  const [seconds, setSeconds] =
    useState(1800);

  useEffect(() => {

    const timer = setInterval(() => {

      setSeconds((prev) =>

        prev > 0 ? prev - 1 : 0

      );

    }, 1000);

    return () => clearInterval(timer);

  }, []);

  return (

    <div className="rounded-2xl bg-yellow-400 p-6 text-center text-red-800 shadow">

      <Timer className="mx-auto mb-3 h-8 w-8" />

      <h3 className="text-xl font-bold">

        Best Recovery Window

      </h3>

      <h2 className="mt-3 text-4xl font-black">

        {Math.floor(seconds / 60)}:
        {(seconds % 60)
          .toString()
          .padStart(2, "0")}

      </h2>

      <p className="mt-3">

        Report immediately to maximize
        recovery chances.

      </p>

    </div>

  );

}