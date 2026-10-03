import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "JOB", index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "JobOpportunity", required: true },
    company: { type: String, required: true },
    jobTitle: { type: String, required: true },
    jobUrl: { type: String, required: true },
    matchScore: { type: Number, required: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
