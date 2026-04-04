 const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    index: true,
  },
  controlId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Control', 
    required: true,
  },
  status: { type: String, enum: ['Conforme', 'Partiellement conforme', 'Non conforme'], required: true },
  justification: { type: String, required: true },
  severity: { type: String, enum: ['faible', 'moyenne', 'élevée'] },
  probability: { type: String, enum: ['faible', 'moyenne', 'élevée'] },
  riskLevel: { type: String },
  recommendation: { type: String },
  remediationScore: { type: Number, min: 0, max: 100, default: 0 },  // 0-100% remediation completion
  remediationComments: { type: String },  // Notes on remediation efforts
  remediationDeadline: { type: Date },  // Target date for remediation
}, { timestamps: true });

evaluationSchema.index({ companyId: 1, controlId: 1 }, { unique: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);