import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    college: {
      type: String,
      default: "",
    },

    degree: { type: String, default: "" },
    branch: { type: String, default: "" },
    cgpa: { type: String, default: "" },
    skills: { type: [String], default: [] },
    careerGoal: { type: String, default: "" },
    professionalTitle: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    references: { type: [String], default: [] },

    role: {
      type: String,
      default: "student",
    },

    // Career activity tracking
    verificationCount: {
      type: Number,
      default: 0,
    },

    credits: {
      type: Number,
      default: 0,
      min: 0,
    },

    premiumUnlocked: {
      type: Boolean,
      default: false,
    },

    premiumUnlockedAt: {
      type: Date,
      default: null,
    },

    plan: {
      type: String,
      enum: ["FREEMIUM", "PREMIUM"],
      default: "FREEMIUM",
    },

    creditAwardedVerificationIds: {
      type: [String],
      default: [],
    },

    careerProfile: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },

    careerAnalysis: {
      type: Schema.Types.Mixed,
      default: null,
    },

    careerRoadmap: {
      type: Schema.Types.Mixed,
      default: null,
    },

    careerJourneyStage: {
      type: String,
      enum: ["PROFILE", "ANALYSIS", "ROADMAP", "COMPANION", "READY_FOR_JOB", "RESUME_GENERATED", "RESUME_REVIEWED", "MATCHING", "TARGETED_RESUME_GENERATED", "TARGETED_RESUME", "READY_TO_APPLY"],
      default: "PROFILE",
    },

    careerAssistantInteractedAt: {
      type: Date,
      default: null,
    },

    jobReadinessCheck: {
      type: Schema.Types.Mixed,
      default: null,
    },

    resumeCount: {
      type: Number,
      default: 0,
    },

    interviewCount: {
      type: Number,
      default: 0,
    },

    badges: {
      type: [String],
      default: [],
    },

    preferredLanguage: {
      type: String,
      enum: ["en", "ta", "hi", "te", "ml", "kn"],
      default: "en",
    },

    jobNotificationPreferences: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ["instant", "daily", "weekly"], default: "daily" },
      minimumMatchScore: { type: Number, default: 60 },
      categories: { type: [String], default: ["new-openings", "career-recommendations"] },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
