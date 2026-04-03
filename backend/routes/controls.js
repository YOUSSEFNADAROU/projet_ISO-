const express = require('express');
const router = express.Router();
const controlController = require('../controllers/controlController');

router.get('/', controlController.getControls);
router.get('/:id', controlController.getControlById);
router.get('/:id/evidence', controlController.getEvidenceByControlId);

module.exports = router;