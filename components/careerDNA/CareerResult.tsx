"use client";

import CareerScore from "./CareerScore";
import CareerMatches from "./CareerMatches";
import SkillBadges from "./SkillBadges";
import RoadmapTimeline from "./RoadmapTimeline";
import DownloadCareerReport from "./DownloadCareerReport";

import ATSScore from "./ATSScore";
import StrengthCard from "./StrengthCard";
import SalaryPrediction from "./SalaryPrediction";
import HiringCompanies from "./HiringCompanies";
import RecommendedCourses from "./RecommendedCourses";
import CareerReadiness from "./CareerReadiness";
import NextBestStep from "./NextBestStep";

export default function CareerResult({
  data,
}: {
  data: any;
}) {

  const careerScore =
    data?.careerMatches?.length
      ? Math.round(
          data.careerMatches.reduce(
            (sum: number, item: any) => sum + item.score,
            0
          ) / data.careerMatches.length
        )
      : 80;

  return (

    <div className="mt-10 space-y-8">

      {/* Hero */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 p-10 text-white shadow-xl">

        <h1 className="text-4xl font-bold">

          Career DNA Report

        </h1>

        <p className="mt-3 text-blue-100">

          AI-powered resume intelligence and career guidance.

        </p>

      </div>

      {/* Personal Details */}

      <div className="rounded-3xl bg-white p-8 shadow">

        <h2 className="mb-8 text-3xl font-bold">

          Personal Information

        </h2>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          <Info title="Name" value={data.name} />
          <Info title="Email" value={data.email} />
          <Info title="Phone" value={data.phone} />
          <Info title="College" value={data.college} />
          <Info title="Degree" value={data.degree} />
          <Info title="Branch" value={data.branch} />
          <Info title="CGPA" value={data.cgpa} />

        </div>

      </div>

      {/* Score */}

      <CareerScore score={careerScore} />

      {/* ATS + Readiness */}

      <div className="grid gap-8 lg:grid-cols-2">

        <ATSScore />

        <CareerReadiness />

      </div>

      {/* Strength + Career */}

      <div className="grid gap-8 lg:grid-cols-2">

        <StrengthCard />

        <CareerMatches
          careers={data.careerMatches || []}
        />

      </div>

      {/* Skills */}

      <SkillBadges
        title="Technical Skills"
        skills={data.skills || []}
      />

      {/* Projects */}

      <SkillBadges
        title="Projects"
        skills={data.projects || []}
      />

      {/* Internships */}

      <SkillBadges
        title="Internships"
        skills={data.internships || []}
      />

      {/* Certifications */}

      <SkillBadges
        title="Certifications"
        skills={data.certifications || []}
      />

      {/* Missing Skills */}

      <SkillBadges
        title="Skill Gap Analysis"
        skills={data.missingSkills || []}
      />

      {/* Salary + Companies */}

      <div className="grid gap-8 lg:grid-cols-2">

        <SalaryPrediction />

        <HiringCompanies />

      </div>

      {/* Courses */}

      <RecommendedCourses />

      {/* Roadmap */}

      <RoadmapTimeline
        roadmap={data.roadmap || []}
      />

      {/* Next Step */}

      <NextBestStep />

      {/* Download */}

      <DownloadCareerReport
        data={data}
      />

    </div>

  );

}

function Info({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (

    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-sm text-slate-500">

        {title}

      </p>

      <h3 className="mt-2 text-lg font-semibold">

        {value || "-"}

      </h3>

    </div>

  );

}