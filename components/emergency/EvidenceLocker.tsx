"use client";

import {
  FileImage,
  FileText,
  MessageCircle,
  CreditCard,
  Lock,
  Upload,
  Download,
  Eye,
  ShieldCheck,
} from "lucide-react";

const evidence = [
  {
    name: "OfferLetter.pdf",
    type: "PDF Document",
    size: "1.2 MB",
    icon: FileText,
    color: "text-red-600 bg-red-100",
  },
  {
    name: "PaymentReceipt.jpg",
    type: "Image",
    size: "850 KB",
    icon: FileImage,
    color: "text-green-600 bg-green-100",
  },
  {
    name: "WhatsAppChat.png",
    type: "Screenshot",
    size: "640 KB",
    icon: MessageCircle,
    color: "text-blue-600 bg-blue-100",
  },
  {
    name: "BankTransaction.pdf",
    type: "Statement",
    size: "950 KB",
    icon: CreditCard,
    color: "text-purple-600 bg-purple-100",
  },
];

export default function EvidenceLocker() {
  return (
    <section className="mt-16 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50 p-10 shadow-xl">

      {/* Header */}

      <div className="text-center">

        <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">

          EVIDENCE LOCKER

        </span>

        <h2 className="mt-5 text-4xl font-bold text-slate-900">

          Secure Evidence Vault

        </h2>

        <p className="mt-3 text-slate-600">

          Store every important document safely for investigation.

        </p>

      </div>

      {/* Storage */}

      <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="text-2xl font-bold">

              Secure Cloud Storage

            </h3>

            <p className="mt-2 text-slate-500">

              End-to-end encrypted evidence locker

            </p>

          </div>

          <Lock className="h-12 w-12 text-blue-600" />

        </div>

        <div className="mt-8 h-4 rounded-full bg-slate-200">

          <div
            className="h-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
            style={{ width: "42%" }}
          />

        </div>

        <div className="mt-3 flex justify-between text-sm text-slate-500">

          <span>2.1 GB Used</span>

          <span>5 GB Available</span>

        </div>

      </div>

      {/* Upload Button */}

      <div className="mt-10">

        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 py-6 text-lg font-semibold text-blue-700 transition hover:bg-blue-100">

          <Upload className="h-6 w-6" />

          Upload New Evidence

        </button>

      </div>

      {/* Files */}

      <div className="mt-10 space-y-6">

        {evidence.map((file) => {

          const Icon = file.icon;

          return (

            <div
              key={file.name}
              className="rounded-3xl bg-white p-6 shadow-lg transition hover:shadow-2xl"
            >

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-5">

                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${file.color}`}
                  >

                    <Icon className="h-8 w-8" />

                  </div>

                  <div>

                    <h3 className="text-xl font-bold">

                      {file.name}

                    </h3>

                    <p className="mt-2 text-slate-500">

                      {file.type} • {file.size}

                    </p>

                  </div>

                </div>

                <div className="flex gap-3">

                  <button className="rounded-xl bg-blue-100 p-3 text-blue-600 transition hover:bg-blue-200">

                    <Eye className="h-5 w-5" />

                  </button>

                  <button className="rounded-xl bg-green-100 p-3 text-green-600 transition hover:bg-green-200">

                    <Download className="h-5 w-5" />

                  </button>

                </div>

              </div>

            </div>

          );

        })}

      </div>

      {/* Security Card */}

      <div className="mt-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl">

        <div className="flex items-start gap-5">

          <ShieldCheck className="mt-1 h-12 w-12" />

          <div>

            <h2 className="text-3xl font-bold">

              AI Evidence Protection

            </h2>

            <p className="mt-5 leading-8 text-blue-100">

              Every uploaded document is securely stored and can
              be attached directly while generating your cyber
              complaint. Keeping original evidence greatly helps
              investigators verify recruitment fraud.

            </p>

          </div>

        </div>

      </div>

    </section>
  );
}