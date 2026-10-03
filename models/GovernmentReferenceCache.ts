import mongoose, { Schema } from "mongoose";

const GovernmentReferenceCacheSchema = new Schema({
  cacheKey: { type: String, required: true, unique: true },
  source: { type: String, required: true, enum: ["NCS"] },
  sourceUrl: { type: String, required: true },
  result: { type: Schema.Types.Mixed, required: true },
  retrievedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

GovernmentReferenceCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.GovernmentReferenceCache || mongoose.model("GovernmentReferenceCache", GovernmentReferenceCacheSchema);