"use client";

import {
  BookOpen,
  Clock,
  Target,
  BadgeCheck,
} from "lucide-react";

const roadmaps: Record<string, any> = {
  TCS: {
    duration: "4-6 Weeks",
    salary: "₹4 - ₹7 LPA",
    difficulty: "Intermediate",
    topics: [
      "C Programming",
      "Data Structures",
      "OOPs Concepts",
      "SQL",
      "Aptitude",
      "Communication",
    ],
  },

  Infosys: {
    duration: "5 Weeks",
    salary: "₹3.6 - ₹6 LPA",
    difficulty: "Intermediate",
    topics: [
      "Java",
      "DBMS",
      "Operating Systems",
      "SQL",
      "Aptitude",
      "HR Interview",
    ],
  },

  Wipro: {
    duration: "4 Weeks",
    salary: "₹3.5 - ₹6 LPA",
    difficulty: "Beginner",
    topics: [
      "Programming",
      "Reasoning",
      "Communication",
      "Coding",
      "SQL",
    ],
  },
};

export default function CompanyRoadmap({
  company,
}: {
  company: string;
}) {
  const data =
    roadmaps[company] || {
      duration: "6 Weeks",
      salary: "Competitive",
      difficulty: "Intermediate",
      topics: [
        "Programming",
        "DSA",
        "Projects",
        "Communication",
        "Mock Interview",
      ],
    };

  return (
    <div className="mt-6 rounded-2xl bg-slate-50 p-6">

      <h3 className="mb-6 text-2xl font-bold">

        {company} Preparation Roadmap

      </h3>

      <div className="grid gap-5 md:grid-cols-3">

        <Info
          icon={<Clock className="h-5 w-5" />}
          title="Duration"
          value={data.duration}
        />

        <Info
          icon={<Target className="h-5 w-5" />}
          title="Difficulty"
          value={data.difficulty}
        />

        <Info
          icon={<BadgeCheck className="h-5 w-5" />}
          title="Salary"
          value={data.salary}
        />

      </div>

      <div className="mt-8">

        <div className="mb-4 flex items-center gap-2">

          <BookOpen className="h-6 w-6 text-violet-600"/>

          <h3 className="text-xl font-bold">

            Topics To Prepare

          </h3>

        </div>

        <div className="space-y-3">

          {data.topics.map((topic:string,index:number)=>(
            <div
              key={index}
              className="rounded-xl bg-white p-4 shadow-sm"
            >
              ✅ {topic}
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

function Info({
  icon,
  title,
  value,
}:any){
  return(
    <div className="rounded-xl bg-white p-5 shadow">

      <div className="mb-3 flex items-center gap-2">

        {icon}

        <span>{title}</span>

      </div>

      <h2 className="text-2xl font-bold">

        {value}

      </h2>

    </div>
  );
}