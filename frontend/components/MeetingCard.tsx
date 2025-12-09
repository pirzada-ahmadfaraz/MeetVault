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
  currentUserId?: string
  onJoin: (meetingId: string) => void
  onStart?: (meetingId: string) => void
  onViewDetails?: (meeting: Meeting) => void
  showJoinButton?: boolean
  isActive?: boolean
}

export default function MeetingCard({
  meeting,
  currentUserId,
  onJoin,
  onStart,
  onViewDetails,
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
      return { text: 'Live', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' }
    } else if (meeting.endTime) {
      return { text: 'Ended', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' }
    } else if (meeting.scheduledStartTime && new Date(meeting.scheduledStartTime) > new Date()) {
      return { text: 'Scheduled', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' }
    } else {
      return { text: 'Not started', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' }
    }
  }

  const status = getMeetingStatus()
  const isHost = currentUserId && meeting.host._id === currentUserId
  const canStart = isHost && !meeting.isActive && !meeting.endTime
  const canJoin = meeting.isActive && !meeting.endTime

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 ${isActive ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
            {meeting.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            ID: {meeting.meetingId}
          </p>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* Description */}
      {meeting.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {meeting.description}
        </p>
      )}

      {/* Meeting Details */}
      <div className="space-y-2 mb-4">
        {/* Host */}
        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
          <UserGroupIcon className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
          <span>Host: {meeting.host.firstName} {meeting.host.lastName}</span>
        </div>

        {/* Date/Time */}
        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
          <CalendarIcon className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
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
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <ClockIcon className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
            <span>
              Duration: {Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60))} min
            </span>
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
          <UserGroupIcon className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
          <span>
            {meeting.currentParticipantCount || 0} / {meeting.maxParticipants} participants
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {canStart && onStart && (
          <button
            onClick={() => onStart(meeting.meetingId)}
            className="flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Start Meeting
          </button>
        )}

        {canJoin && showJoinButton && (
          <button
            onClick={() => onJoin(meeting.meetingId)}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
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
                Join Meeting
              </>
            )}
          </button>
        )}

        {!canStart && !canJoin && !meeting.endTime && (
          <div className="flex-1 text-center py-2 px-4 text-sm text-slate-500 dark:text-slate-400">
            {isHost ? 'Ready to start' : 'Not started yet'}
          </div>
        )}

        <button
          onClick={() => onViewDetails?.(meeting)}
          className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  )
}