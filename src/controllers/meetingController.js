const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Meeting, User } = require('../models');
const ApiResponse = require('../utils/response');

class MeetingController {
  static async createMeeting(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const {
        title,
        description,
        scheduledStartTime,
        maxParticipants,
        settings = {}
      } = req.body;

      const userId = req.userId;

      // Hash meeting password if provided
      if (settings.requirePassword && settings.password) {
        const salt = await bcrypt.genSalt(10);
        settings.password = await bcrypt.hash(settings.password, salt);
      }

      const meeting = new Meeting({
        title,
        description,
        host: userId,
        scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : null,
        maxParticipants: maxParticipants || 50,
        settings: {
          allowChat: settings.allowChat !== false,
          allowScreenShare: settings.allowScreenShare !== false,
          requirePassword: settings.requirePassword || false,
          password: settings.password || null,
          waitingRoom: settings.waitingRoom || false,
          muteParticipantsOnEntry: settings.muteParticipantsOnEntry || false
        }
      });

      await meeting.save();

      // Add meeting to user's created meetings
      await User.findByIdAndUpdate(userId, {
        $push: { createdMeetings: meeting._id }
      });

      const populatedMeeting = await Meeting.findById(meeting._id)
        .populate('host', 'username email firstName lastName')
        .populate('participants.user', 'username email firstName lastName');

      return ApiResponse.created(res, populatedMeeting, 'Meeting created successfully');

    } catch (error) {
      console.error('Create meeting error:', error);
      return ApiResponse.error(res, 'Failed to create meeting', 500);
    }
  }

  static async getMeeting(req, res) {
    try {
      const { meetingId } = req.params;

      const meeting = await Meeting.findOne({ meetingId })
        .populate('host', 'username email firstName lastName')
        .populate('participants.user', 'username email firstName lastName');

      if (!meeting) {
        return ApiResponse.notFound(res, 'Meeting not found');
      }

      return ApiResponse.success(res, meeting, 'Meeting retrieved successfully');

    } catch (error) {
      console.error('Get meeting error:', error);
      return ApiResponse.error(res, 'Failed to retrieve meeting', 500);
    }
  }

  static async joinMeeting(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { meetingId } = req.params;
      const { password } = req.body;
      const userId = req.userId;

      const meeting = await Meeting.findOne({ meetingId })
        .populate('host', 'username email firstName lastName');

      if (!meeting) {
        return ApiResponse.notFound(res, 'Meeting not found');
      }

      // Check if meeting requires password
      if (meeting.settings.requirePassword) {
        if (!password) {
          return ApiResponse.validationError(res, null, 'Meeting password is required');
        }

        const isPasswordValid = await bcrypt.compare(password, meeting.settings.password);
        if (!isPasswordValid) {
          return ApiResponse.unauthorized(res, 'Invalid meeting password');
        }
      }

      // Check if user is already in the meeting
      const existingParticipant = meeting.participants.find(
        p => p.user.toString() === userId.toString() && !p.leftAt
      );

      if (existingParticipant) {
        return ApiResponse.conflict(res, 'You are already in this meeting');
      }

      // Check meeting capacity
      if (meeting.currentParticipantCount >= meeting.maxParticipants) {
        return ApiResponse.conflict(res, 'Meeting has reached maximum capacity');
      }

      // Add participant
      await meeting.addParticipant(userId);

      // Add meeting to user's joined meetings
      await User.findByIdAndUpdate(userId, {
        $addToSet: { joinedMeetings: meeting._id }
      });

      const updatedMeeting = await Meeting.findById(meeting._id)
        .populate('host', 'username email firstName lastName')
        .populate('participants.user', 'username email firstName lastName');

      return ApiResponse.success(res, updatedMeeting, 'Successfully joined meeting');

    } catch (error) {
      console.error('Join meeting error:', error);
      if (error.message.includes('already in the meeting') || error.message.includes('maximum capacity')) {
        return ApiResponse.conflict(res, error.message);
      }
      return ApiResponse.error(res, 'Failed to join meeting', 500);
    }
  }

  static async leaveMeeting(req, res) {
    try {
      const { meetingId } = req.params;
      const userId = req.userId;

      const meeting = await Meeting.findOne({ meetingId });

      if (!meeting) {
        return ApiResponse.notFound(res, 'Meeting not found');
      }

      // Check if user is in the meeting
      const participant = meeting.participants.find(
        p => p.user.toString() === userId.toString() && !p.leftAt
      );

      if (!participant) {
        return ApiResponse.conflict(res, 'You are not in this meeting');
      }

      await meeting.removeParticipant(userId);

      return ApiResponse.success(res, null, 'Successfully left meeting');

    } catch (error) {
      console.error('Leave meeting error:', error);
      return ApiResponse.error(res, 'Failed to leave meeting', 500);
    }
  }

  static async startMeeting(req, res) {
    try {
      const { meetingId } = req.params;
      const userId = req.userId;

      const meeting = await Meeting.findOne({ meetingId });

      if (!meeting) {
        return ApiResponse.notFound(res, 'Meeting not found');
      }

      // Only host can start the meeting
      if (meeting.host.toString() !== userId.toString()) {
        return ApiResponse.forbidden(res, 'Only the host can start the meeting');
      }

      if (meeting.isActive) {
        return ApiResponse.conflict(res, 'Meeting is already active');
      }

      await meeting.startMeeting();

      const updatedMeeting = await Meeting.findById(meeting._id)
        .populate('host', 'username email firstName lastName')
        .populate('participants.user', 'username email firstName lastName');

      return ApiResponse.success(res, updatedMeeting, 'Meeting started successfully');

    } catch (error) {
      console.error('Start meeting error:', error);
      return ApiResponse.error(res, 'Failed to start meeting', 500);
    }
  }

  static async endMeeting(req, res) {
    try {
      const { meetingId } = req.params;
      const userId = req.userId;

      const meeting = await Meeting.findOne({ meetingId });

      if (!meeting) {
        return ApiResponse.notFound(res, 'Meeting not found');
      }

      // Only host can end the meeting
      if (meeting.host.toString() !== userId.toString()) {
        return ApiResponse.forbidden(res, 'Only the host can end the meeting');
      }

      if (!meeting.isActive) {
        return ApiResponse.conflict(res, 'Meeting is not active');
      }

      await meeting.endMeeting();

      const updatedMeeting = await Meeting.findById(meeting._id)
        .populate('host', 'username email firstName lastName')
        .populate('participants.user', 'username email firstName lastName');

      return ApiResponse.success(res, updatedMeeting, 'Meeting ended successfully');

    } catch (error) {
      console.error('End meeting error:', error);
      return ApiResponse.error(res, 'Failed to end meeting', 500);
    }
  }

  static async updateMeetingSettings(req, res) {
    try {
      const { meetingId } = req.params;
      const userId = req.userId;
      const settings = req.body;

      const meeting = await Meeting.findOne({ meetingId });

      if (!meeting) {
        return ApiResponse.notFound(res, 'Meeting not found');
      }

      // Only host can update meeting settings
      if (meeting.host.toString() !== userId.toString()) {
        return ApiResponse.forbidden(res, 'Only the host can update meeting settings');
      }

      // Hash password if provided
      if (settings.requirePassword && settings.password) {
        const salt = await bcrypt.genSalt(10);
        settings.password = await bcrypt.hash(settings.password, salt);
      }

      meeting.settings = { ...meeting.settings, ...settings };
      await meeting.save();

      const updatedMeeting = await Meeting.findById(meeting._id)
        .populate('host', 'username email firstName lastName')
        .populate('participants.user', 'username email firstName lastName');

      return ApiResponse.success(res, updatedMeeting, 'Meeting settings updated successfully');

    } catch (error) {
      console.error('Update meeting settings error:', error);
      return ApiResponse.error(res, 'Failed to update meeting settings', 500);
    }
  }

  static async getUserMeetings(req, res) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 10, status = 'all' } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      let query = {
        $or: [
          { host: userId },
          { 'participants.user': userId }
        ]
      };

      // Filter by status
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'ended') {
        query.isActive = false;
        query.endTime = { $ne: null };
      } else if (status === 'scheduled') {
        query.isActive = false;
        query.scheduledStartTime = { $gte: new Date() };
      }

      const meetings = await Meeting.find(query)
        .populate('host', 'username email firstName lastName')
        .populate('participants.user', 'username email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const totalCount = await Meeting.countDocuments(query);

      return ApiResponse.paginated(res, meetings, totalCount, pageNum, limitNum, 'Meetings retrieved successfully');

    } catch (error) {
      console.error('Get user meetings error:', error);
      return ApiResponse.error(res, 'Failed to retrieve meetings', 500);
    }
  }

  static async getActiveMeetings(req, res) {
    try {
      const userId = req.userId;

      const activeMeetings = await Meeting.findActiveByUser(userId);

      return ApiResponse.success(res, activeMeetings, 'Active meetings retrieved successfully');

    } catch (error) {
      console.error('Get active meetings error:', error);
      return ApiResponse.error(res, 'Failed to retrieve active meetings', 500);
    }
  }

  static async updateParticipantSettings(req, res) {
    try {
      const { meetingId, participantId } = req.params;
      const { isVideoEnabled, isAudioEnabled, isScreenSharing } = req.body;
      const userId = req.userId;

      const meeting = await Meeting.findOne({ meetingId });

      if (!meeting) {
        return ApiResponse.notFound(res, 'Meeting not found');
      }

      // Find the participant
      const participant = meeting.participants.find(
        p => p.user.toString() === participantId && !p.leftAt
      );

      if (!participant) {
        return ApiResponse.notFound(res, 'Participant not found or has left the meeting');
      }

      // Only host or the participant themselves can update settings
      const isHost = meeting.host.toString() === userId.toString();
      const isParticipantSelf = participantId === userId.toString();

      if (!isHost && !isParticipantSelf) {
        return ApiResponse.forbidden(res, 'You can only update your own settings or as host');
      }

      // Update participant settings
      if (isVideoEnabled !== undefined) participant.isVideoEnabled = isVideoEnabled;
      if (isAudioEnabled !== undefined) participant.isAudioEnabled = isAudioEnabled;
      if (isScreenSharing !== undefined) participant.isScreenSharing = isScreenSharing;

      await meeting.save();

      return ApiResponse.success(res, participant, 'Participant settings updated successfully');

    } catch (error) {
      console.error('Update participant settings error:', error);
      return ApiResponse.error(res, 'Failed to update participant settings', 500);
    }
  }
}

module.exports = MeetingController;