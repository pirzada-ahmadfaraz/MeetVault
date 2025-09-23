# VideoConf Frontend

A modern Next.js frontend for the VideoConf video conferencing application.

## 🚀 Features

- **Modern UI**: Clean, responsive design built with TailwindCSS
- **Authentication**: Secure JWT-based auth with auto-refresh
- **Real-time Chat**: Socket.IO integration for instant messaging
- **Meeting Management**: Create, join, and manage video meetings
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **TypeScript**: Full type safety throughout the application

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **Date Formatting**: date-fns

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── meeting/           # Meeting pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── ChatMessage.tsx    # Individual chat message
│   ├── ChatPanel.tsx      # Chat sidebar
│   ├── CreateMeetingModal.tsx
│   ├── JoinMeetingModal.tsx
│   ├── LoadingSpinner.tsx
│   ├── MeetingCard.tsx
│   ├── MeetingControls.tsx
│   ├── MeetingRoom.tsx    # Main meeting interface
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   ├── VideoGrid.tsx      # Video layout manager
│   └── VideoTile.tsx      # Individual video tile
├── lib/                   # Utilities and configurations
│   ├── api.ts             # API client
│   ├── auth-context.tsx   # Authentication context
│   └── socket.ts          # Socket.IO client
├── types/                 # TypeScript type definitions
│   └── index.ts
└── utils/                 # Utility functions
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:3000`

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

Create `.env.local` file (already created):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Features

### Authentication System

- **Login/Register**: Clean forms with validation
- **JWT Management**: Automatic token refresh and storage
- **Protected Routes**: Route-level authentication guards
- **Session Persistence**: Maintains login state across browser sessions

### Dashboard

- **Meeting Overview**: Quick access to recent and active meetings
- **Quick Actions**: Start new meeting, join existing, or schedule
- **Meeting Cards**: Visual representation of meeting status and details
- **Responsive Grid**: Adapts to different screen sizes

### Meeting Room

- **Video Grid**: Dynamic layout based on participant count
- **Meeting Controls**: Audio/video toggles, screen sharing, leave meeting
- **Real-time Chat**: Instant messaging with typing indicators
- **Participant Management**: View and manage meeting participants

### Real-time Features

- **Socket.IO Integration**: Bi-directional real-time communication
- **Live Chat**: Instant message delivery and typing indicators
- **Meeting Events**: Real-time participant join/leave notifications
- **Media Controls**: Synchronized audio/video state changes

## 🔧 Configuration

### API Integration

The frontend communicates with the backend via:

- **REST API**: For CRUD operations (auth, meetings, chat history)
- **Socket.IO**: For real-time events (chat, participant updates)

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

Key responsive features:
- Collapsible navigation
- Adaptive video grid layouts
- Mobile-optimized meeting controls
- Responsive chat panel

## 🎨 UI/UX Features

### Design System

- **Color Scheme**: Professional blue and gray palette
- **Typography**: Inter font for readability
- **Spacing**: Consistent spacing using Tailwind utilities
- **Animations**: Subtle hover effects and transitions

### Accessibility

- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG compliant color combinations

## 🔮 WebRTC Integration (Future)

The frontend is prepared for WebRTC integration with:

- Video tile components ready for video streams
- Socket.IO signaling infrastructure
- Media control state management
- Screen sharing UI components

To add WebRTC:

1. Implement getUserMedia for camera/microphone access
2. Add RTCPeerConnection handling in Socket.IO events
3. Connect video streams to VideoTile components
4. Implement screen sharing with getDisplayMedia

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables for Production

Set in your deployment platform:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## 🐛 Troubleshooting

### Common Issues

**API Connection Errors:**
- Verify backend is running on correct port
- Check CORS settings in backend
- Confirm API URL in environment variables

**Socket.IO Connection Issues:**
- Ensure WebSocket support in deployment environment
- Check firewall settings for Socket.IO ports
- Verify JWT token is valid for Socket.IO auth

**Build Errors:**
- Clear `.next` directory and rebuild
- Check TypeScript errors: `npx tsc --noEmit`
- Update dependencies if needed

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Update README for significant changes
4. Test responsive design on multiple screen sizes

## 📄 License

MIT License - see LICENSE file for details

---

**Ready to connect and collaborate! 🎉**

The frontend provides a complete video conferencing interface with modern design patterns and real-time capabilities.