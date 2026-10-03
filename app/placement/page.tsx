"use client";

import { useState } from "react";

import PlacementHeader from "@/components/placement/PlacementHeader";
import PlacementForm from "@/components/placement/PlacementForm";
import PlacementResult from "@/components/placement/PlacementResult";
import PlacementChart from "@/components/placement/PlacementChart";
import ImprovementPlan from "@/components/placement/ImprovementPlan";
import CompanyRecommendations from "@/components/placement/CompanyRecommendations";

export default function PlacementPage() {
  const [prediction, setPrediction] = useState<any>(null);

  return (
    <main className="min-h-screen bg-slate-100">

      <section className="mx-auto max-w-7xl px-6 py-10">

        <PlacementHeader />

        <div className="mt-10">

          {!prediction ? (

            <PlacementForm
  onPredict={async (result: any) => {
    setPrediction(result);

    try {
      const userId =
        localStorage.getItem("userId");

      if (!userId) {
        console.log(
          "User not logged in. Placement result not saved."
        );

        return;
      }

      await fetch(
        "/api/placement/save",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            userId,

            prediction:
              result?.prediction ||
              result?.score ||
              0,

            readinessScore:
              result?.readinessScore ||
              result?.score ||
              0,

            placementProbability:
              result?.placementProbability ||
              result?.probability ||
              0,

            technicalScore:
              result?.technicalScore ||
              0,

            communicationScore:
              result?.communicationScore ||
              0,

            aptitudeScore:
              result?.aptitudeScore ||
              0,

            skills:
              result?.skills || [],

            companies:
              result?.companies || [],

            result,
          }),
        }
      );

    } catch (error) {
      console.error(
        "Failed to save placement data:",
        error
      );
    }
  }}
/>

          ) : (

            <div className="space-y-8">

              <PlacementResult
                result={prediction}
              />

              <PlacementChart
                result={prediction}
              />

              <ImprovementPlan
                result={prediction}
              />

              <CompanyRecommendations
                companies={prediction?.companies ?? []}
              />

            </div>

          )}

        </div>

      </section>

    </main>
  );
}