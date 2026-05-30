'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { meetingAPI } from '@/lib/api'
import { Meeting } from '@/types'
import ProtectedRoute from '@/components/ProtectedRoute'
import MeetingRoom from '@/components/MeetingRoom'
import LoadingSpinner from '@/components/LoadingSpinner'
import { XMarkIcon, SignalSlashIcon } from '@heroicons/react/24/outline'

export default function MeetingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasJoined, setHasJoined] = useState(false)

  const meetingId = params.meetingId as string

  useEffect(() => {
    if (meetingId) {
      try {
        const raw = localStorage.getItem(`meeting-joined-${meetingId}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          const now = Date.now()
          if (parsed && parsed.joined === true && (!parsed.expiresAt || parsed.expiresAt > now)) {
            setHasJoined(true)
          } else if (parsed && parsed.expiresAt && parsed.expiresAt <= now) {
            localStorage.removeItem(`meeting-joined-${meetingId}`)
          }
        }
      } catch {}
      loadMeeting()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId])

  const loadMeeting = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await meetingAPI.getMeeting(meetingId)
      if (response.success) {
        setMeeting(response.data)
        let wasInMeeting = false
        try {
          const raw = localStorage.getItem(`meeting-joined-${meetingId}`)
          if (raw) {
            const parsed = JSON.parse(raw)
            const now = Date.now()
            wasInMeeting = parsed && parsed.joined === true && (!parsed.expiresAt || parsed.expiresAt > now)
          }
        } catch {}
        const isActiveParticipant = response.data.participants.some((p) => p.user._id === user?._id && !p.leftAt)
        setHasJoined(isActiveParticipant || wasInMeeting)
      } else {
        setError(response.message)
      }
    } catch (error: any) {
      console.error('Error loading meeting:', error)
      if (error.response?.status === 404) setError('Meeting not found. Please check the meeting ID.')
      else setError('Failed to load meeting. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinMeeting = async (password?: string) => {
    try {
      const response = await meetingAPI.joinMeeting(meetingId, password ? { password } : {})
      if (response.success) {
        setMeeting(response.data)
        setHasJoined(true)
        const expiresAt = Date.now() + 2 * 60 * 60 * 1000
        localStorage.setItem(`meeting-joined-${meetingId}`, JSON.stringify({ joined: true, expiresAt }))
      } else {
        setError(response.message)
      }
    } catch (error: any) {
      console.error('Error joining meeting:', error)
      if (error?.response?.status === 409 && /already in this meeting/i.test(error?.response?.data?.message || '')) {
        setHasJoined(true)
        const fallbackExpires = Date.now() + 60 * 60 * 1000
        try {
          const raw = localStorage.getItem(`meeting-joined-${meetingId}`)
          if (!raw) localStorage.setItem(`meeting-joined-${meetingId}`, JSON.stringify({ joined: true, expiresAt: fallbackExpires }))
        } catch {}
        return
      }
      setError(error.response?.data?.message || 'Failed to join meeting. Please try again.')
    }
  }

  const handleLeaveMeeting = async () => {
    try {
      await meetingAPI.leaveMeeting(meetingId)
      localStorage.removeItem(`meeting-joined-${meetingId}`)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error leaving meeting:', error)
      localStorage.removeItem(`meeting-joined-${meetingId}`)
      router.push('/dashboard')
    }
  }

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute>
      <div className="grain min-h-screen flex items-center justify-center bg-ink text-fg p-4">{children}</div>
    </ProtectedRoute>
  )

  if (isLoading) {
    return (
      <Shell>
        <div className="text-center">
          <div className="inline-flex items-center gap-2.5 mb-4"><span className="tally-dot" /><span className="mono-label text-[0.55rem] text-muted">Connecting</span></div>
          <LoadingSpinner size="large" />
          <p className="mt-4 text-sm text-muted">Opening the control room…</p>
        </div>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <div className="panel rounded-3xl p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-tally-500/15 border border-tally-500/25 flex items-center justify-center mx-auto mb-4 text-tally-400"><XMarkIcon className="w-7 h-7" /></div>
          <h2 className="font-display text-xl font-bold mb-2">Unable to load room</h2>
          <p className="text-muted text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={loadMeeting} className="btn-live rounded-xl px-5 py-2.5 text-sm font-semibold">Try again</button>
            <button onClick={() => router.push('/dashboard')} className="btn-ghost rounded-xl px-5 py-2.5 text-sm font-medium">Dashboard</button>
          </div>
        </div>
      </Shell>
    )
  }

  if (!meeting) {
    return <Shell><p className="text-muted">Meeting not found</p></Shell>
  }

  if (meeting && !meeting.isActive && meeting.endTime) {
    return (
      <Shell>
        <div className="panel rounded-3xl p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center justify-center mx-auto mb-4 text-faint"><SignalSlashIcon className="w-7 h-7" /></div>
          <h2 className="font-display text-xl font-bold mb-2">This room has ended</h2>
          <p className="text-muted text-sm mb-6">The host ended this meeting. You can head back to your dashboard.</p>
          <button onClick={() => router.push('/dashboard')} className="btn-live rounded-xl px-6 py-3 font-semibold">Go to dashboard</button>
        </div>
      </Shell>
    )
  }

  return (
    <ProtectedRoute>
      <MeetingRoom meeting={meeting} hasJoined={hasJoined} onJoin={handleJoinMeeting} onLeave={handleLeaveMeeting} onError={setError} />
    </ProtectedRoute>
  )
}
