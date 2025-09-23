'use client'

import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { meetingAPI } from '@/lib/api'
import { Meeting, CreateMeetingData } from '@/types'
import LoadingSpinner from './LoadingSpinner'

interface CreateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onMeetingCreated: (meeting: Meeting) => void
}

export default function CreateMeetingModal({ 
  isOpen, 
  onClose, 
  onMeetingCreated 
}: CreateMeetingModalProps) {
  const [formData, setFormData] = useState<CreateMeetingData>({
    title: '',
    description: '',
    maxParticipants: 10,
    settings: {
      allowChat: true,
      allowScreenShare: true,
      requirePassword: false,
      waitingRoom: false,
      muteParticipantsOnEntry: false
    }
  })
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const meetingData: CreateMeetingData = {
        ...formData,
        settings: {
          ...formData.settings,
          password: formData.settings?.requirePassword ? password : undefined
        }
      }

      const response = await meetingAPI.createMeeting(meetingData)
      
      if (response.success) {
        onMeetingCreated(response.data)
        handleClose()
      } else {
        setError(response.message)
      }
    } catch (error: any) {
      console.error('Error creating meeting:', error)
      setError(error.response?.data?.message || 'Failed to create meeting. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      maxParticipants: 10,
      settings: {
        allowChat: true,
        allowScreenShare: true,
        requirePassword: false,
        waitingRoom: false,
        muteParticipantsOnEntry: false
      }
    })
    setPassword('')
    setError('')
    onClose()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name.startsWith('settings.')) {
        const settingName = name.replace('settings.', '')
        setFormData(prev => ({
          ...prev,
          settings: {
            ...prev.settings,
            [settingName]: checked
          }
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }))
    }
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
                    Create New Meeting
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
                  {/* Meeting Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter meeting title"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Optional description"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Max Participants */}
                  <div>
                    <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Maximum Participants
                    </label>
                    <input
                      type="number"
                      id="maxParticipants"
                      name="maxParticipants"
                      min="2"
                      max="100"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Settings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Meeting Settings</h4>
                    
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.allowChat"
                          checked={formData.settings?.allowChat}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow chat</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.allowScreenShare"
                          checked={formData.settings?.allowScreenShare}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow screen sharing</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.waitingRoom"
                          checked={formData.settings?.waitingRoom}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable waiting room</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.muteParticipantsOnEntry"
                          checked={formData.settings?.muteParticipantsOnEntry}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Mute participants on entry</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="settings.requirePassword"
                          checked={formData.settings?.requirePassword}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Require password</span>
                      </label>
                    </div>

                    {/* Password field (conditional) */}
                    {formData.settings?.requirePassword && (
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Meeting Password
                        </label>
                        <input
                          type="text"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter password"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    )}
                  </div>

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
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      disabled={isLoading || !formData.title}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="small" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Create Meeting'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}