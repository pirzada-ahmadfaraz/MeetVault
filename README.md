# 🎥 Video Conference App

A full-stack video conferencing application built with Next.js, Node.js, MongoDB, and WebRTC. This includes both backend API and frontend React application.

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

**Architecture:**
```
Frontend (Vercel) ↔ Backend (Railway) ↔ Database (MongoDB Atlas)
```

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

