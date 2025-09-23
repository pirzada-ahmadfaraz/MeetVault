import { Participant } from '@/services/webrtc'
import { useEffect, useRef } from 'react'
import {
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface VideoTileProps {
  participant: Participant
  stream?: MediaStream | null
  isSmall?: boolean
  showControls?: boolean
}

export default function VideoTile({
  participant,
  stream,
  isSmall = false,
  showControls = true
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user, isVideoEnabled, isAudioEnabled, isScreenSharing, isHost } = participant

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      console.log('VideoTile: Setting video stream for participant:', participant.id, stream)
    } else {
      console.log('VideoTile: No stream for participant:', participant.id, { hasVideoRef: !!videoRef.current, hasStream: !!stream, isVideoEnabled })
    }
  }, [stream, participant.id, isVideoEnabled])

  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${isSmall ? 'h-24' : 'h-full min-h-[200px] max-h-[600px]'}`}>
      {/* Video content */}
      <div className="w-full h-full flex items-center justify-center">
        {isVideoEnabled && stream ? (
          // Real video stream
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={participant.id === 'local'} // Mute local video to prevent echo
            className="w-full h-full object-contain bg-gray-900"
          />
        ) : (
          // Avatar placeholder when video is off
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-gray-600 p-4 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-gray-300" />
              </div>
              {!isSmall && (
                <p className="text-white text-sm font-medium">
                  {user.firstName} {user.lastName}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay indicators */}
      <div className="absolute inset-0">
        {/* Screen sharing indicator */}
        {isScreenSharing && (
          <div className="absolute top-2 right-2">
            <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
              Sharing
            </div>
          </div>
        )}

        {/* Host indicator */}
        {isHost && (
          <div className="absolute top-2 left-2">
            <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              Host
            </div>
          </div>
        )}

        {/* Controls overlay */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex items-center justify-between">
              {/* User name */}
              <span className="text-white text-sm font-medium truncate">
                {user.firstName} {user.lastName}
                {isSmall && ' (' + user.username + ')'}
              </span>

              {/* Audio/Video indicators */}
              <div className="flex items-center space-x-1">
                {/* Audio indicator */}
                <div className={`p-1 rounded ${isAudioEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                  {isAudioEnabled ? (
                    <MicrophoneIcon className="h-3 w-3 text-white" />
                  ) : (
                    <div className="relative">
                      <MicrophoneIcon className="h-3 w-3 text-white" />
                      <XMarkIcon className="h-2 w-2 absolute -top-0.5 -right-0.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Video indicator */}
                <div className={`p-1 rounded ${isVideoEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                  {isVideoEnabled ? (
                    <VideoCameraIcon className="h-3 w-3 text-white" />
                  ) : (
                    <VideoCameraSlashIcon className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Speaking indicator */}
      {isAudioEnabled && (
        <div className="absolute inset-0 border-2 border-green-400 rounded-lg opacity-0 animate-pulse">
          {/* This would be triggered by voice activity detection */}
        </div>
      )}
    </div>
  )
}