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
  onShowParticipants?: () => void
  onShowSettings?: () => void
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
  isHost,
  onShowParticipants,
  onShowSettings
}: MeetingControlsProps) {
  return (
    <div>
      {/* Mobile Layout - Two rows for better usability */}
      <div className="sm:hidden">
        {/* Primary controls (always visible) */}
        <div className="flex items-center justify-center space-x-4 mb-3">
          {/* Audio Toggle */}
          <button
            onClick={onToggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled
                ? 'bg-gray-700 text-white'
                : 'bg-red-600 text-white'
            }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? (
              <MicrophoneIcon className="h-5 w-5" />
            ) : (
              <div className="relative">
                <MicrophoneIcon className="h-5 w-5" />
                <XMarkIcon className="h-3 w-3 absolute -top-1 -right-1 text-red-400" />
              </div>
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={onToggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled
                ? 'bg-gray-700 text-white'
                : 'bg-red-600 text-white'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? (
              <VideoCameraIcon className="h-5 w-5" />
            ) : (
              <VideoCameraSlashIcon className="h-5 w-5" />
            )}
          </button>

          {/* Leave Meeting */}
          <button
            onClick={onLeave}
            className="p-3 rounded-full bg-red-600 text-white transition-colors"
            title="Leave meeting"
          >
            <PhoneXMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center justify-center space-x-3">
          {/* Screen Share Toggle */}
          {allowScreenShare && (
            <button
              onClick={onToggleScreenShare}
              className={`p-2.5 rounded-full transition-colors ${
                isScreenSharing
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <ComputerDesktopIcon className="h-4 w-4" />
            </button>
          )}

          {/* Participants (Host only) */}
          {isHost && (
            <button
              onClick={onShowParticipants}
              className="p-2.5 rounded-full bg-gray-700 text-white transition-colors"
              title="Manage participants"
            >
              <UserGroupIcon className="h-4 w-4" />
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onShowSettings}
            className="p-2.5 rounded-full bg-gray-700 text-white transition-colors"
            title="Settings"
          >
            <Cog6ToothIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Desktop Layout - Single row */}
      <div className="hidden sm:flex items-center justify-center space-x-4">
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
            onClick={onShowParticipants}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title="Manage participants"
          >
            <UserGroupIcon className="h-6 w-6" />
          </button>
        )}

        {/* Settings */}
        <button
          onClick={onShowSettings}
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
    </div>
  )
}