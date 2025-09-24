'use client'

import { useState, useEffect, useRef } from 'react'
import { Meeting } from '@/types'
import { useAuth } from '@/lib/auth-context'
import { WebRTCService, Participant } from '@/services/webrtc'
import { VoiceActivityDetector } from '@/utils/voiceActivityDetection'
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
  const [speakingParticipants, setSpeakingParticipants] = useState<Set<string>>(new Set())
  const [showParticipants, setShowParticipants] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const webRTCService = useRef<WebRTCService | null>(null)
  const voiceDetector = useRef<VoiceActivityDetector | null>(null)

  const isHost = meeting.host._id === user?._id

  // Debug effect to track participant changes
  useEffect(() => {
    console.log('MeetingRoom: Participants state changed:', participants.length, participants)
  }, [participants])

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
      if (voiceDetector.current) {
        voiceDetector.current.cleanup()
        voiceDetector.current = null
      }
    }
  }, [hasJoined, meeting.meetingId])

  const initializeWebRTC = async () => {
    webRTCService.current = new WebRTCService()

    const callbacks = {
      onParticipantJoined: (participant: Participant) => {
        console.log('MeetingRoom: Participant joined:', participant)
        setParticipants(prev => {
          console.log('MeetingRoom: Previous participants:', prev)
          const updated = [...prev, participant]
          console.log('MeetingRoom: Updated participants:', updated)
          return updated
        })
      },
      onParticipantLeft: (participantId: string) => {
        console.log('MeetingRoom: Participant left:', participantId)
        setParticipants(prev => {
          const updated = prev.filter(p => p.id !== participantId)
          console.log('MeetingRoom: Participants after leave:', updated)
          return updated
        })
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

      // Initialize voice activity detection for local stream
      if (stream && isAudioEnabled) {
        initializeVoiceDetection(stream)
      }
    } else {
      console.error('MeetingRoom: Failed to join meeting with WebRTC')
    }
  }

  const initializeVoiceDetection = async (stream: MediaStream) => {
    try {
      voiceDetector.current = new VoiceActivityDetector()
      const success = await voiceDetector.current.initialize(stream)

      if (success) {
        voiceDetector.current.addCallback((isSpeaking: boolean) => {
          setSpeakingParticipants(prev => {
            const newSet = new Set(prev)
            if (isSpeaking) {
              newSet.add('local')
            } else {
              newSet.delete('local')
            }
            return newSet
          })
        })
        console.log('Voice activity detection initialized successfully')
      } else {
        console.error('Failed to initialize voice activity detection')
      }
    } catch (error) {
      console.error('Error setting up voice activity detection:', error)
    }
  }

  const handleShowParticipants = () => {
    setShowParticipants(true)
  }

  const handleShowSettings = () => {
    setShowSettings(true)
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

      // Handle voice detection when audio is toggled
      if (enabled && localStream) {
        // Re-initialize voice detection when audio is enabled
        initializeVoiceDetection(localStream)
      } else if (voiceDetector.current) {
        // Stop voice detection when audio is disabled
        voiceDetector.current.stopDetection()
        setSpeakingParticipants(prev => {
          const newSet = new Set(prev)
          newSet.delete('local')
          return newSet
        })
      }
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
              {participants.length + 1} participants
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
              speakingParticipants={speakingParticipants}
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
              onShowParticipants={handleShowParticipants}
              onShowSettings={handleShowSettings}
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

      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-96 max-h-96 overflow-y-auto border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Participants ({participants.length + 1})</h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-2">
              {user && (
                <div className="flex items-center justify-between p-3 bg-blue-900/50 rounded-lg border border-blue-700">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span className="font-medium text-white">{user.firstName} {user.lastName} (You)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-blue-300 bg-blue-900/70 px-2 py-1 rounded">Host</span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`} title={isAudioEnabled ? 'Audio on' : 'Audio off'}></div>
                      <div className={`w-3 h-3 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`} title={isVideoEnabled ? 'Video on' : 'Video off'}></div>
                    </div>
                  </div>
                </div>
              )}
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {participant.user.firstName?.[0]}{participant.user.lastName?.[0]}
                    </div>
                    <span className="text-white">{participant.user.firstName} {participant.user.lastName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded-full ${participant.isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`} title={participant.isAudioEnabled ? 'Audio on' : 'Audio off'}></div>
                      <div className={`w-3 h-3 rounded-full ${participant.isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`} title={participant.isVideoEnabled ? 'Video on' : 'Video off'}></div>
                    </div>
                  </div>
                </div>
              ))}
              {participants.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">No other participants have joined yet</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-96 border border-gray-600">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-white mb-3">Audio & Video Controls</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-200">Camera</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVideoEnabled}
                        onChange={handleToggleVideo}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-200">Microphone</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAudioEnabled}
                        onChange={handleToggleAudio}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-white mb-3">Meeting Information</h4>
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Meeting ID:</span>
                    <span className="text-sm font-mono text-white">{meeting.meetingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Title:</span>
                    <span className="text-sm text-white">{meeting.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Host:</span>
                    <span className="text-sm text-white">{meeting.host.firstName} {meeting.host.lastName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}