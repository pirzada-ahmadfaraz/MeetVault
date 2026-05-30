'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { meetingAPI } from '@/lib/api'
import { Meeting, CreateMeetingData } from '@/types'
import LoadingSpinner from './LoadingSpinner'

interface CreateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onMeetingCreated: (meeting: Meeting) => void
}

const DEFAULT_SETTINGS = {
  allowChat: true,
  allowScreenShare: true,
  requirePassword: false,
  waitingRoom: false,
  muteParticipantsOnEntry: false,
}

export default function CreateMeetingModal({ isOpen, onClose, onMeetingCreated }: CreateMeetingModalProps) {
  const [formData, setFormData] = useState<CreateMeetingData>({
    title: '', description: '', maxParticipants: 10, settings: { ...DEFAULT_SETTINGS },
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
        settings: { ...formData.settings, password: formData.settings?.requirePassword ? password : undefined },
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
    setFormData({ title: '', description: '', maxParticipants: 10, settings: { ...DEFAULT_SETTINGS } })
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
        setFormData((prev) => ({ ...prev, settings: { ...prev.settings, [settingName]: checked } }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }))
    }
  }

  const settingsList = [
    { name: 'allowChat', label: 'Allow chat' },
    { name: 'allowScreenShare', label: 'Allow screen sharing' },
    { name: 'waitingRoom', label: 'Enable waiting room' },
    { name: 'muteParticipantsOnEntry', label: 'Mute on entry' },
    { name: 'requirePassword', label: 'Require password' },
  ] as const

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden frost rounded-3xl p-6 text-left align-middle transition-all text-fg">
                <div className="flex items-center justify-between mb-5">
                  <Dialog.Title as="h3" className="font-display text-lg font-bold flex items-center gap-2.5"><span className="w-8 h-8 rounded-xl bg-lime-500/15 border border-lime-500/25 flex items-center justify-center text-lime-300"><PlusIcon className="h-4 w-4" /></span> New room</Dialog.Title>
                  <button onClick={handleClose} className="w-8 h-8 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center text-muted hover:text-fg transition-colors"><XMarkIcon className="h-4 w-4" /></button>
                </div>

                {error && <div className="mb-4 rounded-xl border border-tally-500/30 bg-tally-500/10 p-3"><p className="text-sm text-tally-300">{error}</p></div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="mono-label text-[0.5rem] text-faint block mb-1.5">Room title *</label>
                    <input type="text" id="title" name="title" required value={formData.title} onChange={handleInputChange} className="field px-3.5 py-2.5 text-sm" placeholder="Weekly sync" disabled={isLoading} />
                  </div>
                  <div>
                    <label htmlFor="description" className="mono-label text-[0.5rem] text-faint block mb-1.5">Description</label>
                    <textarea id="description" name="description" rows={2} value={formData.description} onChange={handleInputChange} className="field px-3.5 py-2.5 text-sm resize-none" placeholder="Optional" disabled={isLoading} />
                  </div>
                  <div>
                    <label htmlFor="maxParticipants" className="mono-label text-[0.5rem] text-faint block mb-1.5">Max participants</label>
                    <input type="number" id="maxParticipants" name="maxParticipants" min="2" max="100" value={formData.maxParticipants} onChange={handleInputChange} className="field px-3.5 py-2.5 text-sm" disabled={isLoading} />
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <h4 className="mono-label text-[0.5rem] text-faint">Settings</h4>
                    {settingsList.map((s) => (
                      <label key={s.name} className="flex items-center gap-2.5 cursor-pointer rounded-lg px-1 py-1 hover:bg-white/5 transition-colors">
                        <input type="checkbox" name={`settings.${s.name}`} checked={formData.settings?.[s.name as keyof typeof formData.settings] as boolean} onChange={handleInputChange} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-lime-500" disabled={isLoading} />
                        <span className="text-sm text-muted">{s.label}</span>
                      </label>
                    ))}

                    {formData.settings?.requirePassword && (
                      <div className="pt-1">
                        <label htmlFor="password" className="mono-label text-[0.5rem] text-faint block mb-1.5">Room password</label>
                        <input type="text" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field px-3.5 py-2.5 text-sm" placeholder="Enter password" disabled={isLoading} required />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={handleClose} disabled={isLoading} className="btn-ghost flex-1 rounded-xl py-2.5 text-sm font-medium">Cancel</button>
                    <button type="submit" disabled={isLoading || !formData.title} className="btn-live flex-1 rounded-xl py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isLoading ? (<><LoadingSpinner size="small" /> Creating…</>) : 'Create room'}
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
