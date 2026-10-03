import mongoose, { Schema } from "mongoose";

const JobOpportunitySchema = new Schema(
  {
    company: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    location: { type: String, required: true, trim: true },
    employmentType: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    experienceLevel: { type: String, default: "" },
    jobUrl: { type: String, required: true, trim: true },
    companyWebsite: { type: String, default: "" },
    source: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    postedAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

JobOpportunitySchema.index({ isActive: 1, postedAt: -1 });
JobOpportunitySchema.index({ source: 1, jobUrl: 1 });

export default mongoose.models.JobOpportunity || mongoose.model("JobOpportunity", JobOpportunitySchema);
