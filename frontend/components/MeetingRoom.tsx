'use client'

import { useState, useEffect } from 'react'
import { Meeting } from '@/types'
import { useAuth } from '@/lib/auth-context'
import socketService from '@/lib/socket'
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

  const isHost = meeting.host._id === user?._id

  useEffect(() => {
    setShowJoinModal(!hasJoined)
  }, [hasJoined])

  useEffect(() => {
    if (hasJoined) {
      // Join the meeting room via Socket.IO
      socketService.joinMeeting(meeting.meetingId)

      // Set up socket event listeners
      socketService.onUserJoined((data) => {
        console.log('User joined:', data)
        // TODO: Update participants list
      })

      socketService.onUserLeft((data) => {
        console.log('User left:', data)
        // TODO: Update participants list
      })

      socketService.onSocketError((error) => {
        console.error('Socket error:', error)
        onError('Connection error occurred')
      })

      return () => {
        // Leave the meeting room and clean up listeners
        socketService.leaveMeeting(meeting.meetingId)
        socketService.off('user-joined')
        socketService.off('user-left')
        socketService.off('error')
      }
    }
  }, [hasJoined, meeting.meetingId, onError])

  const handleJoinWithPassword = async (password?: string) => {
    try {
      await onJoin(password)
      setShowJoinModal(false)
    } catch (error) {
      // Error is handled by parent component
    }
  }

  const handleToggleVideo = () => {
    const newVideoState = !isVideoEnabled
    setIsVideoEnabled(newVideoState)
    socketService.toggleVideo(meeting.meetingId, newVideoState)
  }

  const handleToggleAudio = () => {
    const newAudioState = !isAudioEnabled
    setIsAudioEnabled(newAudioState)
    socketService.toggleAudio(meeting.meetingId, newAudioState)
  }

  const handleToggleScreenShare = () => {
    const newScreenShareState = !isScreenSharing
    setIsScreenSharing(newScreenShareState)
    
    if (newScreenShareState) {
      socketService.startScreenShare(meeting.meetingId)
    } else {
      socketService.stopScreenShare(meeting.meetingId)
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
          <div className="flex-1 p-4">
            <VideoGrid
              participants={meeting.participants}
              isVideoEnabled={isVideoEnabled}
              isScreenSharing={isScreenSharing}
            />
          </div>

          {/* Meeting Controls */}
          <div className="p-4">
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