import { Meeting } from '@/types'
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface MeetingCardProps {
  meeting: Meeting
  onJoin: (meetingId: string) => void
  showJoinButton?: boolean
  isActive?: boolean
}

export default function MeetingCard({ 
  meeting, 
  onJoin, 
  showJoinButton = false,
  isActive = false 
}: MeetingCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMeetingStatus = () => {
    if (meeting.isActive) {
      return { text: 'Live', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' }
    } else if (meeting.endTime) {
      return { text: 'Ended', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' }
    } else if (meeting.scheduledStartTime && new Date(meeting.scheduledStartTime) > new Date()) {
      return { text: 'Scheduled', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' }
    } else {
      return { text: 'Not started', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' }
    }
  }

  const status = getMeetingStatus()

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md dark:hover:shadow-lg transition-all duration-300 ${isActive ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {meeting.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ID: {meeting.meetingId}
          </p>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* Description */}
      {meeting.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {meeting.description}
        </p>
      )}

      {/* Meeting Details */}
      <div className="space-y-2 mb-4">
        {/* Host */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
          <span>Host: {meeting.host.firstName} {meeting.host.lastName}</span>
        </div>

        {/* Date/Time */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
          <span>
            {meeting.startTime
              ? `Started: ${formatDate(meeting.startTime)}`
              : meeting.scheduledStartTime
              ? `Scheduled: ${formatDate(meeting.scheduledStartTime)}`
              : 'Not scheduled'
            }
          </span>
        </div>

        {/* Duration */}
        {meeting.startTime && meeting.endTime && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <ClockIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
            <span>
              Duration: {Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60))} min
            </span>
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
          <span>
            {meeting.currentParticipantCount || 0} / {meeting.maxParticipants} participants
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {showJoinButton && (
          <button
            onClick={() => onJoin(meeting.meetingId)}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isActive ? (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Join Live
              </>
            ) : (
              <>
                <VideoCameraIcon className="h-4 w-4 mr-2" />
                Join
              </>
            )}
          </button>
        )}
        
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Details
        </button>
      </div>
    </div>
  )
}