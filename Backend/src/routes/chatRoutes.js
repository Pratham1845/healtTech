const express = require('express');
const { generateChatReply, getChatHistory } = require('../controllers/chatController');

const router = express.Router();

router.get('/history', getChatHistory);
router.post('/', generateChatReply);

module.exports = router;
