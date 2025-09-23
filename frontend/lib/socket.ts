'use client'

import { io, Socket } from 'socket.io-client'
import { ChatMessage } from '@/types'

class SocketService {
  private socket: Socket | null = null
  private isConnected = false

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.disconnect()
      }

      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'

      this.socket = io(SOCKET_URL, {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      })

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id)
        this.isConnected = true
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        this.isConnected = false
        reject(error)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        this.isConnected = false
      })

      this.socket.on('error', (error) => {
        console.error('Socket error:', error)
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  getConnectionStatus() {
    return this.isConnected
  }

  // Meeting Events
  joinMeeting(meetingId: string) {
    if (this.socket) {
      this.socket.emit('join-meeting', { meetingId })
    }
  }

  leaveMeeting(meetingId: string) {
    if (this.socket) {
      this.socket.emit('leave-meeting', { meetingId })
    }
  }

  // WebRTC Signaling Events
  sendOffer(targetUserId: string, offer: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('offer', { targetUserId, offer })
    }
  }

  sendAnswer(targetUserId: string, answer: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('answer', { targetUserId, answer })
    }
  }

  sendIceCandidate(targetUserId: string, candidate: RTCIceCandidate) {
    if (this.socket) {
      this.socket.emit('ice-candidate', { targetUserId, candidate })
    }
  }

  // Media Control Events
  toggleVideo(meetingId: string, isVideoEnabled: boolean) {
    if (this.socket) {
      this.socket.emit('toggle-video', { meetingId, isVideoEnabled })
    }
  }

  toggleAudio(meetingId: string, isAudioEnabled: boolean) {
    if (this.socket) {
      this.socket.emit('toggle-audio', { meetingId, isAudioEnabled })
    }
  }

  startScreenShare(meetingId: string) {
    if (this.socket) {
      this.socket.emit('start-screen-share', { meetingId })
    }
  }

  stopScreenShare(meetingId: string) {
    if (this.socket) {
      this.socket.emit('stop-screen-share', { meetingId })
    }
  }

  // Chat Events
  sendMessage(meetingId: string, content: string, replyTo?: string) {
    if (this.socket) {
      this.socket.emit('send-message', { meetingId, content, replyTo })
    }
  }

  startTyping(meetingId: string) {
    if (this.socket) {
      this.socket.emit('typing-start', { meetingId })
    }
  }

  stopTyping(meetingId: string) {
    if (this.socket) {
      this.socket.emit('typing-stop', { meetingId })
    }
  }

  // Event Listeners
  onMeetingJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('meeting-joined', callback)
    }
  }

  onUserJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-joined', callback)
    }
  }

  onUserLeft(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-left', callback)
    }
  }

  onUserDisconnected(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-disconnected', callback)
    }
  }

  // WebRTC Event Listeners
  onOffer(callback: (data: { fromUserId: string; offer: RTCSessionDescriptionInit }) => void) {
    if (this.socket) {
      this.socket.on('offer', callback)
    }
  }

  onAnswer(callback: (data: { fromUserId: string; answer: RTCSessionDescriptionInit }) => void) {
    if (this.socket) {
      this.socket.on('answer', callback)
    }
  }

  onIceCandidate(callback: (data: { fromUserId: string; candidate: RTCIceCandidate }) => void) {
    if (this.socket) {
      this.socket.on('ice-candidate', callback)
    }
  }

  // Media Control Event Listeners
  onParticipantVideoToggled(callback: (data: { userId: string; isVideoEnabled: boolean }) => void) {
    if (this.socket) {
      this.socket.on('participant-video-toggled', callback)
    }
  }

  onParticipantAudioToggled(callback: (data: { userId: string; isAudioEnabled: boolean }) => void) {
    if (this.socket) {
      this.socket.on('participant-audio-toggled', callback)
    }
  }

  onParticipantStartedScreenShare(callback: (data: { userId: string; user: any }) => void) {
    if (this.socket) {
      this.socket.on('participant-started-screen-share', callback)
    }
  }

  onParticipantStoppedScreenShare(callback: (data: { userId: string }) => void) {
    if (this.socket) {
      this.socket.on('participant-stopped-screen-share', callback)
    }
  }

  // Chat Event Listeners
  onNewMessage(callback: (message: ChatMessage) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback)
    }
  }

  onUserTypingStart(callback: (data: { userId: string; user: any }) => void) {
    if (this.socket) {
      this.socket.on('user-typing-start', callback)
    }
  }

  onUserTypingStop(callback: (data: { userId: string }) => void) {
    if (this.socket) {
      this.socket.on('user-typing-stop', callback)
    }
  }

  // Error Event Listener
  onSocketError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.on('error', callback)
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }

  // Remove specific listeners
  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

// Create singleton instance
const socketService = new SocketService()

export default socketService