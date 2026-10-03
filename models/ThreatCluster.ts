import { Schema, model, models } from "mongoose";

const ThreatClusterSchema = new Schema({
  clusterId: { type: String, required: true, unique: true },
  contentHash: { type: String, required: true, index: true },
  normalizedText: { type: String, required: true, maxlength: 30000 },
  similaritySignature: { type: [String], default: [] },
  reportCount: { type: Number, default: 0 },
  reportTimes: { type: [Date], default: [] },
  lastSubmissionAt: { type: Date, default: null },
  firstSeenAt: { type: Date, required: true },
  lastSeenAt: { type: Date, required: true, index: true },
  sampleOrganizations: { type: [String], default: [] },
  sampleRoles: { type: [String], default: [] },
  domains: { type: [String], default: [] },
  phoneNumbers: { type: [String], default: [] },
  upiIds: { type: [String], default: [] },
  notificationNumbers: { type: [String], default: [] },
  locations: { type: [String], default: [] },
  status: { type: String, default: "ACTIVE" },
}, { timestamps: true });

ThreatClusterSchema.index({ createdAt: 1 });

export default models.ThreatCluster || model("ThreatCluster", ThreatClusterSchema);
