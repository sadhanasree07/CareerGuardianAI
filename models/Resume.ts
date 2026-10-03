import mongoose, { Schema } from "mongoose";

const ResumeSchema = new Schema(
  {
    userId: {
      type: String,
      default: "demo-user",
    },

    resume: {
      type: Object,
      default: {},
    },

    resumeScore: {
      type: Number,
      default: 0,
    },

    isMaster: {
      type: Boolean,
      default: true,
      index: true,
    },

    title: {
      type: String,
      default: "MASTER RESUME",
    },

    resumeVersion: {
      type: Number,
      default: 1,
    },

    targetCompany: { type: String, default: "" },
    targetRole: { type: String, default: "" },
    jobId: { type: String, default: "" },
    sourceResumeVersionId: { type: String, default: "" },
    optimization: { type: Schema.Types.Mixed, default: null },

    atsKeywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default
mongoose.models.Resume ||
mongoose.model(
  "Resume",
  ResumeSchema
);