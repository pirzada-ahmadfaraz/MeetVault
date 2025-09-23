const JWTUtils = require('../utils/jwt');
const { User } = require('../models');

class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.header('Authorization');
      
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      const token = JWTUtils.getTokenFromHeader(authHeader);
      const decoded = JWTUtils.verifyToken(token);

      // Fetch user from database to ensure user still exists and is active
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated.'
        });
      }

      // Add user to request object
      req.user = user;
      req.userId = user._id;
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid token.'
      });
    }
  }

  static async optionalAuth(req, res, next) {
    try {
      const authHeader = req.header('Authorization');
      
      if (authHeader) {
        const token = JWTUtils.getTokenFromHeader(authHeader);
        const decoded = JWTUtils.verifyToken(token);
        
        const user = await User.findById(decoded.userId);
        
        if (user && user.isActive) {
          req.user = user;
          req.userId = user._id;
        }
      }
      
      next();
    } catch (error) {
      // For optional auth, we don't return an error, just continue without user
      next();
    }
  }

  static requireRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions.'
        });
      }

      next();
    };
  }

  static requireMeetingHost(req, res, next) {
    // This middleware assumes meeting is already loaded in req.meeting
    if (!req.meeting) {
      return res.status(400).json({
        success: false,
        message: 'Meeting context required.'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only meeting host can perform this action.'
      });
    }

    next();
  }

  static requireMeetingParticipant(req, res, next) {
    if (!req.meeting) {
      return res.status(400).json({
        success: false,
        message: 'Meeting context required.'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const isHost = req.meeting.host.toString() === req.user._id.toString();
    const isParticipant = req.meeting.participants.some(
      p => p.user.toString() === req.user._id.toString() && !p.leftAt
    );

    if (!isHost && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this meeting.'
      });
    }

    next();
  }
}

module.exports = AuthMiddleware;