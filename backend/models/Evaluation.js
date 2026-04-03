 const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  controlId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Control', 
    required: true,
    unique: true  // Garantit 1 contrôle = 1 évaluation (pas de doublons)
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

module.exports = mongoose.model('Evaluation', evaluationSchema);