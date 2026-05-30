import { Meeting } from '@/types'
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon,
  PlayIcon,
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
  meeting, currentUserId, onJoin, onStart, onViewDetails, showJoinButton = false, isActive = false,
}: MeetingCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date set'
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getMeetingStatus = () => {
    if (meeting.isActive) return { text: 'Live', cls: 'border-tally-500/30 bg-tally-500/10 text-tally-300', live: true }
    if (meeting.endTime) return { text: 'Ended', cls: 'border-white/10 bg-white/5 text-faint', live: false }
    if (meeting.scheduledStartTime && new Date(meeting.scheduledStartTime) > new Date()) return { text: 'Scheduled', cls: 'border-lime-500/25 bg-lime-500/10 text-lime-300', live: false }
    return { text: 'Standby', cls: 'border-amber-500/25 bg-amber-500/10 text-amber-300', live: false }
  }

  const status = getMeetingStatus()
  const isHost = currentUserId && meeting.host._id === currentUserId
  const canStart = isHost && !meeting.isActive && !meeting.endTime
  const canJoin = meeting.isActive && !meeting.endTime

  return (
    <div className={`panel panel-hover rounded-2xl p-5 ${isActive ? 'border-tally-500/40' : ''}`}>
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold truncate">{meeting.title}</h3>
          <p className="mono-label text-[0.45rem] text-faint mt-1.5">ID · {meeting.meetingId}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 mono-label text-[0.45rem] ${status.cls}`}>
          {status.live && <span className="tally-dot" />}
          {status.text}
        </span>
      </div>

      {meeting.description && <p className="text-sm text-muted mb-4 line-clamp-2">{meeting.description}</p>}

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-xs text-muted">
          <UserGroupIcon className="h-3.5 w-3.5 text-faint" />
          <span>Host: {meeting.host.firstName} {meeting.host.lastName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <CalendarIcon className="h-3.5 w-3.5 text-faint" />
          <span>{meeting.startTime ? `Started ${formatDate(meeting.startTime)}` : meeting.scheduledStartTime ? `Scheduled ${formatDate(meeting.scheduledStartTime)}` : 'Not scheduled'}</span>
        </div>
        {meeting.startTime && meeting.endTime && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <ClockIcon className="h-3.5 w-3.5 text-faint" />
            <span>Duration {Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / 60000)} min</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted">
          <UserGroupIcon className="h-3.5 w-3.5 text-faint" />
          <span className="tabular-nums">{meeting.currentParticipantCount || 0} / {meeting.maxParticipants} connected</span>
        </div>
      </div>

      <div className="flex gap-2">
        {canStart && onStart && (
          <button onClick={() => onStart(meeting.meetingId)} className="btn-live flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm">
            <PlayIcon className="h-4 w-4" /> Start
          </button>
        )}
        {canJoin && showJoinButton && (
          <button onClick={() => onJoin(meeting.meetingId)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-tally-500 text-white hover:brightness-110 shadow-tally' : 'btn-live'}`}>
            {isActive ? <><PlayIcon className="h-4 w-4" /> Join live</> : <><VideoCameraIcon className="h-4 w-4" /> Join</>}
          </button>
        )}
        {!canStart && !canJoin && !meeting.endTime && (
          <div className="flex-1 text-center py-2.5 mono-label text-[0.5rem] text-faint">{isHost ? 'Ready to start' : 'Not started yet'}</div>
        )}
        <button onClick={() => onViewDetails?.(meeting)} className="btn-ghost px-4 py-2.5 rounded-xl text-sm font-medium">Details</button>
      </div>
    </div>
  )
}
