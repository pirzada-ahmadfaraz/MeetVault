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
  isSpeaking?: boolean
}

export default function VideoTile({
  participant,
  stream,
  isSmall = false,
  showControls = true,
  isSpeaking = false
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
    <div className={`relative ${
      isVideoEnabled && stream
        ? 'bg-gray-900'
        : 'bg-gray-800 border border-gray-600'
    } rounded-lg overflow-hidden ${
      isSmall ? 'h-16 sm:h-24' : 'h-full min-h-[120px] sm:min-h-[200px] max-h-[600px]'
    } transition-all duration-200`}>
      {/* Video content */}
      <div className="w-full h-full flex items-center justify-center">
        {isVideoEnabled && stream ? (
          // Real video stream
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={participant.id === 'local'} // Mute local video to prevent echo
            className={`w-full h-full object-contain bg-gray-900 ${
              participant.id === 'local' ? 'transform scale-x-[-1]' : ''
            }`}
          />
        ) : (
          // Avatar placeholder when video is off
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
            <div className="text-center p-2 sm:p-4">
              <div className={`bg-gradient-to-br from-gray-600 to-gray-500 rounded-full mx-auto flex items-center justify-center shadow-lg ${
                isSmall
                  ? 'p-2 w-8 h-8 sm:p-3 sm:w-12 sm:h-12 mb-1 sm:mb-2'
                  : 'p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-3'
              }`}>
                <UserIcon className={`text-gray-200 ${
                  isSmall ? 'h-4 w-4 sm:h-6 sm:w-6' : 'h-8 w-8 sm:h-10 sm:w-10'
                }`} />
              </div>
              {!isSmall && (
                <div>
                  <p className="text-white text-sm sm:text-base font-medium mb-0.5 sm:mb-1">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-gray-300 text-xs">
                    Camera off
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay indicators */}
      <div className="absolute inset-0">
        {/* Screen sharing indicator */}
        {isScreenSharing && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
            <div className="bg-green-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium">
              {isSmall ? 'Share' : 'Sharing'}
            </div>
          </div>
        )}

        {/* Host indicator */}
        {isHost && (
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
            <div className="bg-blue-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium">
              Host
            </div>
          </div>
        )}

        {/* Controls overlay */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-3">
            <div className="flex items-center justify-between">
              {/* User name */}
              <span className="text-white text-xs sm:text-sm font-medium truncate mr-2">
                {user.firstName} {user.lastName}
                {isSmall && ' (' + user.username + ')'}
              </span>

              {/* Audio/Video indicators */}
              <div className="flex items-center space-x-1">
                {/* Audio indicator */}
                <div className={`p-1 rounded ${isAudioEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                  {isAudioEnabled ? (
                    <MicrophoneIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                  ) : (
                    <div className="relative">
                      <MicrophoneIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                      <XMarkIcon className="h-2 w-2 absolute -top-0.5 -right-0.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Video indicator */}
                <div className={`p-1 rounded ${isVideoEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                  {isVideoEnabled ? (
                    <VideoCameraIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                  ) : (
                    <VideoCameraSlashIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Speaking indicator */}
      {isAudioEnabled && isSpeaking && (
        <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse">
          {/* This shows when the participant is actively speaking */}
        </div>
      )}
    </div>
  )
}