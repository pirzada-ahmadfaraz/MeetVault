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
  stream?: MediaStream
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

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Connected to signaling server')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server')
    })

    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data)
      this.handleUserJoined(data)
    })

    this.socket.on('user-left', (data) => {
      console.log('User left:', data)
      this.handleUserLeft(data.participantId)
    })

    this.socket.on('offer', (data) => {
      console.log('Received offer:', data)
      this.handleOffer(data)
    })

    this.socket.on('answer', (data) => {
      console.log('Received answer:', data)
      this.handleAnswer(data)
    })

    this.socket.on('ice-candidate', (data) => {
      console.log('Received ICE candidate:', data)
      this.handleIceCandidate(data)
    })

    this.socket.on('participant-video-toggled', (data) => {
      this.callbacks?.onParticipantToggleVideo(data.participantId, data.enabled)
    })

    this.socket.on('participant-audio-toggled', (data) => {
      this.callbacks?.onParticipantToggleAudio(data.participantId, data.enabled)
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
    this.meetingId = meetingId
    this.callbacks = callbacks

    try {
      // Get user media
      await this.initializeUserMedia()

      // Join the meeting room via socket
      this.socket?.emit('join-meeting', { meetingId })

      return true
    } catch (error) {
      console.error('Failed to join meeting:', error)
      this.callbacks?.onError('Failed to access camera/microphone')
      return false
    }
  }

  async initializeUserMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      // Set initial states
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = this.mediaControls.video
      })

      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = this.mediaControls.audio
      })

      return this.localStream
    } catch (error) {
      console.error('Failed to get user media:', error)
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
        enabled: videoTrack.enabled
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
        enabled: audioTrack.enabled
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
    const { participant } = data

    // Create peer connection for this participant
    const peerConnection = this.createPeerConnection(participant.id)
    this.peerConnections.set(participant.id, peerConnection)

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Create offer for new participant
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    this.socket?.emit('offer', {
      meetingId: this.meetingId,
      target: participant.id,
      offer: offer
    })

    this.callbacks?.onParticipantJoined(participant)
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
    const { from, offer } = data

    const peerConnection = this.createPeerConnection(from)
    this.peerConnections.set(from, peerConnection)

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    await peerConnection.setRemoteDescription(offer)

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    this.socket?.emit('answer', {
      meetingId: this.meetingId,
      target: from,
      answer: answer
    })
  }

  private async handleAnswer(data: any) {
    const { from, answer } = data

    const peerConnection = this.peerConnections.get(from)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer)
    }
  }

  private async handleIceCandidate(data: any) {
    const { from, candidate } = data

    const peerConnection = this.peerConnections.get(from)
    if (peerConnection && candidate) {
      await peerConnection.addIceCandidate(candidate)
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
          target: participantId,
          candidate: event.candidate
        })
      }
    }

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      console.log('Received remote stream:', remoteStream)
      this.callbacks?.onParticipantStreamUpdated(participantId, remoteStream)
    }

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState)
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