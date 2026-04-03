const Control = require('../models/Control');
const Evidence = require('../models/Evidence');

exports.getControls = async (req, res) => {
  try {
    const controls = await Control.find();
    res.json(controls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getControlById = async (req, res) => {
  try {
    const control = await Control.findById(req.params.id);
    if (!control) {
      return res.status(404).json({ message: 'Control not found' });
    }
    res.json(control);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEvidenceByControlId = async (req, res) => {
  try {
    const evidence = await Evidence.find({ controlId: req.params.id });
    res.json(evidence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};