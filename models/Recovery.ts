import mongoose, { Schema } from "mongoose";

const RecoverySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    caseId: { type: String, required: true, unique: true },
    organization: { type: String, required: true, maxlength: 200 },
    recruiter: { type: String, default: "", maxlength: 200 },
    jobTitle: { type: String, default: "", maxlength: 200 },
    incidentDescription: { type: String, required: true, maxlength: 5000 },
    paymentMethod: { type: String, default: "", maxlength: 50 },
    amount: { type: Number, default: null, min: 0 },
    incidentDate: { type: Date, required: true },
    phone: { type: String, default: "", maxlength: 100 },
    email: { type: String, default: "", maxlength: 254 },
    location: { type: String, default: "", maxlength: 200 },
    notes: { type: String, default: "", maxlength: 5000 },
    lostMoney: { type: String, enum: ["YES", "NO", "NOT_SURE"], required: true },
    verifiedContext: {
      organization: { type: String, default: "" },
      trustScore: { type: Number, default: null },
      verdict: { type: String, default: "" },
    },
    referenceId: { type: String, default: "", maxlength: 200 },
    evidence: { type: [Schema.Types.Mixed], default: [] },
    timeline: { type: [Schema.Types.Mixed], default: [] },
    status: {
      type: String,
      enum: ["NEW", "ASSESSING", "ACTION_REQUIRED", "BANK_NOTIFIED", "EVIDENCE_COLLECTED", "COMPLAINT_READY", "REPORTED", "RECOVERY_IN_PROGRESS", "CLOSED"],
      default: "ASSESSING",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Recovery || mongoose.model("Recovery", RecoverySchema);