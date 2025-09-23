'use client'

import { useState } from 'react'
import { Meeting } from '@/types'
import { 
  VideoCameraIcon,
  LockClosedIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

interface JoinMeetingModalProps {
  meeting: Meeting
  onJoin: (password?: string) => Promise<void>
  onCancel: () => void
}

export default function JoinMeetingModal({ 
  meeting, 
  onJoin, 
  onCancel 
}: JoinMeetingModalProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await onJoin(meeting.settings.requirePassword ? password : undefined)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to join meeting')
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Meeting Info */}
          <div className="text-center mb-8">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <VideoCameraIcon className="h-8 w-8 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {meeting.title}
            </h1>
            
            {meeting.description && (
              <p className="text-gray-600 mb-4">
                {meeting.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <UserGroupIcon className="h-4 w-4" />
                <span>Host: {meeting.host.firstName} {meeting.host.lastName}</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {meeting.startTime 
                    ? `Started: ${formatDate(meeting.startTime)}`
                    : meeting.scheduledStartTime
                    ? `Scheduled: ${formatDate(meeting.scheduledStartTime)}`
                    : 'Not scheduled'
                  }
                </span>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <UserGroupIcon className="h-4 w-4" />
                <span>
                  {meeting.currentParticipantCount || 0} / {meeting.maxParticipants} participants
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            {meeting.isActive ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-800 font-medium">Meeting is live</span>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-yellow-800 font-medium">Meeting not started</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Join Form */}
          <form onSubmit={handleJoin} className="space-y-4">
            {meeting.settings.requirePassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  <LockClosedIcon className="h-4 w-4 inline mr-1" />
                  Meeting Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter meeting password"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                disabled={isLoading || (meeting.settings.requirePassword && !password)}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Joining...
                  </>
                ) : (
                  'Join Meeting'
                )}
              </button>
            </div>
          </form>

          {/* Meeting Settings Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Meeting Features</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className={meeting.settings.allowChat ? 'text-green-600' : 'text-gray-400'}>
                Chat: {meeting.settings.allowChat ? 'Enabled' : 'Disabled'}
              </div>
              <div className={meeting.settings.allowScreenShare ? 'text-green-600' : 'text-gray-400'}>
                Screen Share: {meeting.settings.allowScreenShare ? 'Enabled' : 'Disabled'}
              </div>
              <div className={meeting.settings.waitingRoom ? 'text-yellow-600' : 'text-gray-400'}>
                Waiting Room: {meeting.settings.waitingRoom ? 'Enabled' : 'Disabled'}
              </div>
              <div className={meeting.settings.muteParticipantsOnEntry ? 'text-yellow-600' : 'text-gray-400'}>
                Auto Mute: {meeting.settings.muteParticipantsOnEntry ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}