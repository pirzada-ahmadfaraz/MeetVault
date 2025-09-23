const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const config = require('../config/config');

class SecurityMiddleware {
  static helmet() {
    return helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "wss:", "ws:"],
          mediaSrc: ["'self'", "blob:"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      }
    });
  }

  static cors() {
    return cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          config.cors.origin,
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001'
        ];
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-HTTP-Method-Override'
      ]
    });
  }

  static generalRateLimit() {
    return rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString()
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health check
        return req.path === '/api/health';
      }
    });
  }

  static strictRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: {
        success: false,
        message: 'Too many attempts, please try again later.',
        timestamp: new Date().toISOString()
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  static authRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 auth requests per windowMs
      message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        timestamp: new Date().toISOString()
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true
    });
  }

  static meetingRateLimit() {
    const isDevelopment = config.server.nodeEnv === 'development';
    
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: isDevelopment ? 100 : 10, // Higher limit in development
      message: {
        success: false,
        message: 'Too many meeting operations, please slow down.',
        timestamp: new Date().toISOString()
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  static chatRateLimit() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 30, // limit each IP to 30 chat messages per minute
      message: {
        success: false,
        message: 'Too many chat messages, please slow down.',
        timestamp: new Date().toISOString()
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  static requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        };
        
        if (req.user) {
          logData.userId = req.user._id;
          logData.username = req.user.username;
        }
        
        // Log different levels based on status code
        if (res.statusCode >= 500) {
          console.error('Server Error:', logData);
        } else if (res.statusCode >= 400) {
          console.warn('Client Error:', logData);
        } else {
          console.log('Request:', logData);
        }
      });
      
      next();
    };
  }

  static requestSize() {
    return (req, res, next) => {
      // Limit request size to 10MB
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      
      if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
        return res.status(413).json({
          success: false,
          message: 'Request too large',
          timestamp: new Date().toISOString()
        });
      }
      
      next();
    };
  }

  static ipWhitelist(allowedIPs = []) {
    return (req, res, next) => {
      if (allowedIPs.length === 0) {
        return next(); // No whitelist configured, allow all
      }
      
      const clientIP = req.ip || req.connection.remoteAddress;
      
      if (allowedIPs.includes(clientIP)) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'IP address not authorized',
        timestamp: new Date().toISOString()
      });
    };
  }

  static securityHeaders() {
    return (req, res, next) => {
      // Additional security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=self, microphone=self, display-capture=self');
      
      next();
    };
  }
}

module.exports = SecurityMiddleware;