const express = require('express');
const router = express.Router();
const { chatbot } = require('../controllers/chatbotController');

router.post('/api/chatbot', chatbot);
router.post('/api/chat', chatbot);

module.exports = router;
