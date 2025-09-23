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
  CalendarIcon,
  ClockIcon
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
  }, [statusFilter])

  const loadMeetings = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Load meetings based on filter
      const [recentMeetingsResponse, activeMeetingsResponse] = await Promise.all([
        meetingAPI.getUserMeetings(1, 20, statusFilter),
        meetingAPI.getActiveMeetings()
      ])

      if (recentMeetingsResponse.success) {
        setMeetings(recentMeetingsResponse.data)
      }

      if (activeMeetingsResponse.success) {
        setActiveMeetings(activeMeetingsResponse.data)
      }
    } catch (error: any) {
      console.error('Error loading meetings:', error)
      setError('Failed to load meetings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMeetingCreated = (newMeeting: Meeting) => {
    setMeetings(prev => [newMeeting, ...prev])
    setIsCreateModalOpen(false)
  }

  const handleJoinMeeting = (meetingId: string) => {
    window.open(`/meeting/${meetingId}`, '_blank')
  }

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.meetingId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meetings</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Manage all your meetings in one place.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Meeting
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-300">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="all" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">All Meetings</option>
                <option value="upcoming" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Upcoming</option>
                <option value="completed" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Completed</option>
                <option value="active" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Active</option>
              </select>
            </div>
          </div>

          {/* Active Meetings */}
          {activeMeetings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full mr-3 animate-pulse"></div>
                Active Meetings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting._id}
                    meeting={meeting}
                    onJoin={() => handleJoinMeeting(meeting._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Meetings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
              {statusFilter === 'all' ? 'All Meetings' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Meetings`}
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                <button
                  onClick={loadMeetings}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="text-center py-12">
                <VideoCameraIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No meetings found' : 'No meetings yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first meeting to get started.'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Meeting
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting._id}
                    meeting={meeting}
                    onJoin={() => handleJoinMeeting(meeting._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Create Meeting Modal */}
        <CreateMeetingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onMeetingCreated={handleMeetingCreated}
        />
      </div>
    </ProtectedRoute>
  )
}