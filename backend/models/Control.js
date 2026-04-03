const mongoose = require('mongoose');

const controlSchema = new mongoose.Schema({
  internalId: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  objective: { type: String, required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model('Control', controlSchema);