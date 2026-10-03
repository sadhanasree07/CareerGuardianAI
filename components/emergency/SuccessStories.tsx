"use client";

import {
  CheckCircle2,
  ShieldCheck,
  Wallet,
  Users,
} from "lucide-react";

const stories = [
  {
    icon: Wallet,
    color: "bg-green-100 text-green-600",
    title: "₹12,000 Recovered",
    subtitle: "Bank Transaction Reversed",
    description:
      "The victim reported the scam immediately through the Cyber Helpline, allowing the bank to freeze the fraudulent transaction.",
  },
  {
    icon: ShieldCheck,
    color: "bg-blue-100 text-blue-600",
    title: "Fake Recruiter Blocked",
    subtitle: "Cyber Crime Action",
    description:
      "The fake recruitment website and phone number were reported and blocked after investigation.",
  },
  {
    icon: CheckCircle2,
    color: "bg-purple-100 text-purple-600",
    title: "Complaint Resolved",
    subtitle: "Within 4 Days",
    description:
      "The victim submitted complete evidence, helping the cyber cell investigate and close the complaint quickly.",
  },
];

const stats = [
  {
    number: "350+",
    label: "Scams Reported",
  },
  {
    number: "120+",
    label: "Complaints Assisted",
  },
  {
    number: "₹8.5L",
    label: "Potential Loss Prevented",
  },
  {
    number: "95%",
    label: "User Satisfaction",
  },
];

export default function SuccessStories() {
  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-green-50 via-white to-blue-50 p-10 shadow-xl">

      {/* Header */}

      <div className="text-center">

        <span className="rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">

          IMPACT STORIES

        </span>

        <h2 className="mt-5 text-4xl font-bold text-slate-900">

          Success Stories

        </h2>

        <p className="mt-3 text-slate-600">

          Examples showing how quick reporting and proper guidance
          can reduce the impact of recruitment scams.

        </p>

      </div>

      {/* Statistics */}

      <div className="mt-12 grid gap-6 md:grid-cols-4">

        {stats.map((item) => (

          <div
            key={item.label}
            className="rounded-2xl bg-white p-6 text-center shadow-lg"
          >

            <h2 className="text-4xl font-bold text-blue-600">

              {item.number}

            </h2>

            <p className="mt-3 text-slate-600">

              {item.label}

            </p>

          </div>

        ))}

      </div>

      {/* Story Cards */}

      <div className="mt-12 grid gap-8 lg:grid-cols-3">

        {stories.map((story) => {

          const Icon = story.icon;

          return (

            <div
              key={story.title}
              className="rounded-3xl bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${story.color}`}
              >

                <Icon className="h-8 w-8" />

              </div>

              <h3 className="mt-6 text-2xl font-bold text-slate-900">

                {story.title}

              </h3>

              <p className="mt-2 font-medium text-blue-600">

                {story.subtitle}

              </p>

              <p className="mt-5 leading-7 text-slate-600">

                {story.description}

              </p>

            </div>

          );

        })}

      </div>

      {/* Bottom Quote */}

      <div className="mt-14 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-center text-white">

        <Users className="mx-auto h-10 w-10" />

        <h3 className="mt-5 text-2xl font-bold">

          Every Report Matters

        </h3>

        <p className="mx-auto mt-4 max-w-3xl leading-8 text-blue-100">

          Early reporting and preserving evidence can significantly
          improve the chances of investigation and reduce the impact
          of recruitment scams. CareerGuardian AI encourages users to
          act quickly and follow the recommended recovery steps.

        </p>

      </div>

    </section>
  );
}