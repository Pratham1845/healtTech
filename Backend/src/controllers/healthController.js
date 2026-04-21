const asyncHandler = require('express-async-handler');

const getApiHealth = asyncHandler(async (req, res) => {
  res.json({
    status: 'ok',
    service: 'HealthTech Backend API',
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  getApiHealth
};
