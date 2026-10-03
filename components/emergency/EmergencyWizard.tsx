"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Landmark,
  ShieldCheck,
  MessageSquareText,
  FileText,
  Phone,
  CreditCard,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onFinish: (data: any) => void;
}

const BANKS = ["SBI", "HDFC", "ICICI", "Axis", "Canara", "Indian Bank", "IOB", "PNB"];

export default function EmergencyWizard({ open, onClose, onFinish }: Props) {
  const [step, setStep] = useState(1);

  interface FormState {
    paid: string;
    amount: string;
    bank: string;
    hasProof: string;
    hasEvidence: string;
    blocked: string;
  }

  const [form, setForm] = useState<FormState>({
    paid: "",
    amount: "",
    bank: "SBI",
    hasProof: "",
    hasEvidence: "",
    blocked: "",
  });

  if (!open) return null;

  function next() {
    if (step < 5) {
      setStep(step + 1);
      return;
    }
    onFinish(form);
  }

  function back() {
    if (step === 1) {
      onClose();
      return;
    }
    setStep(step - 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-8 text-white shadow-2xl sm:p-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl bg-white/10 p-3">
            <AlertTriangle className="h-10 w-10 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Raise a Complaint</h2>
            <p className="text-sm text-red-100">Report fraud, preserve evidence & start recovery.</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-3 flex justify-between text-sm text-red-100">
            <span>Recovery Step {step} of 5</span>
            <span>{step * 20}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-red-900/70">
            <div className="h-full rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${step * 20}%` }} />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-yellow-300" />
              <div>
                <h3 className="text-2xl font-bold">Did you pay any money?</h3>
                <p className="text-sm text-red-100">This helps Guardian AI prioritize the recovery steps.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(["Yes", "No"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, paid: value })}
                  className={`rounded-2xl border-2 p-6 text-left transition ${
                    form.paid === value
                      ? "border-yellow-300 bg-yellow-400 text-red-800"
                      : "border-white/20 bg-white/10 text-white"
                  }`}
                >
                  <div className="text-lg font-semibold">{value}</div>
                  <div className="mt-2 text-sm text-red-100">{value === "Yes" ? "Capture the loss amount and trigger bank response" : "Continue with evidence and complaint preparation"}</div>
                </button>
              ))}
            </div>

            {form.paid === "Yes" && (
              <div className="rounded-2xl bg-white/10 p-4">
                <label className="text-sm font-semibold text-red-100">Approximate amount lost</label>
                <input
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="₹ 5000"
                  className="mt-3 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-base text-slate-900 outline-none"
                />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Landmark className="h-8 w-8 text-yellow-300" />
              <div>
                <h3 className="text-2xl font-bold">Which bank did you use?</h3>
                <p className="text-sm text-red-100">This helps the AI bank recovery assistant open the correct fraud channel.</p>
              </div>
            </div>

            <select
              value={form.bank}
              onChange={(e) => setForm({ ...form, bank: e.target.value })}
              className="w-full rounded-2xl border border-white/20 bg-white px-4 py-4 text-base text-slate-900 outline-none"
            >
              {BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-yellow-300" />
              <div>
                <h3 className="text-2xl font-bold">Do you still have payment proof?</h3>
                <p className="text-sm text-red-100">Proof makes the complaint and evidence locker much stronger.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(["Yes", "No"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, hasProof: value })}
                  className={`rounded-2xl border-2 p-6 text-left transition ${
                    form.hasProof === value
                      ? "border-yellow-300 bg-yellow-400 text-red-800"
                      : "border-white/20 bg-white/10 text-white"
                  }`}
                >
                  <div className="text-lg font-semibold">{value}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <MessageSquareText className="h-8 w-8 text-yellow-300" />
              <div>
                <h3 className="text-2xl font-bold">Do you have WhatsApp chats or emails?</h3>
                <p className="text-sm text-red-100">These become part of your evidence vault and complaint details.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(["Yes", "No"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, hasEvidence: value })}
                  className={`rounded-2xl border-2 p-6 text-left transition ${
                    form.hasEvidence === value
                      ? "border-yellow-300 bg-yellow-400 text-red-800"
                      : "border-white/20 bg-white/10 text-white"
                  }`}
                >
                  <div className="text-lg font-semibold">{value}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-yellow-300" />
              <div>
                <h3 className="text-2xl font-bold">Has the recruiter blocked you?</h3>
                <p className="text-sm text-red-100">This is used to prioritize the next legal and cyber-crime steps.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(["Yes", "No"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, blocked: value })}
                  className={`rounded-2xl border-2 p-6 text-left transition ${
                    form.blocked === value
                      ? "border-yellow-300 bg-yellow-400 text-red-800"
                      : "border-white/20 bg-white/10 text-white"
                  }`}
                >
                  <div className="text-lg font-semibold">{value}</div>
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-white/10 p-4 text-sm text-red-100">
              <div className="flex items-center gap-2 font-semibold text-yellow-300">
                <ShieldCheck className="h-5 w-5" />
                Recovery dashboard will now generate with your selected bank, evidence status, and complaint readiness.
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-between">
          <button type="button" onClick={back} className="flex items-center gap-2 rounded-2xl bg-white/20 px-6 py-3 font-semibold">
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <button type="button" onClick={next} className="flex items-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 font-semibold text-red-800">
            {step === 5 ? "Generate Recovery" : "Next"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}