const express = require('express');
const authRoutes = require('./auth');
const meetingRoutes = require('./meetings');
const chatRoutes = require('./chat');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Video Conference API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/meetings', meetingRoutes);
router.use('/chat', chatRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;