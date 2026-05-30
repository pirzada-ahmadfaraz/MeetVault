'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { meetingAPI } from '@/lib/api'
import { Meeting } from '@/types'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import CreateMeetingModal from '@/components/CreateMeetingModal'
import MeetingCard from '@/components/MeetingCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  PlusIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function MeetingsPage() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [activeMeetings, setActiveMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadMeetings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const loadMeetings = async () => {
    try {
      setIsLoading(true)
      setError('')
      const [recentMeetingsResponse, activeMeetingsResponse] = await Promise.all([
        meetingAPI.getUserMeetings(1, 20, statusFilter),
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
    setMeetings((prev) => [newMeeting, ...prev])
    setIsCreateModalOpen(false)
  }

  const handleJoinMeeting = (meetingId: string) => {
    window.open(`/meeting/${meetingId}`, '_blank')
  }

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.meetingId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filters = ['all', 'upcoming', 'active', 'completed']

  return (
    <ProtectedRoute>
      <div className="grain min-h-screen bg-ink text-fg">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-extrabold">Meetings</h1>
              <p className="text-muted mt-1.5">Every room you've hosted or joined, in one place.</p>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-live rounded-xl px-5 py-3 font-semibold flex items-center justify-center gap-2 w-full sm:w-auto">
              <PlusIcon className="h-4 w-4" /> New room
            </button>
          </div>

          {/* Search + filters */}
          <div className="panel rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
              <input type="text" placeholder="Search by title or room ID…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="field pl-10 pr-4 py-2.5 text-sm" />
            </div>
            <div className="flex items-center rounded-xl border border-white/8 bg-white/[0.02] p-1">
              {filters.map((f) => (
                <button key={f} onClick={() => setStatusFilter(f)} className={`px-3 py-2 rounded-lg mono-label text-[0.5rem] transition-all ${statusFilter === f ? 'bg-lime-sheen text-[#11160a]' : 'text-faint hover:text-fg'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Active */}
          {activeMeetings.length > 0 && (
            <div className="mb-9">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="tally-dot" />
                <h2 className="font-display text-xl font-bold">Live now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMeetings.map((meeting) => (
                  <MeetingCard key={meeting._id} meeting={meeting} currentUserId={user?._id} onJoin={() => handleJoinMeeting(meeting.meetingId)} showJoinButton isActive />
                ))}
              </div>
            </div>
          )}

          {/* All */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4 capitalize">{statusFilter === 'all' ? 'All meetings' : `${statusFilter} meetings`}</h2>
            {isLoading ? (
              <div className="flex justify-center py-16"><LoadingSpinner size="large" /></div>
            ) : error ? (
              <div className="panel rounded-2xl p-5 border-tally-500/30 text-center">
                <p className="text-tally-300 text-sm mb-3">{error}</p>
                <button onClick={loadMeetings} className="btn-live rounded-xl px-5 py-2.5 text-sm font-semibold">Try again</button>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="panel rounded-2xl text-center py-16">
                <div className="w-14 h-14 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-faint mx-auto mb-4">
                  <VideoCameraIcon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold mb-1.5">{searchQuery ? 'No matches' : 'No meetings yet'}</h3>
                <p className="text-muted text-sm mb-5">{searchQuery ? 'Try a different search or filter.' : 'Create your first room to get started.'}</p>
                {!searchQuery && <button onClick={() => setIsCreateModalOpen(true)} className="btn-live rounded-xl px-6 py-3 font-semibold">Create room</button>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMeetings.map((meeting) => (
                  <MeetingCard key={meeting._id} meeting={meeting} currentUserId={user?._id} onJoin={() => handleJoinMeeting(meeting.meetingId)} showJoinButton={meeting.isActive} />
                ))}
              </div>
            )}
          </div>
        </main>

        <CreateMeetingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onMeetingCreated={handleMeetingCreated} />
      </div>
    </ProtectedRoute>
  )
}
