const express = require('express');
const MeetingController = require('../controllers/meetingController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// All meeting routes require authentication
router.use(AuthMiddleware.authenticate);

// Create a new meeting
router.post('/',
  ValidationMiddleware.createMeetingValidation(),
  MeetingController.createMeeting
);

// Get user's meetings (hosted or joined)
router.get('/my-meetings', MeetingController.getUserMeetings);

// Get active meetings for current user
router.get('/active', MeetingController.getActiveMeetings);

// Get meeting by ID
router.get('/:meetingId', MeetingController.getMeeting);

// Join a meeting
router.post('/:meetingId/join',
  ValidationMiddleware.joinMeetingValidation(),
  MeetingController.joinMeeting
);

// Leave a meeting
router.post('/:meetingId/leave', MeetingController.leaveMeeting);

// Start a meeting (host only)
router.post('/:meetingId/start', MeetingController.startMeeting);

// End a meeting (host only)
router.post('/:meetingId/end', MeetingController.endMeeting);

// Update meeting settings (host only)
router.put('/:meetingId/settings', MeetingController.updateMeetingSettings);

// Update participant settings
router.put('/:meetingId/participants/:participantId/settings', 
  MeetingController.updateParticipantSettings
);

module.exports = router;