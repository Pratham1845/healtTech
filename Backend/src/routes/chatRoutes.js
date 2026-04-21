const express = require('express');
const { generateChatReply, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/history', protect, getChatHistory);
router.post('/', protect, generateChatReply);

module.exports = router;
