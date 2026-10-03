"use client";

import {
  PhoneCall,
  ShieldAlert,
 Building2,
  FileText,
 Upload,
  Share2,
  ArrowRight,
} from "lucide-react";

const actions = [
  {
    icon: PhoneCall,
    title: "Call Cyber Helpline",
    subtitle: "National Helpline",
    value: "1930",
    color: "from-red-500 to-red-700",
  },
  {
    icon: Building2,
    title: "Contact Bank",
    subtitle: "Freeze Transaction",
    value: "Immediate",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: ShieldAlert,
    title: "Locate Cyber Police",
    subtitle: "Nearest Cyber Cell",
    value: "Find Now",
    color: "from-purple-500 to-indigo-600",
  },
  {
    icon: FileText,
    title: "Generate Complaint",
    subtitle: "AI Complaint Letter",
    value: "Ready",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Upload,
    title: "Upload Evidence",
    subtitle: "Secure Locker",
    value: "Encrypted",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: Share2,
    title: "Share Emergency Report",
    subtitle: "Family / Police",
    value: "Share",
    color: "from-pink-500 to-rose-500",
  },
];

export default function EmergencyActions() {
  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-red-50 via-white to-orange-50 p-10 shadow-xl">

      {/* Header */}

      <div className="text-center">

        <span className="rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-700">

          EMERGENCY ACTIONS

        </span>

        <h2 className="mt-5 text-4xl font-bold text-slate-900">

          Take Immediate Action

        </h2>

        <p className="mt-3 text-slate-600">

          CareerGuardian AI recommends completing these emergency
          actions immediately after detecting recruitment fraud.

        </p>

      </div>

      {/* Action Cards */}

      <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

        {actions.map((action) => {

          const Icon = action.icon;

          return (

            <button
              key={action.title}
              className="group overflow-hidden rounded-3xl bg-white text-left shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              <div
                className={`bg-gradient-to-r ${action.color} p-6 text-white`}
              >

                <Icon className="h-10 w-10" />

              </div>

              <div className="p-6">

                <h3 className="text-2xl font-bold">

                  {action.title}

                </h3>

                <p className="mt-3 text-slate-500">

                  {action.subtitle}

                </p>

                <h4 className="mt-5 text-xl font-bold text-blue-600">

                  {action.value}

                </h4>

                <div className="mt-6 flex items-center gap-2 font-semibold text-blue-600">

                  Open

                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-2" />

                </div>

              </div>

            </button>

          );

        })}

      </div>

      {/* Emergency Notice */}

      <div className="mt-14 rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-8 text-white shadow-xl">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2 className="text-3xl font-bold">

              🚨 Immediate Action Saves Money

            </h2>

            <p className="mt-4 max-w-3xl leading-8 text-red-100">

              If payment has already been made, report the fraud
              within the first few hours. Early reporting increases
              the chances of freezing fraudulent transactions and
              recovering lost funds.

            </p>

          </div>

          <button className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-red-600 transition hover:bg-red-50">

            Call 1930 Now

          </button>

        </div>

      </div>

      {/* AI Recommendation */}

      <div className="mt-12 rounded-3xl border border-red-200 bg-white p-8 shadow-lg">

        <h3 className="text-2xl font-bold text-slate-900">

          🤖 AI Recommendation

        </h3>

        <p className="mt-5 leading-8 text-slate-600">

          Based on your investigation report, CareerGuardian AI
          recommends calling the Cyber Helpline first, followed by
          contacting your bank and submitting the AI-generated
          complaint. These actions significantly improve the
          probability of successful recovery.

        </p>

      </div>

    </section>
  );
}