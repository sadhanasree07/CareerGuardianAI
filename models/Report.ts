import mongoose, { Schema } from "mongoose";

const ReportSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    module: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    result: {
      type: Object,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Report ||
  mongoose.model("Report", ReportSchema);