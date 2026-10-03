import mongoose, { Schema } from "mongoose";

const InterviewSchema = new Schema(
  {
    userId: {
      type: String,
      default: "demo-user",
    },

    score: {
      type: Number,
      default: 0,
    },

    feedback: {
      type: [String],
      default: [],
    },

    questions: {
      type: [Object],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default
mongoose.models.Interview ||
mongoose.model(
  "Interview",
  InterviewSchema
);