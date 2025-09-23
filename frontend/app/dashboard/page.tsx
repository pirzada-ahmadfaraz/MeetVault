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
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [activeMeetings, setActiveMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Load recent meetings and active meetings in parallel
      const [recentMeetingsResponse, activeMeetingsResponse] = await Promise.all([
        meetingAPI.getUserMeetings(1, 6, 'all'),
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
    setMeetings(prev => [newMeeting, ...prev.slice(0, 5)])
    setIsCreateModalOpen(false)
  }

  const handleJoinMeeting = (meetingId: string) => {
    window.open(`/meeting/${meetingId}`, '_blank')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Start a new meeting or join an existing one to get connected.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Create Meeting */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <PlusIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Start New Meeting
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Create an instant meeting and invite others to join.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Meeting
              </button>
            </div>

            {/* Join Meeting */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <VideoCameraIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Join Meeting
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Enter a meeting ID to join an existing meeting.
              </p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                Join Meeting
              </button>
            </div>

            {/* Schedule Meeting */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Schedule Meeting
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Plan a meeting for later and send invites to participants.
              </p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                Schedule
              </button>
            </div>
          </div>

          {/* Active Meetings */}
          {activeMeetings.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <UserGroupIcon className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Meetings</h2>
                <span className="ml-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium px-2 py-1 rounded-full">
                  LIVE
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting._id}
                    meeting={meeting}
                    onJoin={handleJoinMeeting}
                    showJoinButton={true}
                    isActive={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Meetings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Meetings</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={loadMeetings}
                  className="mt-2 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : meetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.map((meeting) => (
                  <MeetingCard
                    key={meeting._id}
                    meeting={meeting}
                    onJoin={handleJoinMeeting}
                    showJoinButton={meeting.isActive}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <VideoCameraIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No meetings yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Start your first meeting to begin collaborating with your team.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Your First Meeting
                </button>
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