const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sector: { type: String, required: true },
  size: { type: String, required: true },
  keySystems: [{ type: String }],
  securityContext: { type: String, required: true },
  auditObjective: { type: String, required: true },
  auditTeam: [{ type: String }],
});

module.exports = mongoose.model('Scenario', scenarioSchema);