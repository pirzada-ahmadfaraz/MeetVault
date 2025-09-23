const express = require('express');
const ChatController = require('../controllers/chatController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// All chat routes require authentication
router.use(AuthMiddleware.authenticate);

// Send a message to a meeting
router.post('/meetings/:meetingId/messages',
  ValidationMiddleware.chatMessageValidation(),
  ChatController.sendMessage
);

// Get messages for a meeting
router.get('/meetings/:meetingId/messages', ChatController.getMessages);

// Get unread message count for a meeting
router.get('/meetings/:meetingId/unread-count', ChatController.getUnreadCount);

// Edit a message
router.put('/messages/:messageId',
  ValidationMiddleware.chatMessageValidation(),
  ChatController.editMessage
);

// Delete a message
router.delete('/messages/:messageId', ChatController.deleteMessage);

// Add reaction to a message
router.post('/messages/:messageId/reactions',
  ValidationMiddleware.reactionValidation(),
  ChatController.addReaction
);

// Remove reaction from a message
router.delete('/messages/:messageId/reactions',
  ValidationMiddleware.reactionValidation(),
  ChatController.removeReaction
);

// Mark message as read
router.post('/messages/:messageId/read', ChatController.markAsRead);

module.exports = router;