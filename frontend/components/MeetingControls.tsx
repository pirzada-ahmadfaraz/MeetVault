'use client'

import {
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ComputerDesktopIcon,
  PhoneXMarkIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface MeetingControlsProps {
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  allowScreenShare: boolean
  onToggleVideo: () => void
  onToggleAudio: () => void
  onToggleScreenShare: () => void
  onLeave: () => void
  isHost: boolean
}

export default function MeetingControls({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  allowScreenShare,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onLeave,
  isHost
}: MeetingControlsProps) {
  return (
    <div className="flex items-center justify-center space-x-4">
      {/* Audio Toggle */}
      <button
        onClick={onToggleAudio}
        className={`p-4 rounded-full transition-colors ${
          isAudioEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
        title={isAudioEnabled ? 'Mute' : 'Unmute'}
      >
        {isAudioEnabled ? (
          <MicrophoneIcon className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MicrophoneIcon className="h-6 w-6" />
            <XMarkIcon className="h-4 w-4 absolute -top-1 -right-1 text-red-400" />
          </div>
        )}
      </button>

      {/* Video Toggle */}
      <button
        onClick={onToggleVideo}
        className={`p-4 rounded-full transition-colors ${
          isVideoEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? (
          <VideoCameraIcon className="h-6 w-6" />
        ) : (
          <VideoCameraSlashIcon className="h-6 w-6" />
        )}
      </button>

      {/* Screen Share Toggle */}
      {allowScreenShare && (
        <button
          onClick={onToggleScreenShare}
          className={`p-4 rounded-full transition-colors ${
            isScreenSharing
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <ComputerDesktopIcon className="h-6 w-6" />
        </button>
      )}

      {/* Participants (Host only) */}
      {isHost && (
        <button
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          title="Manage participants"
        >
          <UserGroupIcon className="h-6 w-6" />
        </button>
      )}

      {/* Settings */}
      <button
        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        title="Settings"
      >
        <Cog6ToothIcon className="h-6 w-6" />
      </button>

      {/* Leave Meeting */}
      <button
        onClick={onLeave}
        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
        title="Leave meeting"
      >
        <PhoneXMarkIcon className="h-6 w-6" />
      </button>
    </div>
  )
}