'use client'

import { useState } from 'react'
import { Meeting } from '@/types'
import { useAuth } from '@/lib/auth-context'
import LoadingSpinner from './LoadingSpinner'
import { VideoCameraIcon, ArrowLeftIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface MeetingJoinPromptProps {
  meeting: Meeting
  onJoin: (password?: string) => Promise<void>
  onCancel: () => void
}

export default function MeetingJoinPrompt({ meeting, onJoin, onCancel }: MeetingJoinPromptProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPasswordField, setShowPasswordField] = useState(meeting.settings?.requirePassword || false)

  const { user } = useAuth()
  const isInactive = !meeting.isActive
  const isHost = user?._id === meeting.host._id

  const handleJoin = async () => {
    setIsLoading(true)
    setError('')
    try {
      await onJoin(showPasswordField ? password : undefined)
    } catch (error: any) {
      console.error('Join meeting error:', error)
      if (error.response?.data?.message?.includes('password') || error.message?.includes('password')) {
        setShowPasswordField(true)
        setError('This meeting requires a password')
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to join meeting. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const Row = ({ label, value, valueClass = 'text-fg' }: { label: string; value: React.ReactNode; valueClass?: string }) => (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  )

  if (isInactive && !isHost) {
    return (
      <div className="grain min-h-screen bg-ink text-fg flex items-center justify-center p-4">
        <div className="max-w-md w-full panel rounded-3xl p-7">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-4 text-amber-300">
              <ClockIcon className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl font-bold">Not started yet</h2>
            <p className="text-muted mt-1.5 text-sm">The host hasn't started "{meeting.title}" yet.</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4 mb-5 space-y-2">
            <Row label="Meeting" value={meeting.title} />
            <Row label="Host" value={`${meeting.host.firstName} ${meeting.host.lastName}`} />
            <Row label="Status" value="Waiting to start" valueClass="text-amber-300" />
          </div>

          <div className="rounded-2xl border border-lime-500/20 bg-lime-500/[0.05] p-4 mb-6 flex gap-3">
            <ClockIcon className="h-5 w-5 text-lime-300 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-lime-200/80 leading-relaxed">The host will start the meeting soon. You'll be able to join the moment they go live.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-ghost flex-1 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2"><ArrowLeftIcon className="h-4 w-4" /> Go back</button>
            <button onClick={() => window.location.reload()} className="btn-live flex-1 rounded-xl py-2.5 text-sm flex items-center justify-center gap-2"><ArrowPathIcon className="h-4 w-4" /> Refresh</button>
          </div>
        </div>
      </div>
    )
  }

  const features = [
    { label: 'Chat', on: meeting.settings?.allowChat },
    { label: 'Screen share', on: meeting.settings?.allowScreenShare },
    { label: 'Waiting room', on: !meeting.settings?.waitingRoom },
    { label: 'Open access', on: !meeting.settings?.requirePassword },
  ]

  return (
    <div className="grain min-h-screen bg-ink text-fg flex items-center justify-center p-4">
      <div className="max-w-md w-full panel rounded-3xl p-7">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-lime-sheen flex items-center justify-center mx-auto mb-4 text-[#11160a]">
            <VideoCameraIcon className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-bold">Join room</h2>
          <p className="text-muted mt-1.5 text-sm">You're about to join "{meeting.title}".</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4 mb-5 space-y-2">
          <Row label="Room ID" value={<span className="font-mono">{meeting.meetingId}</span>} />
          <Row label="Host" value={`${meeting.host.firstName} ${meeting.host.lastName}`} />
          <Row label="Connected" value={<span className="tabular-nums">{meeting.currentParticipantCount || 0} / {meeting.maxParticipants}</span>} />
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-tally-500/30 bg-tally-500/10 p-3">
            <p className="text-sm text-tally-300">{error}</p>
          </div>
        )}

        {showPasswordField && (
          <div className="mb-5">
            <label htmlFor="password" className="mono-label text-[0.5rem] text-faint block mb-2">Meeting password</label>
            <input
              type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="field px-3.5 py-3 text-sm" placeholder="Enter meeting password" disabled={isLoading}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) handleJoin() }}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={isLoading} className="btn-ghost flex-1 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2"><ArrowLeftIcon className="h-4 w-4" /> Back</button>
          <button onClick={handleJoin} disabled={isLoading || (showPasswordField && !password.trim())} className="btn-live flex-1 rounded-xl py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? (<><LoadingSpinner size="small" className="mr-1" /> Joining…</>) : (<><VideoCameraIcon className="h-4 w-4" /> Join</>)}
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-white/8">
          <h4 className="mono-label text-[0.5rem] text-faint mb-3">Room features</h4>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {features.map((f) => (
              <div key={f.label} className={`flex items-center gap-2 ${f.on ? 'text-lime-300' : 'text-faint'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${f.on ? 'bg-lime-400' : 'bg-faint'}`} />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
