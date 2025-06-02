const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Rutas del chatbot
router.post('/message', chatbotController.processMessage);
router.get('/suggestions',chatbotController.getSuggestions);

module.exports = router; 