const mongoose = require('mongoose');

const auditHistorySchema = new mongoose.Schema({
  version: { type: Number, required: true },  // 1, 2, 3, ...
  auditDate: { type: Date, required: true },  // When this audit was conducted
  snapshot: {
    scenario: mongoose.Schema.Types.Mixed,
    controls: [mongoose.Schema.Types.Mixed],
    evaluations: [
      {
        controlId: mongoose.Schema.Types.ObjectId,
        status: String,
        justification: String,
        severity: String,
        probability: String,
        riskLevel: String,
        recommendation: String,
        remediationScore: { type: Number, min: 0, max: 100, default: 0 },  // 0-100%
        remediationComments: String,
        evidence: [mongoose.Schema.Types.Mixed],
        createdAt: Date,
        updatedAt: Date
      }
    ],
    aiAnalysis: mongoose.Schema.Types.Mixed  // Full AI analysis result
  },
  notes: String,  // Audit notes/context
  auditedBy: String,  // Audit manager/person
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditHistory', auditHistorySchema);
