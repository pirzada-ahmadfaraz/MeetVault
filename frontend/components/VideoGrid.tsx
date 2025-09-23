import { Participant } from '@/services/webrtc'
import VideoTile from './VideoTile'

interface VideoGridProps {
  participants: Participant[]
  localStream: MediaStream | null
  participantStreams: Map<string, MediaStream>
  isVideoEnabled: boolean
  isScreenSharing: boolean
  currentUser: any
}

export default function VideoGrid({
  participants,
  localStream,
  participantStreams,
  isVideoEnabled,
  isScreenSharing,
  currentUser
}: VideoGridProps) {
  // Add current user as a participant for display
  const allParticipants = [
    ...(currentUser ? [{
      id: 'local',
      userId: currentUser._id,
      user: currentUser,
      isHost: false, // This will be updated based on meeting data
      isVideoEnabled,
      isAudioEnabled: true, // This should come from WebRTC state
      isScreenSharing: false,
      stream: localStream
    }] : []),
    ...participants
  ]
  
  // Calculate grid layout based on number of participants
  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-2'
    if (count <= 4) return 'grid-cols-2'
    if (count <= 6) return 'grid-cols-3'
    return 'grid-cols-4'
  }

  const getGridRows = (count: number) => {
    if (count <= 2) return 'grid-rows-1'
    if (count <= 4) return 'grid-rows-2'
    if (count <= 6) return 'grid-rows-2'
    return 'grid-rows-3'
  }

  if (isScreenSharing) {
    // Screen sharing layout: main screen + small participant tiles
    return (
      <div className="h-full flex flex-col space-y-4">
        {/* Main screen sharing area */}
        <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <div className="bg-green-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Screen Share</h3>
            <p className="text-gray-300">Screen sharing content will appear here</p>
          </div>
        </div>

        {/* Small participant tiles */}
        <div className="h-24 flex space-x-2 overflow-x-auto">
          {allParticipants.map((participant) => (
            <div key={participant.id} className="flex-shrink-0 w-32">
              <VideoTile
                participant={participant}
                stream={participant.id === 'local' ? localStream : participantStreams.get(participant.id)}
                isSmall={true}
                showControls={false}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Regular grid layout
  return (
    <div className={`h-full grid gap-4 ${getGridCols(allParticipants.length)} ${getGridRows(allParticipants.length)}`}>
      {allParticipants.map((participant) => (
        <VideoTile
          key={participant.id}
          participant={participant}
          stream={participant.id === 'local' ? localStream : participantStreams.get(participant.id)}
          isSmall={false}
          showControls={true}
        />
      ))}

      {/* Empty state when no participants */}
      {allParticipants.length === 0 && (
        <div className="col-span-full flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No participants yet</h3>
            <p className="text-gray-500">Waiting for participants to join the meeting</p>
          </div>
        </div>
      )}
    </div>
  )
}