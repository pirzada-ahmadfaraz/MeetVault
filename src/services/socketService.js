const { Server } = require('socket.io');
const JWTUtils = require('../utils/jwt');
const { User, Meeting, ChatMessage } = require('../models');

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication token missing'));
        }

        const decoded = JWTUtils.verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.username} connected with socket ID: ${socket.id}`);

      // Meeting-related events
      socket.on('join-meeting', async (data) => {
        await this.handleJoinMeeting(socket, data);
      });

      socket.on('leave-meeting', async (data) => {
        await this.handleLeaveMeeting(socket, data);
      });

      // WebRTC signaling events
      socket.on('offer', (data) => {
        this.handleWebRTCSignaling(socket, 'offer', data);
      });

      socket.on('answer', (data) => {
        this.handleWebRTCSignaling(socket, 'answer', data);
      });

      socket.on('ice-candidate', (data) => {
        this.handleWebRTCSignaling(socket, 'ice-candidate', data);
      });

      // Media control events
      socket.on('toggle-video', async (data) => {
        await this.handleToggleVideo(socket, data);
      });

      socket.on('toggle-audio', async (data) => {
        await this.handleToggleAudio(socket, data);
      });

      socket.on('start-screen-share', async (data) => {
        await this.handleStartScreenShare(socket, data);
      });

      socket.on('stop-screen-share', async (data) => {
        await this.handleStopScreenShare(socket, data);
      });

      // Voice activity events
      socket.on('voice-activity', (data) => {
        this.handleVoiceActivity(socket, data);
      });

      // Host control events
      socket.on('end-meeting', async (data) => {
        await this.handleEndMeeting(socket, data);
      });

      socket.on('remove-participant', async (data) => {
        await this.handleRemoveParticipant(socket, data);
      });

      socket.on('host-mute-participant', async (data) => {
        await this.handleHostMuteParticipant(socket, data);
      });

      socket.on('host-unmute-participant', async (data) => {
        await this.handleHostUnmuteParticipant(socket, data);
      });

      // Chat events
      socket.on('send-message', async (data) => {
        await this.handleSendMessage(socket, data);
      });

      socket.on('typing-start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing-stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Connection events
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  async handleJoinMeeting(socket, data) {
    try {
      const { meetingId } = data;

      const meeting = await Meeting.findOne({ meetingId })
        .populate('host', 'username firstName lastName')
        .populate('participants.user', 'username firstName lastName');

      if (!meeting) {
        socket.emit('error', { message: 'Meeting not found' });
        return;
      }

      // Check if user is authorized to join
      const isHost = meeting.host._id.toString() === socket.userId;
      const isParticipant = meeting.participants.some(
        p => p.user._id.toString() === socket.userId && !p.leftAt
      );

      if (!isHost && !isParticipant) {
        socket.emit('error', { message: 'Not authorized to join this meeting' });
        return;
      }

      // Join the meeting room
      socket.join(meetingId);
      socket.currentMeeting = meetingId;

      // Notify other participants that this user joined
      console.log(`Notifying existing participants in meeting ${meetingId} about new user ${socket.user.username}`);
      socket.to(meetingId).emit('user-joined', {
        userId: socket.userId,
        user: {
          _id: socket.userId,
          username: socket.user.username,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          email: socket.user.email
        }
      });

      // Get all connected users in this meeting room
      const connectedSockets = await this.io.in(meetingId).fetchSockets();
      console.log(`Total sockets in meeting ${meetingId}:`, connectedSockets.length);
      console.log(`Socket IDs: ${connectedSockets.map(s => `${s.user?.username || 'unknown'}(${s.id})`).join(', ')}`);

      const connectedParticipants = connectedSockets
        .filter(s => s.userId !== socket.userId)
        .map(s => ({
          userId: s.userId,
          user: {
            _id: s.userId,
            username: s.user.username,
            firstName: s.user.firstName,
            lastName: s.user.lastName,
            email: s.user.email
          },
          isVideoEnabled: true,
          isAudioEnabled: true,
          isScreenSharing: false
        }));

      console.log(`Sending ${connectedParticipants.length} existing participants to ${socket.user.username}`);

      socket.emit('meeting-joined', {
        meeting: meeting,
        participants: connectedParticipants
      });

      console.log(`User ${socket.user.username} joined meeting ${meetingId}`);
    } catch (error) {
      console.error('Join meeting error:', error);
      socket.emit('error', { message: 'Failed to join meeting' });
    }
  }

  async handleLeaveMeeting(socket, data) {
    try {
      const { meetingId } = data;

      socket.leave(meetingId);

      // Notify other participants
      socket.to(meetingId).emit('user-left', {
        userId: socket.userId,
        user: {
          username: socket.user.username,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });

      socket.currentMeeting = null;
      console.log(`User ${socket.user.username} left meeting ${meetingId}`);
    } catch (error) {
      console.error('Leave meeting error:', error);
    }
  }

  handleWebRTCSignaling(socket, eventType, data) {
    const { targetUserId, ...signalData } = data;

    console.log(`WebRTC ${eventType} from ${socket.userId} to ${targetUserId || 'broadcast'}`);

    if (targetUserId) {
      // Send to specific user
      const targetSockets = this.getUserSockets(targetUserId);
      targetSockets.forEach(targetSocket => {
        targetSocket.emit(eventType, {
          fromUserId: socket.userId,
          ...signalData
        });
      });
    } else {
      // Broadcast to all in meeting
      socket.to(socket.currentMeeting).emit(eventType, {
        fromUserId: socket.userId,
        ...signalData
      });
    }
  }

  async handleToggleVideo(socket, data) {
    try {
      const { meetingId, isVideoEnabled } = data;

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) return;

      // Update participant video status
      const participant = meeting.participants.find(
        p => p.user.toString() === socket.userId && !p.leftAt
      );

      if (participant) {
        participant.isVideoEnabled = isVideoEnabled;
        await meeting.save();

        // Notify other participants
        socket.to(meetingId).emit('participant-video-toggled', {
          userId: socket.userId,
          isVideoEnabled
        });
      }
    } catch (error) {
      console.error('Toggle video error:', error);
    }
  }

  async handleToggleAudio(socket, data) {
    try {
      const { meetingId, isAudioEnabled } = data;

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) return;

      // Update participant audio status
      const participant = meeting.participants.find(
        p => p.user.toString() === socket.userId && !p.leftAt
      );

      if (participant) {
        participant.isAudioEnabled = isAudioEnabled;
        await meeting.save();

        // Notify other participants
        socket.to(meetingId).emit('participant-audio-toggled', {
          userId: socket.userId,
          isAudioEnabled
        });
      }
    } catch (error) {
      console.error('Toggle audio error:', error);
    }
  }

  async handleStartScreenShare(socket, data) {
    try {
      const { meetingId } = data;

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) return;

      if (!meeting.settings.allowScreenShare) {
        socket.emit('error', { message: 'Screen sharing is not allowed in this meeting' });
        return;
      }

      // Update participant screen sharing status
      const participant = meeting.participants.find(
        p => p.user.toString() === socket.userId && !p.leftAt
      );

      if (participant) {
        participant.isScreenSharing = true;
        await meeting.save();

        // Notify other participants
        socket.to(meetingId).emit('participant-started-screen-share', {
          userId: socket.userId,
          user: {
            username: socket.user.username,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName
          }
        });
      }
    } catch (error) {
      console.error('Start screen share error:', error);
    }
  }

  async handleStopScreenShare(socket, data) {
    try {
      const { meetingId } = data;

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) return;

      // Update participant screen sharing status
      const participant = meeting.participants.find(
        p => p.user.toString() === socket.userId && !p.leftAt
      );

      if (participant) {
        participant.isScreenSharing = false;
        await meeting.save();

        // Notify other participants
        socket.to(meetingId).emit('participant-stopped-screen-share', {
          userId: socket.userId
        });
      }
    } catch (error) {
      console.error('Stop screen share error:', error);
    }
  }

  handleVoiceActivity(socket, data) {
    try {
      const { meetingId, isSpeaking } = data;

      console.log(`Voice activity from ${socket.user.username}:`, isSpeaking);

      // Broadcast voice activity to all other participants in the meeting
      socket.to(meetingId).emit('participant-voice-activity', {
        userId: socket.userId,
        isSpeaking
      });
    } catch (error) {
      console.error('Voice activity error:', error);
    }
  }

  async handleEndMeeting(socket, data) {
    try {
      const { meetingId } = data;

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) {
        socket.emit('error', { message: 'Meeting not found' });
        return;
      }

      // Check if user is the host
      const isHost = meeting.host._id.toString() === socket.userId;
      if (!isHost) {
        socket.emit('error', { message: 'Only the host can end the meeting' });
        return;
      }

      // Update meeting status to ended
      meeting.status = 'completed';
      meeting.endedAt = new Date();
      await meeting.save();

      console.log(`Host ${socket.user.username} ended meeting ${meetingId}`);

      // Notify all participants that the meeting has ended
      this.io.to(meetingId).emit('meeting-ended', {
        message: 'The meeting has been ended by the host',
        hostName: `${socket.user.firstName} ${socket.user.lastName}`
      });

      // Remove all participants from the meeting room
      const connectedSockets = await this.io.in(meetingId).fetchSockets();
      for (const connectedSocket of connectedSockets) {
        connectedSocket.leave(meetingId);
        connectedSocket.currentMeeting = null;
      }
    } catch (error) {
      console.error('End meeting error:', error);
      socket.emit('error', { message: 'Failed to end meeting' });
    }
  }

  async handleRemoveParticipant(socket, data) {
    try {
      const { meetingId, participantId } = data;

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) {
        socket.emit('error', { message: 'Meeting not found' });
        return;
      }

      // Check if user is the host
      const isHost = meeting.host._id.toString() === socket.userId;
      if (!isHost) {
        socket.emit('error', { message: 'Only the host can remove participants' });
        return;
      }

      // Cannot remove the host
      if (participantId === socket.userId) {
        socket.emit('error', { message: 'Host cannot remove themselves' });
        return;
      }

      // Find the participant to remove
      const participantToRemove = meeting.participants.find(
        p => p.user.toString() === participantId && !p.leftAt
      );

      if (!participantToRemove) {
        socket.emit('error', { message: 'Participant not found in meeting' });
        return;
      }

      // Update participant status to left
      participantToRemove.leftAt = new Date();
      await meeting.save();

      console.log(`Host ${socket.user.username} removed participant ${participantId} from meeting ${meetingId}`);

      // Find and disconnect the participant's socket
      const participantSockets = this.getUserSockets(participantId);
      for (const participantSocket of participantSockets) {
        if (participantSocket.currentMeeting === meetingId) {
          // Notify the removed participant
          participantSocket.emit('removed-from-meeting', {
            message: 'You have been removed from the meeting by the host',
            hostName: `${socket.user.firstName} ${socket.user.lastName}`
          });

          // Remove from meeting room
          participantSocket.leave(meetingId);
          participantSocket.currentMeeting = null;
        }
      }

      // Notify other participants about the removal
      socket.to(meetingId).emit('participant-removed', {
        participantId,
        removedBy: socket.userId
      });

      // Confirm removal to the host
      socket.emit('participant-removed-success', {
        participantId
      });

    } catch (error) {
      console.error('Remove participant error:', error);
      socket.emit('error', { message: 'Failed to remove participant' });
    }
  }

  async handleHostMuteParticipant(socket, data) {
    try {
      const { meetingId, participantId } = data;

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) {
        socket.emit('error', { message: 'Meeting not found' });
        return;
      }

      // Check if user is the host
      const isHost = meeting.host._id.toString() === socket.userId;
      if (!isHost) {
        socket.emit('error', { message: 'Only the host can mute participants' });
        return;
      }

      // Cannot mute the host
      if (participantId === socket.userId) {
        socket.emit('error', { message: 'Host cannot mute themselves' });
        return;
      }

      // Find the participant to mute
      const participantToMute = meeting.participants.find(
        p => p.user.toString() === participantId && !p.leftAt
      );

      if (!participantToMute) {
        socket.emit('error', { message: 'Participant not found in meeting' });
        return;
      }

      // Update participant audio status to muted
      participantToMute.isAudioEnabled = false;
      await meeting.save();

      console.log(`Host ${socket.user.username} muted participant ${participantId} in meeting ${meetingId}`);

      // Notify the muted participant
      const participantSockets = this.getUserSockets(participantId);
      for (const participantSocket of participantSockets) {
        if (participantSocket.currentMeeting === meetingId) {
          participantSocket.emit('host-muted-you', {
            message: 'You have been muted by the host',
            hostName: `${socket.user.firstName} ${socket.user.lastName}`
          });
        }
      }

      // Notify all participants about the mute
      this.io.to(meetingId).emit('participant-audio-toggled', {
        userId: participantId,
        isAudioEnabled: false,
        mutedByHost: true
      });

      // Confirm to host
      socket.emit('participant-muted-success', {
        participantId
      });

    } catch (error) {
      console.error('Host mute participant error:', error);
      socket.emit('error', { message: 'Failed to mute participant' });
    }
  }

  async handleHostUnmuteParticipant(socket, data) {
    try {
      const { meetingId, participantId } = data;

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) {
        socket.emit('error', { message: 'Meeting not found' });
        return;
      }

      // Check if user is the host
      const isHost = meeting.host._id.toString() === socket.userId;
      if (!isHost) {
        socket.emit('error', { message: 'Only the host can unmute participants' });
        return;
      }

      // Cannot unmute the host
      if (participantId === socket.userId) {
        socket.emit('error', { message: 'Host cannot unmute themselves' });
        return;
      }

      // Find the participant to unmute
      const participantToUnmute = meeting.participants.find(
        p => p.user.toString() === participantId && !p.leftAt
      );

      if (!participantToUnmute) {
        socket.emit('error', { message: 'Participant not found in meeting' });
        return;
      }

      // Update participant audio status to unmuted
      participantToUnmute.isAudioEnabled = true;
      await meeting.save();

      console.log(`Host ${socket.user.username} unmuted participant ${participantId} in meeting ${meetingId}`);

      // Notify the unmuted participant
      const participantSockets = this.getUserSockets(participantId);
      for (const participantSocket of participantSockets) {
        if (participantSocket.currentMeeting === meetingId) {
          participantSocket.emit('host-unmuted-you', {
            message: 'You have been unmuted by the host',
            hostName: `${socket.user.firstName} ${socket.user.lastName}`
          });
        }
      }

      // Notify all participants about the unmute
      this.io.to(meetingId).emit('participant-audio-toggled', {
        userId: participantId,
        isAudioEnabled: true,
        unmutedByHost: true
      });

      // Confirm to host
      socket.emit('participant-unmuted-success', {
        participantId
      });

    } catch (error) {
      console.error('Host unmute participant error:', error);
      socket.emit('error', { message: 'Failed to unmute participant' });
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { meetingId, content, replyTo } = data;

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) {
        socket.emit('error', { message: 'Meeting not found' });
        return;
      }

      if (!meeting.settings.allowChat) {
        socket.emit('error', { message: 'Chat is disabled for this meeting' });
        return;
      }

      // Create new chat message
      const message = new ChatMessage({
        meeting: meeting._id,
        sender: socket.userId,
        content,
        replyTo: replyTo || null
      });

      await message.save();

      const populatedMessage = await ChatMessage.findById(message._id)
        .populate('sender', 'username firstName lastName')
        .populate('replyTo', 'content sender createdAt')
        .populate('replyTo.sender', 'username firstName lastName');

      // Broadcast message to all participants
      this.io.to(meetingId).emit('new-message', populatedMessage);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTypingStart(socket, data) {
    const { meetingId } = data;
    socket.to(meetingId).emit('user-typing-start', {
      userId: socket.userId,
      user: {
        username: socket.user.username,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName
      }
    });
  }

  handleTypingStop(socket, data) {
    const { meetingId } = data;
    socket.to(meetingId).emit('user-typing-stop', {
      userId: socket.userId
    });
  }

  handleDisconnect(socket) {
    console.log(`User ${socket.user.username} disconnected`);

    if (socket.currentMeeting) {
      // Notify other participants that user disconnected
      socket.to(socket.currentMeeting).emit('user-disconnected', {
        userId: socket.userId,
        user: {
          username: socket.user.username,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });
    }
  }

  // Method to get connected users in a meeting
  getConnectedUsers(meetingId) {
    const room = this.io.sockets.adapter.rooms.get(meetingId);
    return room ? room.size : 0;
  }

  // Method to send notification to specific user
  sendToUser(userId, event, data) {
    const userSockets = this.getUserSockets(userId);
    userSockets.forEach(socket => {
      socket.emit(event, data);
    });
  }

  // Method to get all socket instances for a user
  getUserSockets(userId) {
    const userSockets = [];
    this.io.sockets.sockets.forEach(socket => {
      if (socket.userId === userId) {
        userSockets.push(socket);
      }
    });
    return userSockets;
  }
}

module.exports = SocketService;