const Scenario = require('../models/Scenario');

exports.getScenario = async (req, res) => {
  try {
    const scenario = await Scenario.findOne();
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};