'use client'

import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

interface JoinMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onJoin: (meetingId: string, password?: string) => Promise<void>
}

export default function JoinMeetingModal({
  isOpen,
  onClose,
  onJoin
}: JoinMeetingModalProps) {
  const [meetingId, setMeetingId] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!meetingId.trim()) {
      setError('Please enter a meeting ID')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onJoin(meetingId.trim(), password || undefined)
      handleClose()
    } catch (error: any) {
      console.error('Join meeting error:', error)

      // Check if password is required
      if (error.response?.data?.message?.includes('password') || error.message?.includes('password')) {
        setShowPasswordField(true)
        setError('This meeting requires a password')
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to join meeting. Please check the meeting ID and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setMeetingId('')
    setPassword('')
    setShowPasswordField(false)
    setError('')
    setIsLoading(false)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 dark:text-white">
                    Join Meeting
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Meeting ID */}
                  <div>
                    <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meeting ID *
                    </label>
                    <input
                      type="text"
                      id="meetingId"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter meeting ID (e.g., 123abc456def)"
                      disabled={isLoading}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      The meeting ID provided by the host
                    </p>
                  </div>

                  {/* Password field (conditional) */}
                  {showPasswordField && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      disabled={isLoading || !meetingId.trim()}
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
                </form>

                {/* Instructions */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    How to join:
                  </h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Enter the meeting ID shared by the host</li>
                    <li>• If the meeting is password protected, you'll be prompted to enter it</li>
                    <li>• Click "Join Meeting" to enter the meeting room</li>
                  </ul>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}