const jwt = require('jsonwebtoken');
const config = require('../config/config');

class JWTUtils {
  static generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'video-conference-app',
      audience: 'video-conference-users'
    });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: 'video-conference-app',
        audience: 'video-conference-users'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else if (error.name === 'NotBeforeError') {
        throw new Error('Token not active yet');
      }
      throw new Error('Token verification failed');
    }
  }

  static decodeToken(token) {
    return jwt.decode(token, { complete: true });
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '30d',
      issuer: 'video-conference-app',
      audience: 'video-conference-refresh'
    });
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: 'video-conference-app',
        audience: 'video-conference-refresh'
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static getTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    return parts[1];
  }

  static isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload || !decoded.payload.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}

module.exports = JWTUtils;