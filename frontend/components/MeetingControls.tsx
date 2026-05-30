'use client'

import {
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ComputerDesktopIcon,
  PhoneXMarkIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  XMarkIcon,
  StopIcon,
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
  onEndMeeting?: () => void
}

const base = 'rounded-full flex items-center justify-center transition-all duration-200'
const neutral = 'bg-surface-3 hover:bg-white/10 text-fg border border-white/10'
const off = 'bg-tally-500 hover:brightness-110 text-white'
const live = 'bg-lime-500 hover:brightness-105 text-[#11160a]'
const danger = 'bg-tally-600 hover:brightness-110 text-white'

export default function MeetingControls({
  isVideoEnabled, isAudioEnabled, isScreenSharing, allowScreenShare,
  onToggleVideo, onToggleAudio, onToggleScreenShare, onLeave, isHost,
  onShowParticipants, onShowSettings, onEndMeeting,
}: MeetingControlsProps) {
  const AudioIcon = () => isAudioEnabled
    ? <MicrophoneIcon className="h-5 w-5 sm:h-6 sm:w-6" />
    : <span className="relative block"><MicrophoneIcon className="h-5 w-5 sm:h-6 sm:w-6" /><XMarkIcon className="h-3.5 w-3.5 absolute -top-1 -right-1" /></span>

  return (
    <div>
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-center gap-4 mb-3">
          <button onClick={onToggleAudio} className={`${base} p-3.5 ${isAudioEnabled ? neutral : off}`} title={isAudioEnabled ? 'Mute' : 'Unmute'}><AudioIcon /></button>
          <button onClick={onToggleVideo} className={`${base} p-3.5 ${isVideoEnabled ? neutral : off}`} title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>{isVideoEnabled ? <VideoCameraIcon className="h-5 w-5" /> : <VideoCameraSlashIcon className="h-5 w-5" />}</button>
          <button onClick={onLeave} className={`${base} p-3.5 ${off} shadow-tally`} title="Leave"><PhoneXMarkIcon className="h-5 w-5" /></button>
        </div>
        <div className="flex items-center justify-center gap-3">
          {allowScreenShare && <button onClick={onToggleScreenShare} className={`${base} p-2.5 ${isScreenSharing ? live : neutral}`} title="Share screen"><ComputerDesktopIcon className="h-4 w-4" /></button>}
          {isHost && <button onClick={onShowParticipants} className={`${base} p-2.5 ${neutral}`} title="Participants"><UserGroupIcon className="h-4 w-4" /></button>}
          {isHost && onEndMeeting && <button onClick={onEndMeeting} className={`${base} p-2.5 ${danger}`} title="End for everyone"><StopIcon className="h-4 w-4" /></button>}
          <button onClick={onShowSettings} className={`${base} p-2.5 ${neutral}`} title="Settings"><Cog6ToothIcon className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-center gap-3">
        <button onClick={onToggleAudio} className={`${base} p-4 ${isAudioEnabled ? neutral : off}`} title={isAudioEnabled ? 'Mute' : 'Unmute'}><AudioIcon /></button>
        <button onClick={onToggleVideo} className={`${base} p-4 ${isVideoEnabled ? neutral : off}`} title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>{isVideoEnabled ? <VideoCameraIcon className="h-6 w-6" /> : <VideoCameraSlashIcon className="h-6 w-6" />}</button>
        {allowScreenShare && <button onClick={onToggleScreenShare} className={`${base} p-4 ${isScreenSharing ? live : neutral}`} title={isScreenSharing ? 'Stop sharing' : 'Share screen'}><ComputerDesktopIcon className="h-6 w-6" /></button>}
        {isHost && <button onClick={onShowParticipants} className={`${base} p-4 ${neutral}`} title="Participants"><UserGroupIcon className="h-6 w-6" /></button>}
        <button onClick={onShowSettings} className={`${base} p-4 ${neutral}`} title="Settings"><Cog6ToothIcon className="h-6 w-6" /></button>
        {isHost && onEndMeeting && <button onClick={onEndMeeting} className={`${base} p-4 ${danger}`} title="End for everyone"><StopIcon className="h-6 w-6" /></button>}
        <button onClick={onLeave} className={`${base} p-4 ${off} shadow-tally`} title="Leave"><PhoneXMarkIcon className="h-6 w-6" /></button>
      </div>
    </div>
  )
}
