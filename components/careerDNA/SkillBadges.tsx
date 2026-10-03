"use client";

export default function SkillBadges({
  title,
  skills,
}: {
  title: string;
  skills: string[];
}) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow">

      <h2 className="mb-6 text-2xl font-bold">
        {title}
      </h2>

      <div className="flex flex-wrap gap-3">

        {skills.map((skill, index) => (

          <span
            key={index}
            className="rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-700"
          >
            {skill}
          </span>

        ))}

      </div>

    </div>
  );
}