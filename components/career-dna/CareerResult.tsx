"use client";

import JobReadiness from "./JobReadiness";
import SkillsGap from "./SkillsGap";
import Roadmap from "./Roadmap";
import SalaryGrowth from "./SalaryGrowth";

import { CareerDNAResult } from "@/types/career-dna";

interface Props {
  data: CareerDNAResult;
}

export default function CareerResult({
  data,
}: Props) {
  return (
    <div className="space-y-8">

      {/* Job Readiness */}

      <JobReadiness
        readiness={data.readiness}
      />

      {/* Skills Gap */}

      <SkillsGap
        matched={data.matchedSkills}
        missing={data.missingSkills}
      />

      {/* AI Roadmap */}

      <Roadmap
        roadmap={data.roadmap}
      />

      {/* Salary Prediction */}

      <SalaryGrowth
        salary={data.salaryPrediction}
      />

    </div>
  );
}