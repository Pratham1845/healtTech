const express = require('express');
const { getApiHealth } = require('../controllers/healthController');

const router = express.Router();

router.get('/', getApiHealth);

module.exports = router;
