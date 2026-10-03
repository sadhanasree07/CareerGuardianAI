"use client";

import {
  PhoneCall,
  ShieldAlert,
  Building2,
  Landmark,
  Globe,
  ArrowUpRight,
} from "lucide-react";

const contacts = [
  {
    icon: PhoneCall,
    title: "National Cyber Helpline",
    value: "1930",
    description: "24×7 Fraud Reporting",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: ShieldAlert,
    title: "Cyber Crime Police",
    value: "Nearest Cyber Cell",
    description: "File FIR Immediately",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Landmark,
    title: "Bank Fraud Desk",
    value: "1800-000-000",
    description: "Freeze Transactions",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Building2,
    title: "Legal Aid",
    value: "Free Consultation",
    description: "Know Your Rights",
    color: "bg-purple-100 text-purple-600",
  },
];

export default function EmergencyContacts() {
  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-red-50 via-white to-orange-50 p-10 shadow-xl">

      {/* Header */}

      <div className="text-center">

        <span className="rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-600">

          EMERGENCY CONTACTS

        </span>

        <h2 className="mt-5 text-4xl font-bold text-slate-900">

          Get Help Immediately

        </h2>

        <p className="mt-3 text-slate-600">

          Contact the appropriate authorities as soon as possible
          to improve your chances of recovery.

        </p>

      </div>

      {/* Contact Cards */}

      <div className="mt-12 grid gap-8 md:grid-cols-2">

        {contacts.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.color}`}
              >

                <Icon className="h-8 w-8" />

              </div>

              <h3 className="mt-6 text-2xl font-bold">

                {item.title}

              </h3>

              <h2 className="mt-4 text-3xl font-bold text-blue-600">

                {item.value}

              </h2>

              <p className="mt-3 text-slate-600">

                {item.description}

              </p>

              <button className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-800">

                Contact Now

                <ArrowUpRight className="h-4 w-4" />

              </button>

            </div>

          );

        })}

      </div>

      {/* Important Notice */}

      <div className="mt-12 rounded-3xl bg-gradient-to-r from-red-600 to-orange-500 p-8 text-white shadow-xl">

        <div className="flex items-start gap-5">

          <Globe className="mt-1 h-10 w-10" />

          <div>

            <h3 className="text-2xl font-bold">

              Immediate Action Recommended

            </h3>

            <p className="mt-4 leading-8 text-red-100">

              If money has already been transferred, contact your
              bank and the National Cyber Helpline (1930)
              immediately. Early reporting can significantly
              increase the possibility of freezing fraudulent
              transactions.

            </p>

          </div>

        </div>

      </div>

    </section>
  );
}