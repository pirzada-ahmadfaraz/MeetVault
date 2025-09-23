'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'
import { Meeting } from '@/types'

interface MeetingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  meeting: Meeting | null
  onJoin?: (meetingId: string) => void
}

export default function MeetingDetailsModal({
  isOpen,
  onClose,
  meeting,
  onJoin
}: MeetingDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!meeting) return null

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMeetingLink = () => {
    return `${window.location.origin}/meeting/${meeting.meetingId}`
  }

  const getMeetingStatus = () => {
    if (meeting.isActive) {
      return { text: 'Live', color: 'text-red-600 dark:text-red-400' }
    } else if (meeting.endTime) {
      return { text: 'Ended', color: 'text-gray-600 dark:text-gray-400' }
    } else if (meeting.scheduledStartTime && new Date(meeting.scheduledStartTime) > new Date()) {
      return { text: 'Scheduled', color: 'text-blue-600 dark:text-blue-400' }
    } else {
      return { text: 'Not started', color: 'text-yellow-600 dark:text-yellow-400' }
    }
  }

  const status = getMeetingStatus()

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Meeting Details
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Meeting Info */}
                <div className="space-y-4">
                  {/* Title and Status */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {meeting.title}
                      </h4>
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    {meeting.description && (
                      <p className="text-gray-600 dark:text-gray-300">{meeting.description}</p>
                    )}
                  </div>

                  {/* Meeting ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meeting ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                        <code className="text-sm text-gray-900 dark:text-white font-mono">
                          {meeting.meetingId}
                        </code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(meeting.meetingId, 'id')}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {copiedField === 'id' ? (
                          <CheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Meeting Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meeting Link
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                        <div className="text-sm text-gray-900 dark:text-white truncate">
                          {getMeetingLink()}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(getMeetingLink(), 'link')}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {copiedField === 'link' ? (
                          <CheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Host */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Host
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {meeting.host.firstName} {meeting.host.lastName}
                    </p>
                  </div>

                  {/* Date/Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {meeting.startTime ? 'Started' : meeting.scheduledStartTime ? 'Scheduled' : 'Created'}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(meeting.startTime || meeting.scheduledStartTime || meeting.createdAt)}
                    </p>
                  </div>

                  {/* Duration */}
                  {meeting.startTime && meeting.endTime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60))} minutes
                      </p>
                    </div>
                  )}

                  {/* Participants */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Participants
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {meeting.currentParticipantCount || 0} / {meeting.maxParticipants}
                    </p>
                  </div>

                  {/* Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meeting Settings
                    </label>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Chat:</span>
                        <span className="text-gray-900 dark:text-white">
                          {meeting.settings?.allowChat ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Screen sharing:</span>
                        <span className="text-gray-900 dark:text-white">
                          {meeting.settings?.allowScreenShare ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Password required:</span>
                        <span className="text-gray-900 dark:text-white">
                          {meeting.settings?.requirePassword ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Waiting room:</span>
                        <span className="text-gray-900 dark:text-white">
                          {meeting.settings?.waitingRoom ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  {meeting.isActive && onJoin && (
                    <button
                      onClick={() => onJoin(meeting.meetingId)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Join Meeting
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}