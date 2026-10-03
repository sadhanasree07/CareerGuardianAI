import mongoose, { Schema, model, models } from "mongoose";

const LayerSchema = new Schema(
  {
    layer: Number,
    title: String,
    passed: Boolean,
    state: String,
    score: Number,
    message: String,
  },
  {
    _id: false,
  }
);

const TranscriptSegmentSchema = new Schema({
  id: Number, startTime: Number, endTime: Number, speaker: String, text: String,
}, { _id: false });
const RecordingEvidenceSchema = new Schema({
  segmentId: Number, startTime: Number, endTime: Number, category: String, text: String,
  repeatCount: Number, firstOccurrence: Number, subsequentOccurrences: [Number], similarity: Number, context: String,
}, { _id: false });

const VerificationSchema = new Schema(
  {
    userId: {
      type: String,
      default: "demo-user",
    },

    company: String,

    jobRole: String,

    trustScore: Number,

    // Evidence-fusion fields are optional so historical records remain valid.
    sourceType: String,
    inputType: { type: String, default: "unknown" },
    inputMethod: { type: String, default: "unknown" },
    riskScore: Number,
    riskStatus: String,
    riskAssessment: { type: Schema.Types.Mixed, default: undefined },
    verificationConfidence: Number,
    sourceConfidence: Number,
    evidenceCoverage: { type: Number, default: 0 },
    evidence: [{
      id: String,
      category: String,
      state: String,
      weight: Number,
      explanation: String,
      source: String,
    }],
    positiveSignals: { type: [String], default: [] },
    negativeSignals: { type: [String], default: [] },
    missingSignals: { type: [String], default: [] },
    independentConfirmation: {
      status: String,
      channel: String,
    },
    recommendedAction: String,
    payGuard: { type: Schema.Types.Mixed, default: undefined },
    paymentFraudDetection: { type: Schema.Types.Mixed, default: undefined },
    threatIntelligence: { type: Schema.Types.Mixed, default: undefined },
    linkSentinel: { type: Schema.Types.Mixed, default: undefined },
    aiExplanation: String,
    // Optional second-stage comparison; absent on historical records.
    guardianTrustCheck: { type: Schema.Types.Mixed, default: undefined },
    governmentVerification: { type: Schema.Types.Mixed, default: undefined },
    documentProvenance: { type: Schema.Types.Mixed, default: undefined },
    digitalIdentityOpportunityAuthenticity: { type: Schema.Types.Mixed, default: undefined },
    mediaType: String,
    mediaMetadata: Schema.Types.Mixed,
    recordingDuration: Number,
    transcript: { type: String, maxlength: 200000 },
    cleanTranscript: { type: String, maxlength: 200000 },
    transcriptLanguage: String,
    selectedApplicationLanguage: String,
    transcriptSegments: { type: [TranscriptSegmentSchema], default: undefined },
    keyEvidence: { type: [RecordingEvidenceSchema], default: undefined },
    repeatedEvidence: { type: [RecordingEvidenceSchema], default: undefined },
    recordingRiskSignals: Schema.Types.Mixed,
    recordingSummary: String,

    status: String,

    website: String,

    email: String,

    phone: String,

    salary: String,

    notificationNumber: String,

    applicationFee: String,

    education: String,

    description: String,

    location: {
      type: String,
      default: "Unknown",
    },

    // Whether this verification was reported
    // by a user as suspicious
    communityReported: {
      type: Boolean,
      default: false,
    },

    communityCategory: {
      type: String,
      default: "Other",
    },

    incidentDate: {
      type: Date,
      default: null,
    },

    layers: {
      type: [LayerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Verification =
  models.Verification ||
  model("Verification", VerificationSchema);

export default Verification;
