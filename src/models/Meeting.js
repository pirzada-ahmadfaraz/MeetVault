const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: {
    type: Date,
    default: null
  },
  isHost: {
    type: Boolean,
    default: false
  },
  isVideoEnabled: {
    type: Boolean,
    default: true
  },
  isAudioEnabled: {
    type: Boolean,
    default: true
  },
  isScreenSharing: {
    type: Boolean,
    default: false
  }
});

const meetingSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    unique: true,
    default: () => uuidv4().replace(/-/g, '').substring(0, 12),
    index: true
  },
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxlength: [100, 'Meeting title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Meeting description cannot exceed 500 characters']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [participantSchema],
  isActive: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  scheduledStartTime: {
    type: Date,
    default: null
  },
  maxParticipants: {
    type: Number,
    default: 50,
    min: 2,
    max: 100
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  recordingUrl: {
    type: String,
    default: null
  },
  settings: {
    allowChat: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    requirePassword: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      default: null
    },
    waitingRoom: {
      type: Boolean,
      default: false
    },
    muteParticipantsOnEntry: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
meetingSchema.index({ host: 1, createdAt: -1 });
meetingSchema.index({ isActive: 1, startTime: -1 });

// Virtual for meeting duration
meetingSchema.virtual('duration').get(function() {
  if (this.startTime && this.endTime) {
    return this.endTime - this.startTime;
  }
  return null;
});

// Virtual for current participant count
meetingSchema.virtual('currentParticipantCount').get(function() {
  return this.participants.filter(p => !p.leftAt).length;
});

// Instance method to add participant
meetingSchema.methods.addParticipant = function(userId, isHost = false) {
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString() && !p.leftAt
  );

  if (existingParticipant) {
    throw new Error('User is already in the meeting');
  }

  if (this.currentParticipantCount >= this.maxParticipants) {
    throw new Error('Meeting has reached maximum capacity');
  }

  this.participants.push({
    user: userId,
    isHost,
    joinedAt: new Date()
  });

  return this.save();
};

// Instance method to remove participant
meetingSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString() && !p.leftAt
  );

  if (participant) {
    participant.leftAt = new Date();
  }

  // If no active participants left, end the meeting
  const activeParticipants = this.participants.filter(p => !p.leftAt);
  if (activeParticipants.length === 0 && this.isActive) {
    this.isActive = false;
    this.endTime = new Date();
  }

  return this.save();
};

// Instance method to start meeting
meetingSchema.methods.startMeeting = function() {
  if (this.isActive) {
    throw new Error('Meeting is already active');
  }

  this.isActive = true;
  this.startTime = new Date();
  
  return this.save();
};

// Instance method to end meeting
meetingSchema.methods.endMeeting = function() {
  if (!this.isActive) {
    throw new Error('Meeting is not active');
  }

  this.isActive = false;
  this.endTime = new Date();

  // Mark all participants as left
  this.participants.forEach(participant => {
    if (!participant.leftAt) {
      participant.leftAt = new Date();
    }
  });

  return this.save();
};

// Static method to find active meetings by user
meetingSchema.statics.findActiveByUser = function(userId) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { host: userId },
          { 'participants.user': userId, 'participants.leftAt': null }
        ]
      }
    ]
  }).populate('host', 'username email firstName lastName')
    .populate('participants.user', 'username email firstName lastName');
};

// Transform output
meetingSchema.methods.toJSON = function() {
  const meetingObject = this.toObject({ virtuals: true });
  
  // Don't expose password in API responses
  if (meetingObject.settings && meetingObject.settings.password) {
    meetingObject.settings.hasPassword = true;
    delete meetingObject.settings.password;
  }
  
  return meetingObject;
};

module.exports = mongoose.model('Meeting', meetingSchema);