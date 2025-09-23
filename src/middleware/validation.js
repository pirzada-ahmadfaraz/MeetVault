const { body } = require('express-validator');

class ValidationMiddleware {
  static registerValidation() {
    return [
      body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
      
      body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
      
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
      
      body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
      
      body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters')
    ];
  }

  static loginValidation() {
    return [
      body('identifier')
        .trim()
        .notEmpty()
        .withMessage('Email or username is required'),
      
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ];
  }

  static refreshTokenValidation() {
    return [
      body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
    ];
  }

  static updateProfileValidation() {
    return [
      body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
      
      body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
      
      body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters')
    ];
  }

  static changePasswordValidation() {
    return [
      body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
      
      body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
    ];
  }

  static createMeetingValidation() {
    return [
      body('title')
        .trim()
        .notEmpty()
        .withMessage('Meeting title is required')
        .isLength({ max: 100 })
        .withMessage('Meeting title cannot exceed 100 characters'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Meeting description cannot exceed 500 characters'),
      
      body('scheduledStartTime')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date for scheduled start time'),
      
      body('maxParticipants')
        .optional()
        .isInt({ min: 2, max: 100 })
        .withMessage('Max participants must be between 2 and 100'),
      
      body('settings.requirePassword')
        .optional()
        .isBoolean()
        .withMessage('Require password must be a boolean'),
      
      body('settings.password')
        .if(body('settings.requirePassword').equals(true))
        .notEmpty()
        .withMessage('Password is required when require password is enabled')
        .isLength({ min: 4, max: 20 })
        .withMessage('Meeting password must be between 4 and 20 characters'),
      
      body('settings.waitingRoom')
        .optional()
        .isBoolean()
        .withMessage('Waiting room must be a boolean'),
      
      body('settings.muteParticipantsOnEntry')
        .optional()
        .isBoolean()
        .withMessage('Mute participants on entry must be a boolean'),
      
      body('settings.allowChat')
        .optional()
        .isBoolean()
        .withMessage('Allow chat must be a boolean'),
      
      body('settings.allowScreenShare')
        .optional()
        .isBoolean()
        .withMessage('Allow screen share must be a boolean')
    ];
  }

  static joinMeetingValidation() {
    return [
      body('password')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Password cannot be empty')
    ];
  }

  static chatMessageValidation() {
    return [
      body('content')
        .trim()
        .notEmpty()
        .withMessage('Message content is required')
        .isLength({ max: 1000 })
        .withMessage('Message cannot exceed 1000 characters'),
      
      body('replyTo')
        .optional()
        .isMongoId()
        .withMessage('Reply to must be a valid message ID')
    ];
  }

  static reactionValidation() {
    return [
      body('emoji')
        .trim()
        .notEmpty()
        .withMessage('Emoji is required')
        .isLength({ max: 10 })
        .withMessage('Emoji cannot exceed 10 characters')
    ];
  }

  static oauthValidation() {
    return [
      body('provider')
        .trim()
        .notEmpty()
        .withMessage('OAuth provider is required')
        .isIn(['google', 'github'])
        .withMessage('Provider must be either google or github'),
      
      body('providerId')
        .trim()
        .notEmpty()
        .withMessage('Provider ID is required'),
      
      body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
      
      body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Name cannot exceed 100 characters'),
      
      body('image')
        .optional()
        .trim()
        .isURL()
        .withMessage('Image must be a valid URL')
    ];
  }
}

module.exports = ValidationMiddleware;