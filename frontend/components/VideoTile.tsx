import { Participant } from '@/services/webrtc'
import { useEffect, useRef } from 'react'
import {
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  XMarkIcon,
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
  isSpeaking = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user, isVideoEnabled, isAudioEnabled, isScreenSharing, isHost } = participant

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, participant.id, isVideoEnabled])

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
  const speaking = isAudioEnabled && isSpeaking

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-surface-2 transition-all duration-200 ${
        speaking ? 'ring-2 ring-lime-400 shadow-[0_0_0_1px_rgba(163,230,53,0.4)]' : 'border border-white/8'
      } ${isSmall ? 'h-16 sm:h-24' : 'h-full min-h-[120px] sm:min-h-[200px] max-h-[600px]'}`}
    >
      <div className="w-full h-full flex items-center justify-center">
        {isVideoEnabled && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={participant.id === 'local'}
            className={`w-full h-full object-contain bg-ink ${participant.id === 'local' ? 'transform scale-x-[-1]' : ''}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-2 to-surface flex items-center justify-center">
            <div className="text-center p-2 sm:p-4">
              <div className={`rounded-full mx-auto flex items-center justify-center bg-surface-3 border border-white/10 font-display font-bold text-fg ${isSmall ? 'w-8 h-8 sm:w-12 sm:h-12 text-xs mb-1' : 'w-16 h-16 sm:w-20 sm:h-20 text-xl mb-2'}`}>
                {initials || '?'}
              </div>
              {!isSmall && (
                <div>
                  <p className="text-sm sm:text-base font-medium text-fg mb-0.5">{user.firstName} {user.lastName}</p>
                  <p className="mono-label text-[0.45rem] text-faint">Camera off</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {/* badges */}
        {isScreenSharing && (
          <div className="absolute top-2 right-2 rounded-md bg-lime-500/90 text-[#11160a] px-2 py-0.5 mono-label text-[0.4rem]">
            {isSmall ? 'Share' : 'Sharing'}
          </div>
        )}
        {isHost && (
          <div className="absolute top-2 left-2 rounded-md bg-black/50 backdrop-blur-sm border border-white/10 text-fg px-2 py-0.5 mono-label text-[0.4rem]">
            Host
          </div>
        )}

        {/* bottom overlay */}
        {showControls && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/65 to-transparent p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-fg truncate mr-2">
                {user.firstName} {user.lastName}{isSmall && ` (${user.username})`}
              </span>
              <div className="flex items-center gap-1">
                {speaking ? (
                  <span className="eq h-3.5 rounded bg-black/40 px-1 py-0.5">
                    <span className="animate-eq1" /><span className="animate-eq3" /><span className="animate-eq2" />
                  </span>
                ) : (
                  <span className={`p-1 rounded ${isAudioEnabled ? 'bg-lime-500/80 text-[#11160a]' : 'bg-tally-500 text-white'}`}>
                    {isAudioEnabled ? <MicrophoneIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : (
                      <span className="relative block"><MicrophoneIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" /><XMarkIcon className="h-2 w-2 absolute -top-0.5 -right-0.5" /></span>
                    )}
                  </span>
                )}
                <span className={`p-1 rounded ${isVideoEnabled ? 'bg-lime-500/80 text-[#11160a]' : 'bg-tally-500 text-white'}`}>
                  {isVideoEnabled ? <VideoCameraIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <VideoCameraSlashIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
