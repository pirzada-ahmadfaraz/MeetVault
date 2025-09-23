const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'file'],
    default: 'text'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage',
    default: null
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true,
      maxlength: 10
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
chatMessageSchema.index({ meeting: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1, createdAt: -1 });
chatMessageSchema.index({ meeting: 1, isDeleted: 1, createdAt: -1 });

// Virtual for reaction summary
chatMessageSchema.virtual('reactionSummary').get(function() {
  const summary = {};
  this.reactions.forEach(reaction => {
    if (summary[reaction.emoji]) {
      summary[reaction.emoji].count++;
      summary[reaction.emoji].users.push(reaction.user);
    } else {
      summary[reaction.emoji] = {
        count: 1,
        users: [reaction.user]
      };
    }
  });
  return summary;
});

// Instance method to add reaction
chatMessageSchema.methods.addReaction = function(userId, emoji) {
  // Check if user already reacted with this emoji
  const existingReaction = this.reactions.find(
    r => r.user.toString() === userId.toString() && r.emoji === emoji
  );

  if (existingReaction) {
    throw new Error('User already reacted with this emoji');
  }

  this.reactions.push({
    user: userId,
    emoji: emoji
  });

  return this.save();
};

// Instance method to remove reaction
chatMessageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(
    r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
  );

  return this.save();
};

// Instance method to edit message
chatMessageSchema.methods.editMessage = function(newContent, userId) {
  if (this.sender.toString() !== userId.toString()) {
    throw new Error('Only the sender can edit this message');
  }

  if (this.isDeleted) {
    throw new Error('Cannot edit a deleted message');
  }

  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();

  return this.save();
};

// Instance method to delete message
chatMessageSchema.methods.deleteMessage = function(userId, isHost = false) {
  // Allow deletion by sender or meeting host
  if (this.sender.toString() !== userId.toString() && !isHost) {
    throw new Error('Only the sender or meeting host can delete this message');
  }

  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = '[Message deleted]';

  return this.save();
};

// Instance method to mark as read
chatMessageSchema.methods.markAsRead = function(userId) {
  // Check if already marked as read by this user
  const alreadyRead = this.readBy.find(
    r => r.user.toString() === userId.toString()
  );

  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }

  return this;
};

// Static method to get messages for a meeting with pagination
chatMessageSchema.statics.getMessagesForMeeting = function(meetingId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    meeting: meetingId,
    isDeleted: false
  })
  .populate('sender', 'username firstName lastName')
  .populate('replyTo', 'content sender createdAt')
  .populate('reactions.user', 'username firstName lastName')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get unread message count for a user in a meeting
chatMessageSchema.statics.getUnreadCount = function(meetingId, userId) {
  return this.countDocuments({
    meeting: meetingId,
    isDeleted: false,
    'readBy.user': { $ne: userId }
  });
};

// Transform output
chatMessageSchema.methods.toJSON = function() {
  const messageObject = this.toObject({ virtuals: true });
  
  // Don't show deleted message content to non-authorized users
  if (messageObject.isDeleted && messageObject.content !== '[Message deleted]') {
    messageObject.content = '[Message deleted]';
  }
  
  return messageObject;
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);