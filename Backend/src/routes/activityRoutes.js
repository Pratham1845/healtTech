const express = require('express');
const {
  createActivitySession,
  getActivityHistory,
  getActivitySummary
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createActivitySession);
router.get('/history', protect, getActivityHistory);
router.get('/summary', protect, getActivitySummary);

module.exports = router;
