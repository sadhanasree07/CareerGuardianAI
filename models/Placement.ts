import mongoose, { Schema } from "mongoose";

const PlacementSchema = new Schema(
  {
    userId: {
      type: String,
      default: "demo-user",
    },

    name: {
      type: String,
      default: "",
    },

    college: {
      type: String,
      default: "",
    },

    placementScore: {
      type: Number,
      default: 0,
    },

    prediction: {
      type: String,
      default: "",
    },

    readiness: {
      type: Number,
      default: 0,
    },

    companies: {
      type: Array,
      default: [],
    },

    skills: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Placement =
  mongoose.models.Placement ||
  mongoose.model(
    "Placement",
    PlacementSchema
  );

export default Placement;