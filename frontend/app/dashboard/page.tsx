'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { meetingAPI } from '@/lib/api'
import { Meeting } from '@/types'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import CreateMeetingModal from '@/components/CreateMeetingModal'
import MeetingCard from '@/components/MeetingCard'
import MeetingDetailsModal from '@/components/MeetingDetailsModal'
import MeetingSuccessModal from '@/components/MeetingSuccessModal'
import JoinMeetingModal from '@/components/JoinMeetingModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  PlusIcon,
  VideoCameraIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [activeMeetings, setActiveMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = async () => {
    try {
      setIsLoading(true)
      setError('')
      const [recentMeetingsResponse, activeMeetingsResponse] = await Promise.all([
        meetingAPI.getUserMeetings(1, 6, 'all'),
        meetingAPI.getActiveMeetings(),
      ])
      if (recentMeetingsResponse.success) setMeetings(recentMeetingsResponse.data)
      if (activeMeetingsResponse.success) setActiveMeetings(activeMeetingsResponse.data)
    } catch (error: any) {
      console.error('Error loading meetings:', error)
      setError('Failed to load meetings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMeetingCreated = (newMeeting: Meeting) => {
    setMeetings((prev) => [newMeeting, ...prev.slice(0, 5)])
    setSelectedMeeting(newMeeting)
    setIsCreateModalOpen(false)
    setIsSuccessModalOpen(true)
  }

  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setIsDetailsModalOpen(true)
  }

  const handleStartMeeting = async (meetingId: string) => {
    try {
      setIsSuccessModalOpen(false)
      const response = await meetingAPI.startMeeting(meetingId)
      if (response.success) {
        setMeetings((prev) => prev.map((m) => (m.meetingId === meetingId ? response.data : m)))
        handleJoinMeeting(meetingId)
      } else {
        setError(response.message)
      }
    } catch (error: any) {
      console.error('Error starting meeting:', error)
      setError('Failed to start meeting. Please try again.')
    }
  }

  const handleJoinMeeting = (meetingId: string) => {
    window.open(`/meeting/${meetingId}`, '_blank')
  }

  const handleJoinByMeetingId = async (meetingId: string, password?: string) => {
    try {
      const response = await meetingAPI.joinMeeting(meetingId, password ? { password } : {})
      if (response.success) window.open(`/meeting/${meetingId}`, '_blank')
      else throw new Error(response.message)
    } catch (error: any) {
      console.error('Error joining meeting:', error)
      throw error
    }
  }

  const quickActions = [
    { icon: PlusIcon, title: 'Start a room', body: 'Spin up an instant room and invite people in.', cta: 'New room', onClick: () => setIsCreateModalOpen(true), primary: true },
    { icon: VideoCameraIcon, title: 'Join a room', body: 'Enter a room ID to hop into an existing call.', cta: 'Join', onClick: () => setIsJoinModalOpen(true), primary: false },
    { icon: ClockIcon, title: 'Schedule', body: 'Plan ahead and line up a room for later.', cta: 'Schedule', onClick: () => setIsCreateModalOpen(true), primary: false },
  ]

  return (
    <ProtectedRoute>
      <div className="grain min-h-screen bg-ink text-fg">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="mb-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/25 bg-lime-500/[0.06] px-3 py-1.5 mb-4">
              <span className="live-dot" />
              <span className="mono-label text-[0.5rem] text-lime-300">On air · Studio ready</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold">Welcome back, {user?.firstName}.</h1>
            <p className="text-muted mt-2">Start a room or jump into an existing one — your control room is ready.</p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {quickActions.map((a) => (
              <div key={a.title} className="panel panel-hover rounded-2xl p-6 flex flex-col">
                <div className="w-11 h-11 rounded-xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-lime-400 mb-5">
                  <a.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold mb-1.5">{a.title}</h3>
                <p className="text-sm text-muted mb-5 flex-1">{a.body}</p>
                <button onClick={a.onClick} className={`${a.primary ? 'btn-live' : 'btn-ghost'} w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 group`}>
                  {a.cta} <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>

          {/* Active meetings */}
          {activeMeetings.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="tally-dot" />
                <h2 className="font-display text-xl font-bold">Live now</h2>
                <span className="mono-label text-[0.45rem] text-tally-300 border border-tally-500/30 bg-tally-500/10 rounded-full px-2 py-0.5">On air</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMeetings.map((meeting) => (
                  <MeetingCard key={meeting._id} meeting={meeting} currentUserId={user?._id} onJoin={handleJoinMeeting} onStart={handleStartMeeting} onViewDetails={handleViewDetails} showJoinButton isActive />
                ))}
              </div>
            </div>
          )}

          {/* Recent meetings */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4">Recent rooms</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><LoadingSpinner size="large" /></div>
            ) : error ? (
              <div className="panel rounded-2xl p-5 border-tally-500/30">
                <p className="text-tally-300 text-sm">{error}</p>
                <button onClick={loadMeetings} className="mono-label text-[0.55rem] text-lime-400 hover:text-lime-300 mt-2">Try again</button>
              </div>
            ) : meetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.map((meeting) => (
                  <MeetingCard key={meeting._id} meeting={meeting} currentUserId={user?._id} onJoin={handleJoinMeeting} onStart={handleStartMeeting} onViewDetails={handleViewDetails} showJoinButton={meeting.isActive} />
                ))}
              </div>
            ) : (
              <div className="panel rounded-2xl text-center py-16">
                <div className="w-14 h-14 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-faint mx-auto mb-4">
                  <VideoCameraIcon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold mb-1.5">No rooms yet</h3>
                <p className="text-muted text-sm mb-5">Start your first room to begin collaborating.</p>
                <button onClick={() => setIsCreateModalOpen(true)} className="btn-live rounded-xl px-6 py-3 font-semibold">Create your first room</button>
              </div>
            )}
          </div>
        </main>

        <CreateMeetingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onMeetingCreated={handleMeetingCreated} />
        <MeetingDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} meeting={selectedMeeting} onJoin={handleJoinMeeting} />
        <MeetingSuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} meeting={selectedMeeting} onJoinNow={handleStartMeeting} />
        <JoinMeetingModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onJoin={handleJoinByMeetingId} />
      </div>
    </ProtectedRoute>
  )
}
