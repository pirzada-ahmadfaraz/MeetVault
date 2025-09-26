'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { meetingAPI } from '@/lib/api'
import { Meeting } from '@/types'
import ProtectedRoute from '@/components/ProtectedRoute'
import MeetingRoom from '@/components/MeetingRoom'
import LoadingSpinner from '@/components/LoadingSpinner'

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
      // Check persisted join state across tabs with TTL
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
  }, [meetingId])

  const loadMeeting = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await meetingAPI.getMeeting(meetingId)
      
      if (response.success) {
        setMeeting(response.data)
        
        // Check if user is already a participant or was previously in the meeting
        let wasInMeeting = false
        try {
          const raw = localStorage.getItem(`meeting-joined-${meetingId}`)
          if (raw) {
            const parsed = JSON.parse(raw)
            const now = Date.now()
            wasInMeeting = parsed && parsed.joined === true && (!parsed.expiresAt || parsed.expiresAt > now)
          }
        } catch {}
        const isActiveParticipant = response.data.participants.some(
          p => p.user._id === user?._id && !p.leftAt
        )

        // User has joined if they're an active participant OR if they were previously in the meeting (refresh case)
        setHasJoined(isActiveParticipant || wasInMeeting)
      } else {
        setError(response.message)
      }
    } catch (error: any) {
      console.error('Error loading meeting:', error)
      if (error.response?.status === 404) {
        setError('Meeting not found. Please check the meeting ID.')
      } else {
        setError('Failed to load meeting. Please try again.')
      }
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
        // Persist join across reloads/tabs with TTL (2 hours)
        const expiresAt = Date.now() + 2 * 60 * 60 * 1000
        localStorage.setItem(`meeting-joined-${meetingId}`, JSON.stringify({ joined: true, expiresAt }))
      } else {
        setError(response.message)
      }
    } catch (error: any) {
      console.error('Error joining meeting:', error)
      // Treat duplicate join as success for refresh/new tab flows
      if (error?.response?.status === 409 && /already in this meeting/i.test(error?.response?.data?.message || '')) {
        setHasJoined(true)
        // Set a short TTL if we didn't have one yet
        const fallbackExpires = Date.now() + 60 * 60 * 1000
        try {
          const raw = localStorage.getItem(`meeting-joined-${meetingId}`)
          if (!raw) {
            localStorage.setItem(`meeting-joined-${meetingId}`, JSON.stringify({ joined: true, expiresAt: fallbackExpires }))
          }
        } catch {}
        return
      }
      setError(error.response?.data?.message || 'Failed to join meeting. Please try again.')
    }
  }

  const handleLeaveMeeting = async () => {
    try {
      await meetingAPI.leaveMeeting(meetingId)
      // Clear persisted state when user explicitly leaves
      localStorage.removeItem(`meeting-joined-${meetingId}`)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error leaving meeting:', error)
      // Even if API call fails, clear persisted state and redirect
      localStorage.removeItem(`meeting-joined-${meetingId}`)
      router.push('/dashboard')
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <LoadingSpinner size="large" className="text-white" />
            <p className="mt-4 text-white">Loading meeting...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-md">
            <div className="bg-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Unable to load meeting</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={loadMeeting}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!meeting) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <p className="text-white">Meeting not found</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // If meeting is ended, show ended message instead of room
  if (meeting && !meeting.isActive && meeting.endTime) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-md">
            <div className="bg-gray-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">This meeting has ended</h2>
            <p className="text-gray-300 mb-6">The host has ended this meeting. You can return to your dashboard.</p>
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <MeetingRoom
        meeting={meeting}
        hasJoined={hasJoined}
        onJoin={handleJoinMeeting}
        onLeave={handleLeaveMeeting}
        onError={setError}
      />
    </ProtectedRoute>
  )
}