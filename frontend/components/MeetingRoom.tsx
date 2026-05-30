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
    <div className="h-screen bg-ink text-fg flex flex-col relative overflow-hidden">
      {/* Error toast */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] panel rounded-xl px-4 py-2.5 animate-fadeIn border-tally-500/40">
          <p className="text-sm font-medium text-tally-300 flex items-center gap-2"><span className="tally-dot" />{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/8 bg-surface/80 backdrop-blur-xl px-3 sm:px-5 py-2.5 flex-shrink-0">
        {/* Mobile */}
        <div className="sm:hidden flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-display font-bold text-sm truncate">{meeting.title}</h1>
            <button onClick={onLeave} className="bg-tally-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-tally">Leave</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2"><span className="tally-dot" /><span className="mono-label text-[0.5rem] text-muted tabular-nums">{participants.length + 1} live</span></span>
            {meeting.settings.allowChat && (
              <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-2 rounded-lg transition-colors ${isChatOpen ? 'bg-lime-500/15 text-lime-300 border border-lime-500/30' : 'bg-white/5 text-muted border border-white/8'}`}>
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-md bg-tally-500/15 border border-tally-500/30 px-2 py-1"><span className="tally-dot" /><span className="mono-label text-[0.5rem] text-tally-400">Live</span></span>
            <h1 className="font-display font-bold">{meeting.title}</h1>
            <span className="mono-label text-[0.5rem] text-muted tabular-nums">{participants.length + 1} connected</span>
          </div>
          <div className="flex items-center gap-2">
            {meeting.settings.allowChat && (
              <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-2.5 rounded-xl transition-colors ${isChatOpen ? 'bg-lime-500/15 text-lime-300 border border-lime-500/30' : 'bg-white/5 text-muted border border-white/8 hover:text-fg'}`}>
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
              </button>
            )}
            <button onClick={onLeave} className="bg-tally-500 text-white px-4 py-2 rounded-xl font-semibold hover:brightness-110 transition-all shadow-tally">Leave</button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        <div className={`flex-1 flex flex-col min-h-0 ${isChatOpen && 'sm:mr-80'}`}>
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

          {/* Controls dock */}
          <div className="p-3 sm:p-4 flex-shrink-0">
            <div className="mx-auto w-fit sm:panel sm:rounded-2xl sm:px-3 sm:py-2.5">
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
        </div>

        {/* Chat sidebar */}
        {isChatOpen && meeting.settings.allowChat && (
          <div className="fixed sm:static inset-x-0 bottom-0 top-16 sm:top-0 sm:w-80 bg-surface border-l border-white/8 flex flex-col z-50 sm:z-auto shadow-2xl min-h-0">
            <div className="p-4 border-b border-white/8 flex items-center justify-between bg-surface-2/60 flex-shrink-0">
              <h3 className="font-display font-bold flex items-center gap-2 text-sm"><ChatBubbleLeftRightIcon className="w-4 h-4 text-lime-400" /> Chat</h3>
              <button onClick={() => setIsChatOpen(false)} className="text-muted hover:text-fg p-1 rounded-full hover:bg-white/5 transition-colors"><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <ChatPanel meetingId={meeting.meetingId} />
          </div>
        )}
      </div>

      {/* Participants modal */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="frost rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold">Participants <span className="text-muted tabular-nums">({participants.length + 1})</span></h3>
              <button onClick={() => setShowParticipants(false)} className="w-9 h-9 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center text-muted hover:text-fg transition-colors"><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <div className="space-y-2">
              {user && (
                <div className="flex items-center justify-between p-3 rounded-2xl border border-lime-500/25 bg-lime-500/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-300 font-display font-bold text-xs">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                    <span className="font-medium text-sm">{user.firstName} {user.lastName} (You)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isHost && <span className="mono-label text-[0.4rem] text-lime-300 bg-lime-500/10 border border-lime-500/25 px-2 py-0.5 rounded">Host</span>}
                    <span className={`w-2.5 h-2.5 rounded-full ${isAudioEnabled ? 'bg-lime-400' : 'bg-tally-500'}`} title="Audio" />
                    <span className={`w-2.5 h-2.5 rounded-full ${isVideoEnabled ? 'bg-lime-400' : 'bg-tally-500'}`} title="Video" />
                  </div>
                </div>
              )}
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors border border-white/6">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-surface-3 border border-white/10 flex items-center justify-center font-display font-bold text-xs">{participant.user.firstName?.[0]}{participant.user.lastName?.[0]}</span>
                    <span className="text-sm">{participant.user.firstName} {participant.user.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${participant.isAudioEnabled ? 'bg-lime-400' : 'bg-tally-500'}`} title="Audio" />
                    <span className={`w-2.5 h-2.5 rounded-full ${participant.isVideoEnabled ? 'bg-lime-400' : 'bg-tally-500'}`} title="Video" />
                    {isHost && (
                      <div className="flex items-center gap-1 ml-1">
                        {participant.isAudioEnabled ? (
                          <button onClick={() => handleMuteParticipant(participant.id)} className="text-amber-300 hover:text-amber-200 p-1.5 rounded-lg hover:bg-amber-500/10 transition-colors" title="Mute"><SpeakerXMarkIcon className="h-4 w-4" /></button>
                        ) : (
                          <button onClick={() => handleUnmuteParticipant(participant.id)} className="text-lime-300 hover:text-lime-200 p-1.5 rounded-lg hover:bg-lime-500/10 transition-colors" title="Unmute"><MicrophoneIcon className="h-4 w-4" /></button>
                        )}
                        <button onClick={() => handleRemoveParticipant(participant.id)} className="text-tally-400 hover:text-tally-300 p-1.5 rounded-lg hover:bg-tally-500/10 transition-colors" title="Remove"><MinusCircleIcon className="h-4 w-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {participants.length === 0 && (
                <div className="text-center py-8 mono-label text-[0.5rem] text-faint">No other participants yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="frost rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="w-9 h-9 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center text-muted hover:text-fg transition-colors"><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="mono-label text-[0.5rem] text-faint mb-3">Audio &amp; Video</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/8 bg-white/[0.015]">
                    <span className="text-sm font-medium">Camera</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={isVideoEnabled} onChange={handleToggleVideo} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/8 bg-white/[0.015]">
                    <span className="text-sm font-medium">Microphone</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={isAudioEnabled} onChange={handleToggleAudio} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mono-label text-[0.5rem] text-faint mb-3">Room info</h4>
                <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Room ID</span><span className="font-mono">{meeting.meetingId}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Title</span><span className="font-medium">{meeting.title}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Host</span><span className="font-medium">{meeting.host.firstName} {meeting.host.lastName}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}