const express = require('express');
const http = require('http');
const connectDatabase = require('./config/database');
const config = require('./config/config');
const routes = require('./routes');
const SocketService = require('./services/socketService');
const SecurityMiddleware = require('./middleware/security');
const ErrorHandler = require('./middleware/errorHandler');

class Server {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.socketService = null;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Trust proxy (important for rate limiting and IP detection)
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(SecurityMiddleware.helmet());
    this.app.use(SecurityMiddleware.cors());
    this.app.use(SecurityMiddleware.securityHeaders());
    this.app.use(SecurityMiddleware.requestSize());

    // Request logging
    if (config.server.nodeEnv === 'development') {
      this.app.use(SecurityMiddleware.requestLogger());
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // General rate limiting
    this.app.use(SecurityMiddleware.generalRateLimit());

    // Specific rate limiting for auth routes
    this.app.use('/api/auth/login', SecurityMiddleware.authRateLimit());
    this.app.use('/api/auth/register', SecurityMiddleware.authRateLimit());
    this.app.use('/api/auth/refresh-token', SecurityMiddleware.strictRateLimit());

    // Rate limiting for meeting operations
    this.app.use('/api/meetings', SecurityMiddleware.meetingRateLimit());

    // Rate limiting for chat
    this.app.use('/api/chat', SecurityMiddleware.chatRateLimit());
  }

  setupRoutes() {
    // API routes
    this.app.use('/api', routes);

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Video Conference API Server',
        version: '1.0.0',
        environment: config.server.nodeEnv,
        timestamp: new Date().toISOString()
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(ErrorHandler.notFound);

    // Global error handler
    this.app.use(ErrorHandler.globalErrorHandler);
  }

  async start() {
    try {
      // Connect to database
      await connectDatabase();

      // Initialize Socket.IO
      this.socketService = new SocketService(this.server);
      console.log('Socket.IO initialized');

      // Start server
      const port = config.server.port;
      this.server.listen(port, () => {
        console.log(`
╔══════════════════════════════════════════════════╗
║          Video Conference API Server             ║
║                                                  ║
║  🚀 Server running on port ${port}                   ║
║  🌍 Environment: ${config.server.nodeEnv.padEnd(12)}              ║
║  📊 MongoDB Connected                            ║
║  🔌 Socket.IO Ready                              ║
║  📡 WebRTC Signaling Ready                       ║
║                                                  ║
║  API Documentation:                              ║
║  • Health Check: http://localhost:${port}/api/health  ║
║  • Auth: http://localhost:${port}/api/auth            ║
║  • Meetings: http://localhost:${port}/api/meetings    ║
║  • Chat: http://localhost:${port}/api/chat            ║
║                                                  ║
║  Ready for frontend connections! 🎉             ║
╚══════════════════════════════════════════════════╝
        `);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      this.server.close(() => {
        console.log('HTTP server closed.');
        
        if (this.socketService) {
          this.socketService.io.close(() => {
            console.log('Socket.IO server closed.');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        console.error('Forcing shutdown after 30 seconds...');
        process.exit(1);
      }, 30000);
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions and rejections
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
  }
}

// Start the server
if (require.main === module) {
  const server = new Server();
  server.start();
}

module.exports = Server;