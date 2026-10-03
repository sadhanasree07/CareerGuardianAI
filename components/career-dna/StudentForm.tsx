"use client";

import { useEffect, useState } from "react";

import {
  BrainCircuit,
  GraduationCap,
  Code2,
  FolderGit2,
  Briefcase,
  ShieldCheck,
  Building2,
 IndianRupee,
} from "lucide-react";

import {
  StudentProfile,
  VerifiedJob,
  JobPreferences,
} from "@/types/career-dna";

interface Props {
  verifiedJob: any;
  onAnalyze: (student: StudentProfile) => void;
}

export default function StudentForm({
  verifiedJob,
  onAnalyze,
}: Props) {
  const [student, setStudent] = useState<StudentProfile>({
    degree: "",
    year: "",
    cgpa: "",
    skills: "",
    projects: "",
    internship: "",
    github: "",
    linkedin: "",
    jobPreferences: { roles: [], skills: [], locations: [], employmentTypes: [], preferredCompanies: [], minimumMatchScore: 60 },
  });

  const roles = ["Software Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Analyst", "Data Scientist", "AI Engineer", "Machine Learning Engineer", "UI/UX Designer", "Cybersecurity Analyst", "Cloud Engineer"];
  const skills = ["React", "Next.js", "JavaScript", "TypeScript", "Python", "Java", "Node.js", "MongoDB", "SQL", "Machine Learning", "AI", "Cloud"];
  const locations = ["Chennai", "Bangalore", "Hyderabad", "Mumbai", "Pune", "Remote"];
  const employmentTypes = ["Full Time", "Internship", "Part Time", "Remote"];

  function update(
    key: keyof StudentProfile,
    value: string
  ) {

    setStudent((prev) => ({
      ...prev,
      [key]: value,
    }));

  }

  function togglePreference(key: keyof Pick<JobPreferences, "roles" | "skills" | "locations" | "employmentTypes">, value: string) {
    setStudent((prev) => {
      const preferences = prev.jobPreferences || { roles: [], skills: [], locations: [], employmentTypes: [], preferredCompanies: [], minimumMatchScore: 60 };
      const values = preferences[key].includes(value) ? preferences[key].filter((item) => item !== value) : [...preferences[key], value];
      return { ...prev, jobPreferences: { ...preferences, [key]: values } };
    });
  }

  return (

    <div className="space-y-8">

      {/* VERIFIED JOB */}

      <div className="rounded-3xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-8 shadow">

        <div className="mb-8 flex items-center gap-4">

          <ShieldCheck className="h-10 w-10 text-green-600" />

          <div>

            <h2 className="text-3xl font-bold">

              Verified Recruitment

            </h2>

            <p className="text-slate-600">

              This recruitment was verified by Guardian Verify™

            </p>

          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          <Card
            icon={<Building2 />}
            title="Company"
value={verifiedJob?.company}          />

          <Card
            icon={<Briefcase />}
            title="Role"
            value={verifiedJob?.jobRole}
          />

          <Card
            icon={<IndianRupee />}
            title="Salary"
            value={verifiedJob?.salary}
          />

          <Card
            icon={<GraduationCap />}
            title="Education"
            value={verifiedJob?.education}
          />

        </div>

        <div className="mt-8 rounded-2xl bg-white p-6">

          <h3 className="mb-4 text-xl font-bold">

            Required Skills

          </h3>

          <div className="flex flex-wrap gap-3">

            {verifiedJob?.requiredSkills?.map((skill: string) => (

                <span
                  key={skill}
                  className="rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-700"
                >

                  {skill}

                </span>

              )
            )}

          </div>

        </div>

      </div>

      <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-slate-900">Career Interests &amp; Job Preferences</h2>
        <p className="mt-2 text-slate-500">Tune recommendations to the work you actually want.</p>
        <PreferenceGroup title="Interested Job Roles" values={roles} selected={student.jobPreferences?.roles || []} onToggle={(value) => togglePreference("roles", value)} />
        <PreferenceGroup title="Preferred Skills" values={skills} selected={student.jobPreferences?.skills || []} onToggle={(value) => togglePreference("skills", value)} />
        <PreferenceGroup title="Preferred Location" values={locations} selected={student.jobPreferences?.locations || []} onToggle={(value) => togglePreference("locations", value)} />
        <PreferenceGroup title="Employment Type" values={employmentTypes} selected={student.jobPreferences?.employmentTypes || []} onToggle={(value) => togglePreference("employmentTypes", value)} />
        <label className="mt-6 block font-semibold text-slate-700">Preferred Companies (optional)
          <input className="mt-2 w-full rounded-xl border border-slate-300 p-4" placeholder="Google, Zoho, Microsoft" onChange={(event) => setStudent((prev) => ({ ...prev, jobPreferences: { ...prev.jobPreferences!, preferredCompanies: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } }))} />
        </label>
        <label className="mt-6 block font-semibold text-slate-700">Minimum Career Match Score: {student.jobPreferences?.minimumMatchScore || 60}%
          <input type="range" min="0" max="100" value={student.jobPreferences?.minimumMatchScore || 60} className="mt-3 w-full accent-blue-600" onChange={(event) => setStudent((prev) => ({ ...prev, jobPreferences: { ...prev.jobPreferences!, minimumMatchScore: Number(event.target.value) } }))} />
        </label>
      </div>

      {/* STUDENT */}

      <div className="rounded-3xl bg-white p-8 shadow-xl">

        <div className="flex items-center gap-4">

          <BrainCircuit className="h-10 w-10 text-blue-600" />

          <div>

            <h2 className="text-3xl font-bold">

              Student Profile

            </h2>

            <p className="text-slate-500">

              Guardian AI will compare this profile with the verified recruitment.

            </p>

          </div>

        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">

          <Input
            icon={<GraduationCap />}
            title="Degree"
            value={student.degree}
            onChange={(v: string)=>update("degree",v)}
          />

          <Input
            icon={<GraduationCap />}
            title="Current Year"
            value={student.year}
            onChange={(v: string)=>update("year",v)}
          />

          <Input
            icon={<GraduationCap />}
            title="CGPA"
            value={student.cgpa}
            onChange={(v: string)=>update("cgpa",v)}
          />

          <Input
            icon={<Code2 />}
            title="Skills"
            value={student.skills}
            onChange={(v: string)=>update("skills",v)}
          />

          <Input
            icon={<FolderGit2 />}
            title="Projects"
            value={student.projects}
            onChange={(v: string)=>update("projects",v)}
          />

          <Input
            icon={<Briefcase />}
            title="Internship"
            value={student.internship}
            onChange={(v: string)=>update("internship",v)}
          />

          <Input
            icon={<Code2 />}
            title="GitHub"
            value={student.github}
            onChange={(v: string)=>update("github",v)}
          />

          <Input
            icon={<Code2 />}
            title="LinkedIn"
            value={student.linkedin}
            onChange={(v: string)=>update("linkedin",v)}
          />

        </div>

        <button
          onClick={() => onAnalyze(student)}
          className="mt-10 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-5 text-lg font-bold text-white"
        >

          Generate Guardian Career DNA™

        </button>

      </div>

    </div>

  );

}

function Card({
  icon,
  title,
  value,
}:any){

  return(

    <div className="rounded-2xl bg-white p-5">

      <div className="mb-3 text-blue-600">

        {icon}

      </div>

      <p className="text-sm text-slate-500">

        {title}

      </p>

      <h3 className="mt-2 font-bold">

        {value || "-"}

      </h3>

    </div>

  );

}

function Input({
  icon,
  title,
  value,
  onChange,
}:any){

  return(

    <div>

      <label className="mb-2 flex items-center gap-2 font-semibold">

        {icon}

        {title}

      </label>

      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-600"
      />

    </div>

  );

}

function PreferenceGroup({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <div className="mt-6"><h3 className="mb-3 font-bold text-slate-700">{title}</h3><div className="flex flex-wrap gap-2">{values.map((value) => <button type="button" key={value} onClick={() => onToggle(value)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selected.includes(value) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300"}`}>{value}</button>)}</div></div>;
}