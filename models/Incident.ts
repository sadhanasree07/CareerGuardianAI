import mongoose, { Schema, model, models } from "mongoose";

const IncidentSchema = new Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },

    incidentType: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const Incident =
  models.Incident ||
  model("Incident", IncidentSchema);

export default Incident;