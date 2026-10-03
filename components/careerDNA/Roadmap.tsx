"use client";

import {
  BookOpen,
  Briefcase,
  GraduationCap,
} from "lucide-react";

export default function Roadmap() {
  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="mb-8 text-3xl font-bold">

        AI Career Roadmap

      </h2>

      <div className="space-y-6">

        <RoadStep
          icon={<GraduationCap />}
          title="Strengthen Core Skills"
          description="Master C, C++, Data Structures and Embedded C."
        />

        <RoadStep
          icon={<BookOpen />}
          title="Recommended Certifications"
          description="NPTEL Embedded Systems, PCB Design, IoT and VLSI."
        />

        <RoadStep
          icon={<Briefcase />}
          title="Industry Experience"
          description="Complete internships, hackathons and build 5 projects."
        />

      </div>

    </div>
  );
}

function RoadStep({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5">

      <div className="rounded-xl bg-blue-100 p-3 text-blue-600">

        {icon}

      </div>

      <div>

        <h3 className="font-bold">

          {title}

        </h3>

        <p className="text-slate-500">

          {description}

        </p>

      </div>

    </div>
  );
}