# Video Conference Backend API

A complete backend solution for a video conferencing web application, built with Node.js, Express, Socket.IO, and MongoDB. This backend provides authentication, meeting management, real-time signaling for WebRTC, and chat functionality.

## 🚀 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Meeting Management**: Create, join, and manage video meetings
- **Real-time Communication**: Socket.IO for WebRTC signaling and chat
- **Chat System**: Real-time messaging with reactions and replies
- **Security**: Rate limiting, CORS, Helmet, and input validation
- **Production Ready**: Environment configuration, error handling, and logging

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

## 📁 Project Structure

```
src/
├── config/
│   ├── config.js          # Environment configuration
│   └── database.js        # MongoDB connection
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── meetingController.js # Meeting management
│   └── chatController.js  # Chat functionality
├── middleware/
│   ├── auth.js            # Authentication middleware
│   ├── validation.js      # Input validation rules
│   ├── security.js        # Security middleware
│   └── errorHandler.js    # Error handling
├── models/
│   ├── User.js            # User model
│   ├── Meeting.js         # Meeting model
│   ├── ChatMessage.js     # Chat message model
│   └── index.js           # Model exports
├── routes/
│   ├── auth.js            # Auth routes
│   ├── meetings.js        # Meeting routes
│   ├── chat.js            # Chat routes
│   └── index.js           # Route aggregation
├── services/
│   └── socketService.js   # Socket.IO service
├── utils/
│   ├── jwt.js             # JWT utilities
│   └── response.js        # API response helpers
└── server.js              # Main server file
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn package manager

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd "Video Confrence Project"

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/video-conference-app

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: Replace `JWT_SECRET` with a strong, unique secret key!

### 3. Database Setup

Make sure MongoDB is running:

**Local MongoDB:**
```bash
# Start MongoDB service (varies by OS)
# macOS with Homebrew:
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian:
sudo systemctl start mongod

# Windows: Start MongoDB service from Services panel
```

**MongoDB Atlas (Cloud):**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create cluster and get connection string
- Update `MONGODB_URI` in `.env` file

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

You should see:
```
╔══════════════════════════════════════════════════╗
║          Video Conference API Server             ║
║                                                  ║
║  🚀 Server running on port 3000                 ║
║  🌍 Environment: development                     ║
║  📊 MongoDB Connected                            ║
║  🔌 Socket.IO Ready                              ║
║  📡 WebRTC Signaling Ready                       ║
║                                                  ║
║  Ready for frontend connections! 🎉             ║
╚══════════════════════════════════════════════════╝
```

## 📚 API Documentation

### Base URL
`http://localhost:3000/api`

### Authentication Routes

#### Register User
```http
POST /api/auth/register
```
**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
```
**Body:**
```json
{
  "identifier": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Meeting Routes

#### Create Meeting
```http
POST /api/meetings
Authorization: Bearer <token>
```
**Body:**
```json
{
  "title": "Team Standup",
  "description": "Daily team meeting",
  "maxParticipants": 10,
  "settings": {
    "allowChat": true,
    "allowScreenShare": true,
    "requirePassword": false,
    "waitingRoom": false
  }
}
```

#### Get User's Meetings
```http
GET /api/meetings/my-meetings?page=1&limit=10&status=all
Authorization: Bearer <token>
```

#### Join Meeting
```http
POST /api/meetings/{meetingId}/join
Authorization: Bearer <token>
```
**Body:**
```json
{
  "password": "optional-meeting-password"
}
```

#### Start Meeting (Host only)
```http
POST /api/meetings/{meetingId}/start
Authorization: Bearer <token>
```

#### End Meeting (Host only)
```http
POST /api/meetings/{meetingId}/end
Authorization: Bearer <token>
```

### Chat Routes

#### Send Message
```http
POST /api/chat/meetings/{meetingId}/messages
Authorization: Bearer <token>
```
**Body:**
```json
{
  "content": "Hello everyone!",
  "replyTo": "optional-message-id"
}
```

#### Get Messages
```http
GET /api/chat/meetings/{meetingId}/messages?page=1&limit=50
Authorization: Bearer <token>
```

### Socket.IO Events

#### Client to Server Events

- `join-meeting`: Join a meeting room
- `leave-meeting`: Leave a meeting room
- `offer`: WebRTC offer for peer connection
- `answer`: WebRTC answer for peer connection
- `ice-candidate`: ICE candidate for WebRTC
- `toggle-video`: Toggle video on/off
- `toggle-audio`: Toggle audio on/off
- `start-screen-share`: Start screen sharing
- `stop-screen-share`: Stop screen sharing
- `send-message`: Send chat message
- `typing-start`: Start typing indicator
- `typing-stop`: Stop typing indicator

#### Server to Client Events

- `meeting-joined`: Successfully joined meeting
- `user-joined`: Another user joined
- `user-left`: User left meeting
- `offer`: Received WebRTC offer
- `answer`: Received WebRTC answer
- `ice-candidate`: Received ICE candidate
- `participant-video-toggled`: User toggled video
- `participant-audio-toggled`: User toggled audio
- `participant-started-screen-share`: User started screen share
- `participant-stopped-screen-share`: User stopped screen share
- `new-message`: New chat message received
- `user-typing-start`: User started typing
- `user-typing-stop`: User stopped typing
- `error`: Error occurred

## 🔧 Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Adding New Features

1. **Models**: Add to `src/models/`
2. **Controllers**: Add to `src/controllers/`
3. **Routes**: Add to `src/routes/` and register in `src/routes/index.js`
4. **Middleware**: Add to `src/middleware/`
5. **Socket Events**: Add to `src/services/socketService.js`

### Database Models

#### User Model
- Authentication and user profile information
- Password hashing with bcrypt
- Meeting relationships

#### Meeting Model
- Meeting metadata and settings
- Participant management
- Meeting state tracking

#### ChatMessage Model
- Chat messages with reactions
- Reply threading
- Read receipts

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents abuse and DOS attacks
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Sets various HTTP headers
- **Input Validation**: Validates and sanitizes all inputs
- **Password Hashing**: Bcrypt with salt rounds
- **Environment Secrets**: Sensitive data in environment variables

## 📊 Monitoring and Logging

- Request/response logging in development
- Error tracking with stack traces
- Performance monitoring (response times)
- Security event logging

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video-conference
JWT_SECRET=very-long-and-secure-secret-key
CORS_ORIGIN=https://yourdomain.com
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Configure MongoDB Atlas or production DB
- [ ] Set up HTTPS/SSL
- [ ] Configure reverse proxy (nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure monitoring and logging
- [ ] Set up backup strategy

### PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start src/server.js --name "video-conference-api"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for MongoDB Atlas)

**JWT Token Issues:**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper Authorization header format

**Socket.IO Connection Issues:**
- Check CORS configuration
- Verify client-side connection code
- Check network/firewall settings

**Rate Limiting Issues:**
- Adjust rate limit settings in config
- Clear rate limit cache (restart server)

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and request logging.

### Support

For issues and questions:
- Check existing issues in the repository
- Create detailed bug reports with:
  - Environment details
  - Steps to reproduce
  - Error messages/logs
  - Expected vs actual behavior

---

**Ready to build your video conferencing frontend! 🎉**

The backend provides all necessary APIs and real-time functionality for video calls, chat, and meeting management. Connect your React, Vue, or any other frontend framework to these endpoints and Socket.IO events.