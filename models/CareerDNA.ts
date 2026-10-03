import mongoose, { Schema } from "mongoose";

const CareerDNASchema = new Schema(

  {

    userId: {

      type: String,

      required: true,

    },

    verifiedJob: {

      type: Object,

      required: true,

    },

    student: {

      type: Object,

      required: true,

    },

    report: {

      type: Object,

      required: true,

    },

    jobPreferences: {
      roles: { type: [String], default: [] },
      skills: { type: [String], default: [] },
      locations: { type: [String], default: [] },
      employmentTypes: { type: [String], default: [] },
      preferredCompanies: { type: [String], default: [] },
      minimumMatchScore: { type: Number, default: 60 },
    },

  },

  {

    timestamps: true,

  }

);

export default
mongoose.models.CareerDNA ||
mongoose.model(
  "CareerDNA",
  CareerDNASchema
);