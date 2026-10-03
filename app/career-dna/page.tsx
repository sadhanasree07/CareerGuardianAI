"use client";

import { useEffect, useState } from "react";

import StudentForm from "@/components/career-dna/StudentForm";
import ScoreDashboard from "@/components/career-dna/ScoreDashboard";
import SkillsAnalysis from "@/components/career-dna/SkillsAnalysis";
import CareerInsights from "@/components/career-dna/CareerInsights";
import LearningRoadmap from "@/components/career-dna/LearningRoadmap";
import CareerRecommendation from "@/components/career-dna/CareerRecommendation";
import PremiumGate from "@/components/premium/PremiumGate";

export default function CareerDNAPage() {

  const [loading, setLoading] = useState(false);

  const [report, setReport] = useState<any>(null);

  const [verifiedJob, setVerifiedJob] = useState<any>(null);

  useEffect(() => {

    loadVerification();

  }, []);

  async function loadVerification() {

    try {

      const response = await fetch("/api/verify/latest");

      const result = await response.json();

      if (result.success) {

        setVerifiedJob(result.data);

      }

    } catch (err) {

      console.error(err);

    }

  }

  async function analyze(profile: any) {

    try {

      setLoading(true);

      if (!verifiedJob) {

        alert("Please verify a recruitment first.");

        return;

      }

      const response = await fetch("/api/career-dna", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          verifiedJob,

          student: profile,

        }),

      });

      const result = await response.json();

      if (!result.success) {

        alert("Career DNA generation failed.");

        return;

      }

      setReport(result.data);

    } catch (err) {

      console.error(err);

      alert("Something went wrong.");

    } finally {

      setLoading(false);

    }

  }

  return (

    <PremiumGate>
    <main className="min-h-screen bg-slate-100">

      <section className="mx-auto max-w-7xl px-6 py-10">

        {!report && (

          <StudentForm

            verifiedJob={verifiedJob}

            onAnalyze={analyze}

          />

        )}

        {loading && (

          <div className="mt-12 rounded-3xl bg-white p-10 text-center shadow-xl">

            <h2 className="text-3xl font-bold">

              Guardian AI is analyzing your Career DNA...

            </h2>

            <p className="mt-4 text-slate-500">

              Comparing your profile with the verified recruitment.

            </p>

          </div>

        )}

        {!loading && report && (

          <div className="space-y-10">

            <ScoreDashboard data={report} />

            <SkillsAnalysis

              matchedSkills={report.matchedSkills}

              missingSkills={report.missingSkills}

              strongAreas={report.strongAreas}

              weakAreas={report.weakAreas}

            />

            <CareerInsights

              recommendedProjects={report.recommendedProjects}

              recommendedCourses={report.recommendedCourses}

              recommendedCompanies={report.recommendedCompanies}

              salaryPrediction={report.salaryPrediction}

            />

            <LearningRoadmap

              roadmap={report.learningRoadmap}

            />

            <CareerRecommendation

              recommendation={report.recommendation}

              readiness={report.readiness}

              hiringProbability={report.hiringProbability}

            />

          </div>

        )}

      </section>

    </main>
    </PremiumGate>

  );

}