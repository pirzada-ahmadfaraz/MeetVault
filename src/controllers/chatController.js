const { validationResult } = require('express-validator');
const { ChatMessage, Meeting } = require('../models');
const ApiResponse = require('../utils/response');

class ChatController {
  static async sendMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { meetingId } = req.params;
      const { content, replyTo } = req.body;
      const userId = req.userId;

      const meeting = await Meeting.findOne({ meetingId });

      if (!meeting) {
        return ApiResponse.notFound(res, 'Meeting not found');
      }

      if (!meeting.settings.allowChat) {
        return ApiResponse.forbidden(res, 'Chat is disabled for this meeting');
      }

      // Check if user is a participant
      const isHost = meeting.host.toString() === userId.toString();
      const isParticipant = meeting.participants.some(
        p => p.user.toString() === userId.toString() && !p.leftAt
      );

      if (!isHost && !isParticipant) {
        return ApiResponse.forbidden(res, 'You are not a participant in this meeting');
      }

      // Verify reply-to message exists if provided
      if (replyTo) {
        const replyMessage = await ChatMessage.findOne({
          _id: replyTo,
          meeting: meeting._id,
          isDeleted: false
        });

        if (!replyMessage) {
          return ApiResponse.notFound(res, 'Reply message not found');
        }
      }

      const message = new ChatMessage({
        meeting: meeting._id,
        sender: userId,
        content,
        replyTo: replyTo || null
      });

      await message.save();

      const populatedMessage = await ChatMessage.findById(message._id)
        .populate('sender', 'username firstName lastName')
        .populate('replyTo', 'content sender createdAt')
        .populate('replyTo.sender', 'username firstName lastName');

      return ApiResponse.created(res, populatedMessage, 'Message sent successfully');

    } catch (error) {
      console.error('Send message error:', error);
      return ApiResponse.error(res, 'Failed to send message', 500);
    }
  }

  static async getMessages(req, res) {
    try {
      const { meetingId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = req.userId;

      const meeting = await Meeting.findOne({ meetingId });

      if (!meeting) {
        return ApiResponse.notFound(res, 'Meeting not found');
      }

      // Check if user is a participant
      const isHost = meeting.host.toString() === userId.toString();
      const isParticipant = meeting.participants.some(
        p => p.user.toString() === userId.toString()
      );

      if (!isHost && !isParticipant) {
        return ApiResponse.forbidden(res, 'You are not a participant in this meeting');
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const messages = await ChatMessage.getMessagesForMeeting(meeting._id, pageNum, limitNum);
      const totalCount = await ChatMessage.countDocuments({
        meeting: meeting._id,
        isDeleted: false
      });

      return ApiResponse.paginated(res, messages.reverse(), totalCount, pageNum, limitNum, 'Messages retrieved successfully');

    } catch (error) {
      console.error('Get messages error:', error);
      return ApiResponse.error(res, 'Failed to retrieve messages', 500);
    }
  }

  static async editMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.userId;

      const message = await ChatMessage.findById(messageId);

      if (!message) {
        return ApiResponse.notFound(res, 'Message not found');
      }

      if (message.sender.toString() !== userId.toString()) {
        return ApiResponse.forbidden(res, 'You can only edit your own messages');
      }

      if (message.isDeleted) {
        return ApiResponse.conflict(res, 'Cannot edit a deleted message');
      }

      await message.editMessage(content, userId);

      const updatedMessage = await ChatMessage.findById(messageId)
        .populate('sender', 'username firstName lastName')
        .populate('replyTo', 'content sender createdAt');

      return ApiResponse.success(res, updatedMessage, 'Message edited successfully');

    } catch (error) {
      console.error('Edit message error:', error);
      return ApiResponse.error(res, 'Failed to edit message', 500);
    }
  }

  static async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.userId;

      const message = await ChatMessage.findById(messageId)
        .populate('meeting', 'host');

      if (!message) {
        return ApiResponse.notFound(res, 'Message not found');
      }

      const isMessageSender = message.sender.toString() === userId.toString();
      const isMeetingHost = message.meeting.host.toString() === userId.toString();

      if (!isMessageSender && !isMeetingHost) {
        return ApiResponse.forbidden(res, 'Only message sender or meeting host can delete messages');
      }

      await message.deleteMessage(userId, isMeetingHost);

      return ApiResponse.success(res, null, 'Message deleted successfully');

    } catch (error) {
      console.error('Delete message error:', error);
      return ApiResponse.error(res, 'Failed to delete message', 500);
    }
  }

  static async addReaction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.userId;

      const message = await ChatMessage.findById(messageId);

      if (!message) {
        return ApiResponse.notFound(res, 'Message not found');
      }

      if (message.isDeleted) {
        return ApiResponse.conflict(res, 'Cannot react to a deleted message');
      }

      // Check if user already reacted with this emoji
      const existingReaction = message.reactions.find(
        r => r.user.toString() === userId.toString() && r.emoji === emoji
      );

      if (existingReaction) {
        return ApiResponse.conflict(res, 'You already reacted with this emoji');
      }

      await message.addReaction(userId, emoji);

      const updatedMessage = await ChatMessage.findById(messageId)
        .populate('sender', 'username firstName lastName')
        .populate('reactions.user', 'username firstName lastName');

      return ApiResponse.success(res, updatedMessage, 'Reaction added successfully');

    } catch (error) {
      console.error('Add reaction error:', error);
      return ApiResponse.error(res, 'Failed to add reaction', 500);
    }
  }

  static async removeReaction(req, res) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.userId;

      const message = await ChatMessage.findById(messageId);

      if (!message) {
        return ApiResponse.notFound(res, 'Message not found');
      }

      await message.removeReaction(userId, emoji);

      const updatedMessage = await ChatMessage.findById(messageId)
        .populate('sender', 'username firstName lastName')
        .populate('reactions.user', 'username firstName lastName');

      return ApiResponse.success(res, updatedMessage, 'Reaction removed successfully');

    } catch (error) {
      console.error('Remove reaction error:', error);
      return ApiResponse.error(res, 'Failed to remove reaction', 500);
    }
  }

  static async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.userId;

      const message = await ChatMessage.findById(messageId);

      if (!message) {
        return ApiResponse.notFound(res, 'Message not found');
      }

      await message.markAsRead(userId);

      return ApiResponse.success(res, null, 'Message marked as read');

    } catch (error) {
      console.error('Mark as read error:', error);
      return ApiResponse.error(res, 'Failed to mark message as read', 500);
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const { meetingId } = req.params;
      const userId = req.userId;

      const meeting = await Meeting.findOne({ meetingId });

      if (!meeting) {
        return ApiResponse.notFound(res, 'Meeting not found');
      }

      const unreadCount = await ChatMessage.getUnreadCount(meeting._id, userId);

      return ApiResponse.success(res, { unreadCount }, 'Unread count retrieved successfully');

    } catch (error) {
      console.error('Get unread count error:', error);
      return ApiResponse.error(res, 'Failed to get unread count', 500);
    }
  }
}

module.exports = ChatController;