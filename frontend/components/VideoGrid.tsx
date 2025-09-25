import { Participant } from '@/services/webrtc'
import VideoTile from './VideoTile'

interface VideoGridProps {
  participants: Participant[]
  localStream: MediaStream | null
  participantStreams: Map<string, MediaStream>
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  currentUser: any
  speakingParticipants?: Set<string>
}

export default function VideoGrid({
  participants,
  localStream,
  participantStreams,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  currentUser,
  speakingParticipants = new Set()
}: VideoGridProps) {
  // Add current user as a participant for display
  const allParticipants: Participant[] = [
    ...(currentUser ? [{
      id: 'local',
      userId: currentUser._id,
      user: currentUser,
      isHost: false, // This will be updated based on meeting data
      isVideoEnabled,
      isAudioEnabled: isAudioEnabled,
      isScreenSharing: false,
      stream: localStream
    } as Participant] : []),
    ...participants
  ]

  // Only log when participants actually change
  if (process.env.NODE_ENV === 'development') {
    console.log('VideoGrid: Rendering with', allParticipants.length, 'participants')
  }
  
  // Calculate grid layout based on number of participants (Mobile-first responsive)
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

  if (isScreenSharing) {
    // Screen sharing layout: main screen + small participant tiles (mobile-optimized)
    return (
      <div className="h-full flex flex-col space-y-2 sm:space-y-4">
        {/* Main screen sharing area */}
        <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="bg-green-600 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Screen Share</h3>
            <p className="text-gray-300 text-sm">Screen sharing content will appear here</p>
          </div>
        </div>

        {/* Small participant tiles */}
        <div className="h-16 sm:h-24 flex space-x-2 overflow-x-auto pb-2">
          {allParticipants.map((participant) => (
            <div key={participant.id} className="flex-shrink-0 w-24 sm:w-32">
              <VideoTile
                participant={participant}
                stream={participant.id === 'local' ? localStream : participantStreams.get(participant.id)}
                isSmall={true}
                showControls={false}
                isSpeaking={speakingParticipants.has(participant.id)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Regular grid layout (mobile-optimized)
  return (
    <div className={`h-full max-h-full grid gap-2 sm:gap-4 ${getGridClasses(allParticipants.length)} ${getGridRowClasses(allParticipants.length)} items-center justify-items-stretch`}>
      {allParticipants.map((participant) => (
        <div key={participant.id} className="w-full aspect-video">
          <VideoTile
            participant={participant}
            stream={participant.id === 'local' ? localStream : participantStreams.get(participant.id)}
            isSmall={false}
            showControls={true}
            isSpeaking={speakingParticipants.has(participant.id)}
          />
        </div>
      ))}

      {/* Empty state when no participants */}
      {allParticipants.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-full">
          <div className="text-center text-gray-400 px-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No participants yet</h3>
            <p className="text-gray-500 text-sm sm:text-base">Waiting for participants to join the meeting</p>
          </div>
        </div>
      )}
    </div>
  )
}