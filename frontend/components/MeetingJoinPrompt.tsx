'use client'

import { useState } from 'react'
import { Meeting } from '@/types'
import { useAuth } from '@/lib/auth-context'
import LoadingSpinner from './LoadingSpinner'
import { VideoCameraIcon, ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline'

interface MeetingJoinPromptProps {
  meeting: Meeting
  onJoin: (password?: string) => Promise<void>
  onCancel: () => void
}

export default function MeetingJoinPrompt({
  meeting,
  onJoin,
  onCancel
}: MeetingJoinPromptProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPasswordField, setShowPasswordField] = useState(meeting.settings?.requirePassword || false)

  const { user } = useAuth()

  // Check if meeting is not started and user is not the host
  const isInactive = !meeting.isActive
  const isHost = user?._id === meeting.host._id

  const handleJoin = async () => {
    setIsLoading(true)
    setError('')

    try {
      await onJoin(showPasswordField ? password : undefined)
    } catch (error: any) {
      console.error('Join meeting error:', error)

      // Check if password is required
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

  // If meeting is inactive and user is not the host, show waiting message
  if (isInactive && !isHost) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Meeting Not Started Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              The host hasn't started "{meeting.title}" yet
            </p>
          </div>

          {/* Meeting Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Meeting:</span>
                <span className="text-gray-900 dark:text-white font-medium">{meeting.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Host:</span>
                <span className="text-gray-900 dark:text-white">
                  {meeting.host.firstName} {meeting.host.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  Waiting to start
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Please wait
                </h3>
                <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  <p>The meeting host will start the meeting soon. You'll be able to join once they start it.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <VideoCameraIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Join Meeting
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            You're about to join "{meeting.title}"
          </p>
        </div>

        {/* Meeting Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Meeting ID:</span>
              <span className="text-gray-900 dark:text-white font-mono">{meeting.meetingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Host:</span>
              <span className="text-gray-900 dark:text-white">
                {meeting.host.firstName} {meeting.host.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Participants:</span>
              <span className="text-gray-900 dark:text-white">
                {meeting.currentParticipantCount || 0} / {meeting.maxParticipants}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Password field (conditional) */}
        {showPasswordField && (
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meeting Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter meeting password"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleJoin()
                }
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <button
            onClick={handleJoin}
            className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading || (showPasswordField && !password.trim())}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Joining...
              </>
            ) : (
              <>
                <VideoCameraIcon className="h-4 w-4 mr-2" />
                Join Meeting
              </>
            )}
          </button>
        </div>

        {/* Meeting Features */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Meeting Features:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center ${meeting.settings?.allowChat ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${meeting.settings?.allowChat ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              Chat {meeting.settings?.allowChat ? 'Enabled' : 'Disabled'}
            </div>
            <div className={`flex items-center ${meeting.settings?.allowScreenShare ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${meeting.settings?.allowScreenShare ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              Screen Share {meeting.settings?.allowScreenShare ? 'Enabled' : 'Disabled'}
            </div>
            <div className={`flex items-center ${meeting.settings?.waitingRoom ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${meeting.settings?.waitingRoom ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              Waiting Room {meeting.settings?.waitingRoom ? 'Enabled' : 'Disabled'}
            </div>
            <div className={`flex items-center ${meeting.settings?.requirePassword ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${meeting.settings?.requirePassword ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              Password {meeting.settings?.requirePassword ? 'Required' : 'Not Required'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}