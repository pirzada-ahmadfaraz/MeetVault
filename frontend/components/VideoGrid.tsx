import { Participant } from '@/services/webrtc'
import VideoTile from './VideoTile'
import { ComputerDesktopIcon, VideoCameraIcon } from '@heroicons/react/24/outline'

interface VideoGridProps {
  participants: Participant[]
  localStream: MediaStream | null
  participantStreams: Map<string, MediaStream>
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  currentUser: any
  speakingParticipants?: Set<string>
  screenSharingParticipants?: Set<string>
}

export default function VideoGrid({
  participants,
  localStream,
  participantStreams,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  currentUser,
  speakingParticipants = new Set(),
  screenSharingParticipants = new Set(),
}: VideoGridProps) {
  const allParticipants: Participant[] = [
    ...(currentUser ? [{
      id: 'local',
      userId: currentUser._id,
      user: currentUser,
      isHost: false,
      isVideoEnabled,
      isAudioEnabled,
      isScreenSharing: false,
      stream: localStream,
    } as Participant] : []),
    ...participants,
  ]

  const getGridClasses = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2'
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2'
    if (count <= 6) return 'grid-cols-2 sm:grid-cols-3'
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  }

  const getGridRowClasses = (count: number) => {
    if (count <= 2) return 'grid-rows-2 sm:grid-rows-1'
    if (count <= 4) return 'grid-rows-4 sm:grid-rows-2'
    if (count <= 6) return 'grid-rows-3 sm:grid-rows-2'
    return 'grid-rows-4 sm:grid-rows-3'
  }

  const screenSharingUser = allParticipants.find((p) => screenSharingParticipants.has(p.id))

  if (screenSharingUser) {
    const screenStream = screenSharingUser.id === 'local' ? localStream : participantStreams.get(screenSharingUser.id)
    return (
      <div className="h-full flex flex-col gap-2 sm:gap-4">
        <div className="flex-1 bg-ink rounded-2xl overflow-hidden relative border border-white/8">
          {screenStream ? (
            <video
              autoPlay
              playsInline
              muted={screenSharingUser.id === 'local'}
              className="w-full h-full object-contain"
              ref={(video) => { if (video && screenStream) video.srcObject = screenStream }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-lime-500/15 border border-lime-500/25 flex items-center justify-center mx-auto mb-4 text-lime-300">
                  <ComputerDesktopIcon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-fg mb-1">Screen share</h3>
                <p className="text-sm text-muted">{screenSharingUser.user.firstName} is sharing their screen</p>
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-black/55 backdrop-blur-sm border border-white/10 px-2.5 py-1">
            <span className="live-dot" />
            <span className="mono-label text-[0.45rem] text-fg">{screenSharingUser.user.firstName} · sharing</span>
          </div>
        </div>

        <div className="h-16 sm:h-24 flex gap-2 overflow-x-auto pb-1">
          {allParticipants.map((participant) => (
            <div key={participant.id} className="flex-shrink-0 w-24 sm:w-32">
              <VideoTile
                participant={participant}
                stream={participant.id === 'local' ? localStream : participantStreams.get(participant.id)}
                isSmall
                showControls={false}
                isSpeaking={speakingParticipants.has(participant.id)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full max-h-full grid gap-2 sm:gap-3 ${getGridClasses(allParticipants.length)} ${getGridRowClasses(allParticipants.length)} items-center justify-items-stretch`}>
      {allParticipants.map((participant) => (
        <div key={participant.id} className="w-full aspect-video">
          <VideoTile
            participant={participant}
            stream={participant.id === 'local' ? localStream : participantStreams.get(participant.id)}
            isSmall={false}
            showControls
            isSpeaking={speakingParticipants.has(participant.id)}
          />
        </div>
      ))}

      {allParticipants.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-full">
          <div className="text-center px-4">
            <div className="w-14 h-14 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-faint mx-auto mb-4">
              <VideoCameraIcon className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-fg mb-1">No one here yet</h3>
            <p className="mono-label text-[0.5rem] text-faint">Waiting for participants to join</p>
          </div>
        </div>
      )}
    </div>
  )
}
