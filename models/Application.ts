import mongoose, { Schema } from "mongoose";

const ApplicationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    jobId: { type: String, required: true },
    source: { type: String, required: true },
    applicationUrl: { type: String, required: true },
    resumeVersionId: { type: String, required: true },
    status: {
      type: String,
      enum: ["SAVED", "READY_TO_APPLY", "APPLICATION_STARTED", "APPLIED", "INTERVIEW", "REJECTED", "OFFER"],
      default: "SAVED",
      index: true,
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema);