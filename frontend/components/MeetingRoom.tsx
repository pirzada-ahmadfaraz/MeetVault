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
  XMarkIcon,
  MinusCircleIcon,
  MicrophoneIcon,
  SpeakerXMarkIcon
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
  const [isHostMuted, setIsHostMuted] = useState(false)
  const [screenSharingParticipants, setScreenSharingParticipants] = useState<Set<string>>(new Set())

  const webRTCService = useRef<WebRTCService | null>(null)
  const voiceDetector = useRef<VoiceActivityDetector | null>(null)

  const isHost = meeting.host._id === user?._id

  // Debug effect to track participant changes (only when they actually change)
  useEffect(() => {
    if (participants.length > 0) {
      console.log('🔗 MeetingRoom: Connected participants:', participants.length, participants.map(p => p.user.firstName))
    }
  }, [participants.length])

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
        console.log('🎥 MeetingRoom: Received video stream from participant:', participantId)
        setParticipantStreams(prev => {
          const updated = new Map(prev.set(participantId, stream))
          console.log('📊 MeetingRoom: Total streams now:', updated.size)
          return updated
        })
      },
      onParticipantScreenShareStarted: (participantId: string, stream: MediaStream) => {
        console.log('🖥️ MeetingRoom: Screen share started:', participantId)
        setScreenSharingParticipants(prev => {
          const newSet = new Set(prev)
          newSet.add(participantId)
          return newSet
        })
        // Update participants list to reflect screen sharing status
        setParticipants(prev =>
          prev.map(p => p.id === participantId ? { ...p, isScreenSharing: true } : p)
        )
      },
      onParticipantScreenShareStopped: (participantId: string) => {
        console.log('🖥️ MeetingRoom: Screen share stopped:', participantId)
        setScreenSharingParticipants(prev => {
          const newSet = new Set(prev)
          newSet.delete(participantId)
          return newSet
        })
        // Update participants list to reflect screen sharing stopped
        setParticipants(prev =>
          prev.map(p => p.id === participantId ? { ...p, isScreenSharing: false } : p)
        )
        // If this is the local user, also update the screen sharing state
        if (participantId === 'local') {
          setIsScreenSharing(false)
        }
      },
      onParticipantToggleVideo: (participantId: string, enabled: boolean) => {
        console.log('🎥 MeetingRoom: Participant video toggled:', participantId, enabled)

        // Update participants list
        setParticipants(prev =>
          prev.map(p => p.id === participantId ? { ...p, isVideoEnabled: enabled } : p)
        )

        // If this is the current user, update local state too
        if (user && (participantId === user._id || participantId === 'local')) {
          console.log('🎥 MeetingRoom: Updating local video state:', enabled)
          setIsVideoEnabled(enabled)
        }
      },
      onParticipantToggleAudio: (participantId: string, enabled: boolean) => {
        console.log('🎤 MeetingRoom: Participant audio toggled:', participantId, enabled)

        // Update participants list
        setParticipants(prev =>
          prev.map(p => p.id === participantId ? { ...p, isAudioEnabled: enabled } : p)
        )

        // If this is the current user, update local state too
        if (user && (participantId === user._id || participantId === 'local')) {
          console.log('🎤 MeetingRoom: Updating local audio state:', enabled)
          setIsAudioEnabled(enabled)

          // Handle voice detection state
          if (!enabled && voiceDetector.current) {
            voiceDetector.current.stopDetection()
            setSpeakingParticipants(prev => {
              const newSet = new Set(prev)
              newSet.delete('local')
              return newSet
            })
          } else if (enabled && localStream && voiceDetector.current) {
            voiceDetector.current.startDetection()
          }
        }
      },
      onParticipantVoiceActivity: (participantId: string, isSpeaking: boolean) => {
        console.log('🗣️ MeetingRoom: Participant voice activity:', participantId, isSpeaking)
        setSpeakingParticipants(prev => {
          const newSet = new Set(prev)
          if (isSpeaking) {
            newSet.add(participantId)
          } else {
            newSet.delete(participantId)
          }
          return newSet
        })
      },
      onMeetingEnded: (hostName: string) => {
        console.log('🚫 MeetingRoom: Meeting ended by host:', hostName)
        setError(`Meeting ended by ${hostName}`)
        // Automatically leave the meeting after a brief delay
        setTimeout(() => {
          onLeave()
        }, 3000)
      },
      onRemovedFromMeeting: (message: string, hostName: string) => {
        console.log('❌ MeetingRoom: Removed from meeting by host:', hostName)
        setError(`Removed by ${hostName}`)
        // Automatically leave the meeting after a brief delay
        setTimeout(() => {
          onLeave()
        }, 3000)
      },
      onParticipantRemoved: (participantId: string, removedBy: string) => {
        console.log('❌ MeetingRoom: Participant removed:', participantId, 'by:', removedBy)
        // Remove participant from local state
        setParticipants(prev => prev.filter(p => p.id !== participantId))
        setParticipantStreams(prev => {
          const newMap = new Map(prev)
          newMap.delete(participantId)
          return newMap
        })
      },
      onParticipantRemovedSuccess: (participantId: string) => {
        console.log('✅ MeetingRoom: Participant removal confirmed:', participantId)
        // Participant should already be removed from onParticipantRemoved callback
      },
      onHostMutedYou: (message: string, hostName: string) => {
        console.log('🔇 MeetingRoom: Muted by host:', hostName)
        setIsHostMuted(true)
        setIsAudioEnabled(false)
        setError(`You have been muted by ${hostName}`)
        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000)
      },
      onHostUnmutedYou: (message: string, hostName: string) => {
        console.log('🔊 MeetingRoom: Unmuted by host:', hostName)
        setIsHostMuted(false)
        setIsAudioEnabled(true)
        setError(`You have been unmuted by ${hostName}`)
        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000)
      },
      onParticipantMutedSuccess: (participantId: string) => {
        console.log('✅ MeetingRoom: Participant mute confirmed:', participantId)
        // Participant should already be updated from onParticipantToggleAudio callback
      },
      onParticipantUnmutedSuccess: (participantId: string) => {
        console.log('✅ MeetingRoom: Participant unmute confirmed:', participantId)
        // Participant should already be updated from onParticipantToggleAudio callback
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
          // Update local state
          setSpeakingParticipants(prev => {
            const newSet = new Set(prev)
            if (isSpeaking) {
              newSet.add('local')
            } else {
              newSet.delete('local')
            }
            return newSet
          })

          // Broadcast voice activity to other participants
          if (webRTCService.current) {
            webRTCService.current.broadcastVoiceActivity(isSpeaking)
          }
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
      // Check if user is trying to unmute while host-muted
      if (isHostMuted && !isAudioEnabled) {
        setError('You have been muted by the host and cannot unmute yourself')
        setTimeout(() => setError(null), 3000)
        return
      }

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

      // Update screen sharing participants set for local user
      setScreenSharingParticipants(prev => {
        const newSet = new Set(prev)
        if (enabled) {
          newSet.add('local')
        } else {
          newSet.delete('local')
        }
        return newSet
      })
    }
  }

  const handleEndMeeting = () => {
    if (webRTCService.current && isHost) {
      console.log('🚫 MeetingRoom: Host ending meeting')
      webRTCService.current.endMeeting()
    }
  }

  const handleRemoveParticipant = (participantId: string) => {
    if (webRTCService.current && isHost) {
      console.log('❌ MeetingRoom: Host removing participant:', participantId)
      webRTCService.current.removeParticipant(participantId)
    }
  }

  const handleMuteParticipant = (participantId: string) => {
    if (webRTCService.current && isHost) {
      console.log('🔇 MeetingRoom: Host muting participant:', participantId)
      webRTCService.current.hostMuteParticipant(participantId)
    }
  }

  const handleUnmuteParticipant = (participantId: string) => {
    if (webRTCService.current && isHost) {
      console.log('🔊 MeetingRoom: Host unmuting participant:', participantId)
      webRTCService.current.hostUnmuteParticipant(participantId)
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
    <div className="h-screen bg-gray-900 flex flex-col relative">
      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Meeting Header */}
      <div className="bg-gray-800 px-3 sm:px-4 py-2 sm:py-3">
        {/* Mobile Layout */}
        <div className="sm:hidden flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <h1 className="text-white font-medium text-sm truncate">{meeting.title}</h1>
            </div>
            <button
              onClick={onLeave}
              className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium"
            >
              Leave
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300">
                {participants.length + 1} participants
              </span>
            </div>
            {meeting.settings.allowChat && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-2 rounded-md transition-colors ${
                  isChatOpen
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Video Area */}
        <div className={`flex-1 flex flex-col ${isChatOpen && 'sm:mr-80'}`}>
          <div className="flex-1 p-2 sm:p-4 min-h-0">
            <VideoGrid
              participants={participants}
              localStream={localStream}
              participantStreams={participantStreams}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              isScreenSharing={isScreenSharing}
              currentUser={user}
              speakingParticipants={speakingParticipants}
              screenSharingParticipants={screenSharingParticipants}
            />
          </div>

          {/* Meeting Controls */}
          <div className="p-3 sm:p-4 flex-shrink-0 bg-gray-800 sm:bg-transparent">
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
              onEndMeeting={handleEndMeeting}
            />
          </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && meeting.settings.allowChat && (
          <div className="fixed sm:static inset-x-0 bottom-0 top-16 sm:top-0 sm:w-80 bg-white border-l border-gray-200 flex flex-col z-50 sm:z-auto">
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
                    {/* Host controls */}
                    {isHost && (
                      <div className="flex items-center space-x-1">
                        {/* Mute/Unmute button */}
                        {participant.isAudioEnabled ? (
                          <button
                            onClick={() => handleMuteParticipant(participant.id)}
                            className="text-yellow-400 hover:text-yellow-300 p-1 rounded-full hover:bg-yellow-900/30 transition-colors"
                            title="Mute participant"
                          >
                            <SpeakerXMarkIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnmuteParticipant(participant.id)}
                            className="text-green-400 hover:text-green-300 p-1 rounded-full hover:bg-green-900/30 transition-colors"
                            title="Unmute participant"
                          >
                            <MicrophoneIcon className="h-4 w-4" />
                          </button>
                        )}
                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/30 transition-colors"
                          title="Remove participant"
                        >
                          <MinusCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
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