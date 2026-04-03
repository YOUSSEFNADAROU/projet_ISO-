const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  controlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Control', required: true },
  type: { type: String, required: true }, // e.g., 'procedure', 'configuration', 'logs', 'constat', 'note'
  content: { type: String, required: true },
});

module.exports = mongoose.model('Evidence', evidenceSchema);