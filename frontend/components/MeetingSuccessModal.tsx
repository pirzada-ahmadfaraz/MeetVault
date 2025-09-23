'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  ClipboardIcon,
  CheckIcon,
  VideoCameraIcon,
  ShareIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { Meeting } from '@/types'

interface MeetingSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  meeting: Meeting | null
  onJoinNow?: (meetingId: string) => void
}

export default function MeetingSuccessModal({
  isOpen,
  onClose,
  meeting,
  onJoinNow
}: MeetingSuccessModalProps) {
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

  const getMeetingLink = () => {
    return `${window.location.origin}/meeting/${meeting.meetingId}`
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join my meeting: ${meeting.title}`)
    const body = encodeURIComponent(`You're invited to join my meeting!

Meeting: ${meeting.title}
${meeting.description ? `Description: ${meeting.description}` : ''}

Join using this link: ${getMeetingLink()}

Or enter Meeting ID: ${meeting.meetingId}
${meeting.settings?.requirePassword ? '\nPassword will be provided separately for security.' : ''}

Looking forward to meeting with you!`)

    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Join my meeting: ${meeting.title}

Link: ${getMeetingLink()}
Meeting ID: ${meeting.meetingId}
${meeting.settings?.requirePassword ? '\nPassword will be provided separately.' : ''}`)

    window.open(`https://wa.me/?text=${text}`)
  }

  const copyInviteText = () => {
    const inviteText = `You're invited to join my meeting!

Meeting: ${meeting.title}
${meeting.description ? `Description: ${meeting.description}\n` : ''}
Join using this link: ${getMeetingLink()}

Or enter Meeting ID: ${meeting.meetingId}
${meeting.settings?.requirePassword ? '\nPassword will be provided separately for security.' : ''}

Looking forward to meeting with you!`

    copyToClipboard(inviteText, 'invite')
  }

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                      <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
                      Meeting Created!
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Meeting Info */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {meeting.title}
                    </h4>
                    {meeting.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{meeting.description}</p>
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
                        title="Copy Meeting ID"
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
                        title="Copy Meeting Link"
                      >
                        {copiedField === 'link' ? (
                          <CheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Share Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Share with others
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={shareViaEmail}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Email
                    </button>
                    <button
                      onClick={shareViaWhatsApp}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ShareIcon className="h-4 w-4 mr-2" />
                      WhatsApp
                    </button>
                  </div>

                  <button
                    onClick={copyInviteText}
                    className="w-full mt-3 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {copiedField === 'invite' ? (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="h-4 w-4 mr-2" />
                        Copy Invitation Text
                      </>
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Done
                  </button>
                  {onJoinNow && (
                    <button
                      onClick={() => onJoinNow(meeting.meetingId)}
                      className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <VideoCameraIcon className="h-4 w-4 mr-2" />
                      Start Meeting
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