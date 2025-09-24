import { io, Socket } from 'socket.io-client'

export interface MediaControls {
  video: boolean
  audio: boolean
  screenShare: boolean
}

export interface Participant {
  id: string
  userId: string
  user: {
    _id: string
    firstName: string
    lastName: string
    username: string
    email: string
  }
  isHost: boolean
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  stream?: MediaStream | null
  screenStream?: MediaStream
}

interface WebRTCCallbacks {
  onParticipantJoined: (participant: Participant) => void
  onParticipantLeft: (participantId: string) => void
  onParticipantStreamUpdated: (participantId: string, stream: MediaStream) => void
  onParticipantScreenShareStarted: (participantId: string, stream: MediaStream) => void
  onParticipantScreenShareStopped: (participantId: string) => void
  onParticipantToggleVideo: (participantId: string, enabled: boolean) => void
  onParticipantToggleAudio: (participantId: string, enabled: boolean) => void
  onError: (error: string) => void
}

export class WebRTCService {
  private socket: Socket | null = null
  private localStream: MediaStream | null = null
  private localScreenStream: MediaStream | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private meetingId: string | null = null
  private callbacks: WebRTCCallbacks | null = null
  private mediaControls: MediaControls = {
    video: true,
    audio: true,
    screenShare: false
  }

  private iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]

  constructor() {
    this.initializeSocket()
  }

  private initializeSocket() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
    const socketUrl = apiUrl.replace('/api', '')

    // Get auth token from localStorage or session
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        token: token
      }
    })

    this.socket.on('connect', () => {
      console.log('📡 WebRTC: Connected to signaling server')
    })

    this.socket.on('disconnect', () => {
      console.log('📡 WebRTC: Disconnected from signaling server')
    })

    this.socket.on('user-joined', (data) => {
      console.log('👤 WebRTC: User joined:', data.user?.firstName || data.userId)
      this.handleUserJoined(data)
    })

    this.socket.on('user-left', (data) => {
      console.log('👋 WebRTC: User left:', data.userId)
      this.handleUserLeft(data.userId)
    })

    this.socket.on('meeting-joined', (data: any) => {
      console.log('🎉 WebRTC: Meeting joined! Found', data.participants?.length || 0, 'existing participants')
      // Handle existing participants
      if (data.participants && data.participants.length > 0) {
        data.participants.forEach((participant: any) => {
          const formattedParticipant = {
            id: participant.userId.toString(),
            userId: participant.userId.toString(),
            user: participant.user,
            isHost: false,
            isVideoEnabled: participant.isVideoEnabled,
            isAudioEnabled: participant.isAudioEnabled,
            isScreenSharing: participant.isScreenSharing
          }
          console.log('➕ WebRTC: Adding existing participant:', participant.user.firstName)
          this.callbacks?.onParticipantJoined(formattedParticipant)

          // Don't create peer connections here - let the natural offer/answer flow handle it
          // The existing participants will receive a 'user-joined' event and initiate offers
        })
      } else {
        console.log('✨ WebRTC: First participant in meeting')
      }
    })

    this.socket.on('user-disconnected', (data) => {
      console.log('User disconnected:', data)
      this.handleUserLeft(data.userId)
    })

    this.socket.on('offer', (data) => {
      console.log('📞 WebRTC: Received offer from:', data.fromUserId)
      this.handleOffer(data)
    })

    this.socket.on('answer', (data) => {
      console.log('✅ WebRTC: Received answer from:', data.fromUserId)
      this.handleAnswer(data)
    })

    this.socket.on('ice-candidate', (data) => {
      console.log('🧊 WebRTC: Received ICE candidate from:', data.fromUserId)
      this.handleIceCandidate(data)
    })

    this.socket.on('participant-video-toggled', (data) => {
      this.callbacks?.onParticipantToggleVideo(data.userId, data.isVideoEnabled)
    })

    this.socket.on('participant-audio-toggled', (data) => {
      this.callbacks?.onParticipantToggleAudio(data.userId, data.isAudioEnabled)
    })

    this.socket.on('participant-started-screen-share', (data) => {
      console.log('Participant started screen share:', data)
    })

    this.socket.on('participant-stopped-screen-share', (data) => {
      console.log('Participant stopped screen share:', data)
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
      this.callbacks?.onError(error.message || 'Connection error')
    })
  }

  async joinMeeting(meetingId: string, callbacks: WebRTCCallbacks) {
    console.log('🚀 WebRTC: Attempting to join meeting:', meetingId)
    this.meetingId = meetingId
    this.callbacks = callbacks

    try {
      // Check socket connection first
      if (!this.socket || !this.socket.connected) {
        console.error('❌ WebRTC: Socket not connected')
        this.callbacks?.onError('Connection failed. Please refresh and try again.')
        return false
      }

      // Get user media
      console.log('🎥 WebRTC: Initializing camera and microphone...')
      await this.initializeUserMedia()

      // Join the meeting room via socket
      console.log('🏠 WebRTC: Joining meeting room via socket...')
      this.socket?.emit('join-meeting', { meetingId })

      console.log('✅ WebRTC: Meeting join process completed successfully')
      return true
    } catch (error) {
      console.error('❌ WebRTC: Failed to join meeting:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera/microphone'
      this.callbacks?.onError(errorMessage)
      return false
    }
  }

  async initializeUserMedia() {
    try {
      console.log('🎥 WebRTC: Requesting camera and microphone access...')

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC is not supported in this browser')
      }

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      console.log('✅ WebRTC: Successfully got user media stream:', this.localStream.id)

      // Set initial states
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = this.mediaControls.video
        console.log('📹 WebRTC: Video track enabled:', track.enabled, 'Label:', track.label)
      })

      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = this.mediaControls.audio
        console.log('🎤 WebRTC: Audio track enabled:', track.enabled, 'Label:', track.label)
      })

      return this.localStream
    } catch (error) {
      console.error('❌ WebRTC: Failed to get user media:', error)

      // Provide specific error messages for different permission issues
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Camera/microphone access denied. Please allow permissions and refresh.')
        } else if (error.name === 'NotFoundError') {
          throw new Error('No camera or microphone found. Please check your devices.')
        } else if (error.name === 'NotReadableError') {
          throw new Error('Camera/microphone is already in use by another application.')
        } else if (error.name === 'OverconstrainedError') {
          throw new Error('Camera/microphone constraints could not be satisfied.')
        } else if (error.name === 'SecurityError') {
          throw new Error('Camera/microphone access blocked by browser security.')
        }
      }

      throw error
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getLocalScreenStream(): MediaStream | null {
    return this.localScreenStream
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      this.mediaControls.video = videoTrack.enabled

      // Notify other participants
      this.socket?.emit('toggle-video', {
        meetingId: this.meetingId,
        isVideoEnabled: videoTrack.enabled
      })

      return videoTrack.enabled
    }
    return false
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.localStream) return false

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      this.mediaControls.audio = audioTrack.enabled

      // Notify other participants
      this.socket?.emit('toggle-audio', {
        meetingId: this.meetingId,
        isAudioEnabled: audioTrack.enabled
      })

      return audioTrack.enabled
    }
    return false
  }

  async toggleScreenShare(): Promise<boolean> {
    try {
      if (this.mediaControls.screenShare) {
        // Stop screen sharing
        if (this.localScreenStream) {
          this.localScreenStream.getTracks().forEach(track => track.stop())
          this.localScreenStream = null
        }

        this.mediaControls.screenShare = false

        // Notify other participants
        this.socket?.emit('stop-screen-share', {
          meetingId: this.meetingId
        })

        return false
      } else {
        // Start screen sharing
        this.localScreenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })

        this.mediaControls.screenShare = true

        // Handle screen share end (when user clicks "Stop sharing" in browser)
        this.localScreenStream.getVideoTracks()[0].addEventListener('ended', () => {
          this.mediaControls.screenShare = false
          this.localScreenStream = null
          this.socket?.emit('stop-screen-share', {
            meetingId: this.meetingId
          })
        })

        // Notify other participants
        this.socket?.emit('start-screen-share', {
          meetingId: this.meetingId
        })

        return true
      }
    } catch (error) {
      console.error('Screen share error:', error)
      return false
    }
  }

  private async handleUserJoined(data: any) {
    const { userId, user } = data
    console.log('🤝 WebRTC: Setting up connection with', user.firstName)

    try {
      // Check if we already have a peer connection (avoid duplicates)
      if (this.peerConnections.has(userId)) {
        console.log('⚠️ WebRTC: Peer connection already exists for:', user.firstName)
        return
      }

      const participant: Participant = {
        id: userId,
        userId: userId,
        user: {
          _id: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email || ''
        },
        isHost: false,
        isVideoEnabled: true,
        isAudioEnabled: true,
        isScreenSharing: false
      }

      // Create peer connection for this participant
      console.log('🔗 WebRTC: Creating peer connection for new participant:', user.firstName)
      const peerConnection = this.createPeerConnection(userId)
      this.peerConnections.set(userId, peerConnection)

      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream!)
        })
        console.log('📹 WebRTC: Added local stream tracks to peer connection')
      }

      // Create offer for new participant
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      console.log('📤 WebRTC: Sending offer to', user.firstName)
      this.socket?.emit('offer', {
        meetingId: this.meetingId,
        targetUserId: userId,
        offer: offer
      })

      this.callbacks?.onParticipantJoined(participant)
    } catch (error) {
      console.error('❌ WebRTC: Error handling user joined:', user.firstName, error)
    }
  }

  private handleUserLeft(participantId: string) {
    const peerConnection = this.peerConnections.get(participantId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(participantId)
    }

    this.callbacks?.onParticipantLeft(participantId)
  }

  private async handleOffer(data: any) {
    const { fromUserId, offer } = data

    try {
      // Check if we already have a peer connection (avoid duplicates)
      if (this.peerConnections.has(fromUserId)) {
        console.log('⚠️ WebRTC: Peer connection already exists for offer from:', fromUserId)
        return
      }

      console.log('🤝 WebRTC: Creating peer connection to handle offer from:', fromUserId)
      const peerConnection = this.createPeerConnection(fromUserId)
      this.peerConnections.set(fromUserId, peerConnection)

      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream!)
        })
        console.log('📹 WebRTC: Added local stream tracks to peer connection')
      }

      await peerConnection.setRemoteDescription(offer)
      console.log('📥 WebRTC: Set remote description from offer')

      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      console.log('📤 WebRTC: Sending answer back to:', fromUserId)
      this.socket?.emit('answer', {
        meetingId: this.meetingId,
        targetUserId: fromUserId,
        answer: answer
      })
    } catch (error) {
      console.error('❌ WebRTC: Error handling offer from:', fromUserId, error)
    }
  }

  private async handleAnswer(data: any) {
    const { fromUserId, answer } = data

    try {
      const peerConnection = this.peerConnections.get(fromUserId)
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer)
        console.log('📥 WebRTC: Set remote description from answer:', fromUserId)
      } else {
        console.error('❌ WebRTC: No peer connection found for answer from:', fromUserId)
      }
    } catch (error) {
      console.error('❌ WebRTC: Error handling answer from:', fromUserId, error)
    }
  }

  private async handleIceCandidate(data: any) {
    const { fromUserId, candidate } = data

    try {
      const peerConnection = this.peerConnections.get(fromUserId)
      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(candidate)
        console.log('🧊 WebRTC: Added ICE candidate from:', fromUserId)
      } else if (!peerConnection) {
        console.error('❌ WebRTC: No peer connection found for ICE candidate from:', fromUserId)
      }
    } catch (error) {
      console.error('❌ WebRTC: Error adding ICE candidate from:', fromUserId, error)
    }
  }

  private createPeerConnection(participantId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    })

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('ice-candidate', {
          meetingId: this.meetingId,
          targetUserId: participantId,
          candidate: event.candidate
        })
      }
    }

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      console.log('🎥 WebRTC: Received video stream from participant:', participantId)
      console.log('Stream details:', {
        id: remoteStream.id,
        videoTracks: remoteStream.getVideoTracks().length,
        audioTracks: remoteStream.getAudioTracks().length,
        active: remoteStream.active
      })
      this.callbacks?.onParticipantStreamUpdated(participantId, remoteStream)
    }

    peerConnection.onconnectionstatechange = () => {
      console.log('🔗 WebRTC: Connection state changed:', participantId, '->', peerConnection.connectionState)
      if (peerConnection.connectionState === 'connected') {
        console.log('✅ WebRTC: Successfully connected to participant:', participantId)
      } else if (peerConnection.connectionState === 'failed') {
        console.error('❌ WebRTC: Connection failed to participant:', participantId)
      }
    }

    return peerConnection
  }

  leaveMeeting() {
    // Stop local streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach(track => track.stop())
      this.localScreenStream = null
    }

    // Close all peer connections
    this.peerConnections.forEach(pc => pc.close())
    this.peerConnections.clear()

    // Leave meeting via socket
    this.socket?.emit('leave-meeting', { meetingId: this.meetingId })

    this.meetingId = null
    this.callbacks = null
  }

  getMediaControls(): MediaControls {
    return { ...this.mediaControls }
  }


  disconnect() {
    this.leaveMeeting()
    this.socket?.disconnect()
  }
}