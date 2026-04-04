const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/', reportController.getReport);
router.post('/analyze', reportController.analyzeReport);
router.post('/chat', reportController.chatAboutAnalysis);
router.post('/chat-advanced', reportController.chatAdvanced);
router.post('/chat-with-controls', reportController.chatWithControls);
router.post('/chat-contextual', reportController.chatContextual); // 🆕 Contextual & Real Data
router.post('/chat-expert', reportController.chatExpert);
router.get('/control/:code', reportController.getControlInfo);
router.post('/action-plan', reportController.generateActionPlan);

module.exports = router;
