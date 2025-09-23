'use client'

import { useState, useEffect, useRef } from 'react'
import { Meeting } from '@/types'
import { useAuth } from '@/lib/auth-context'
import { WebRTCService, Participant } from '@/services/webrtc'
import VideoGrid from './VideoGrid'
import ChatPanel from './ChatPanel'
import MeetingControls from './MeetingControls'
import MeetingJoinPrompt from './MeetingJoinPrompt'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface MeetingRoomProps {
  meeting: Meeting
  hasJoined: boolean
  onJoin: (password?: string) => Promise<void>
  onLeave: () => void
  onError: (error: string) => void
}

export default function MeetingRoom({
  meeting,
  hasJoined,
  onJoin,
  onLeave,
  onError
}: MeetingRoomProps) {
  const { user } = useAuth()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(!hasJoined)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [participantStreams, setParticipantStreams] = useState<Map<string, MediaStream>>(new Map())
  const [error, setError] = useState<string | null>(null)

  const webRTCService = useRef<WebRTCService | null>(null)

  const isHost = meeting.host._id === user?._id

  useEffect(() => {
    setShowJoinModal(!hasJoined)
  }, [hasJoined])

  useEffect(() => {
    if (hasJoined && !webRTCService.current) {
      initializeWebRTC()
    }

    return () => {
      if (webRTCService.current) {
        webRTCService.current.leaveMeeting()
        webRTCService.current.disconnect()
        webRTCService.current = null
      }
    }
  }, [hasJoined, meeting.meetingId])

  const initializeWebRTC = async () => {
    webRTCService.current = new WebRTCService()

    const callbacks = {
      onParticipantJoined: (participant: Participant) => {
        console.log('Participant joined:', participant)
        setParticipants(prev => [...prev, participant])
      },
      onParticipantLeft: (participantId: string) => {
        console.log('Participant left:', participantId)
        setParticipants(prev => prev.filter(p => p.id !== participantId))
        setParticipantStreams(prev => {
          const newMap = new Map(prev)
          newMap.delete(participantId)
          return newMap
        })
      },
      onParticipantStreamUpdated: (participantId: string, stream: MediaStream) => {
        console.log('Participant stream updated:', participantId)
        setParticipantStreams(prev => new Map(prev.set(participantId, stream)))
      },
      onParticipantScreenShareStarted: (participantId: string, stream: MediaStream) => {
        console.log('Screen share started:', participantId)
        // Handle screen share
      },
      onParticipantScreenShareStopped: (participantId: string) => {
        console.log('Screen share stopped:', participantId)
        // Handle screen share stop
      },
      onParticipantToggleVideo: (participantId: string, enabled: boolean) => {
        setParticipants(prev =>
          prev.map(p => p.id === participantId ? { ...p, isVideoEnabled: enabled } : p)
        )
      },
      onParticipantToggleAudio: (participantId: string, enabled: boolean) => {
        setParticipants(prev =>
          prev.map(p => p.id === participantId ? { ...p, isAudioEnabled: enabled } : p)
        )
      },
      onError: (error: string) => {
        console.error('WebRTC error:', error)
        setError(error)
        onError(error)
      }
    }

    const success = await webRTCService.current.joinMeeting(meeting.meetingId, callbacks)
    if (success) {
      const stream = webRTCService.current.getLocalStream()
      console.log('MeetingRoom: Got local stream:', stream)
      setLocalStream(stream)
    } else {
      console.error('MeetingRoom: Failed to join meeting with WebRTC')
    }
  }

  const handleJoinWithPassword = async (password?: string) => {
    try {
      await onJoin(password)
      setShowJoinModal(false)
    } catch (error) {
      // Error is handled by parent component
    }
  }

  const handleToggleVideo = async () => {
    if (webRTCService.current) {
      const enabled = await webRTCService.current.toggleVideo()
      setIsVideoEnabled(enabled)
    }
  }

  const handleToggleAudio = async () => {
    if (webRTCService.current) {
      const enabled = await webRTCService.current.toggleAudio()
      setIsAudioEnabled(enabled)
    }
  }

  const handleToggleScreenShare = async () => {
    if (webRTCService.current) {
      const enabled = await webRTCService.current.toggleScreenShare()
      setIsScreenSharing(enabled)
    }
  }

  if (showJoinModal) {
    return (
      <MeetingJoinPrompt
        meeting={meeting}
        onJoin={handleJoinWithPassword}
        onCancel={() => window.history.back()}
      />
    )
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Meeting Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white font-medium">{meeting.title}</h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">
              {meeting.participants.filter(p => !p.leftAt).length} participants
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {meeting.settings.allowChat && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-md transition-colors ${
                isChatOpen 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </button>
          )}
          
          <button
            onClick={onLeave}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className={`flex-1 flex flex-col ${isChatOpen ? 'mr-80' : ''}`}>
          <div className="flex-1 p-4 min-h-0">
            <VideoGrid
              participants={participants}
              localStream={localStream}
              participantStreams={participantStreams}
              isVideoEnabled={isVideoEnabled}
              isScreenSharing={isScreenSharing}
              currentUser={user}
            />
          </div>

          {/* Meeting Controls */}
          <div className="p-4 flex-shrink-0">
            <MeetingControls
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              isScreenSharing={isScreenSharing}
              allowScreenShare={meeting.settings.allowScreenShare}
              onToggleVideo={handleToggleVideo}
              onToggleAudio={handleToggleAudio}
              onToggleScreenShare={handleToggleScreenShare}
              onLeave={onLeave}
              isHost={isHost}
            />
          </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && meeting.settings.allowChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <ChatPanel meetingId={meeting.meetingId} />
          </div>
        )}
      </div>
    </div>
  )
}