'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, VideoCameraIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

interface JoinMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onJoin: (meetingId: string, password?: string) => Promise<void>
}

export default function JoinMeetingModal({ isOpen, onClose, onJoin }: JoinMeetingModalProps) {
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
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden frost rounded-3xl p-6 text-left align-middle transition-all text-fg">
                <div className="flex items-center justify-between mb-5">
                  <Dialog.Title as="h3" className="font-display text-lg font-bold flex items-center gap-2.5"><span className="w-8 h-8 rounded-xl bg-lime-500/15 border border-lime-500/25 flex items-center justify-center text-lime-300"><ArrowRightOnRectangleIcon className="h-4 w-4" /></span> Join a room</Dialog.Title>
                  <button onClick={handleClose} className="w-8 h-8 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center text-muted hover:text-fg transition-colors"><XMarkIcon className="h-4 w-4" /></button>
                </div>

                {error && <div className="mb-4 rounded-xl border border-tally-500/30 bg-tally-500/10 p-3"><p className="text-sm text-tally-300">{error}</p></div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="meetingId" className="mono-label text-[0.5rem] text-faint block mb-1.5">Room ID *</label>
                    <input type="text" id="meetingId" value={meetingId} onChange={(e) => setMeetingId(e.target.value)} className="field px-3.5 py-2.5 text-sm font-mono" placeholder="123abc456def" disabled={isLoading} required />
                    <p className="mt-1.5 text-xs text-faint">The room ID shared by the host.</p>
                  </div>

                  {showPasswordField && (
                    <div>
                      <label htmlFor="password" className="mono-label text-[0.5rem] text-faint block mb-1.5">Room password</label>
                      <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field px-3.5 py-2.5 text-sm" placeholder="Enter password" disabled={isLoading} />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={handleClose} disabled={isLoading} className="btn-ghost flex-1 rounded-xl py-2.5 text-sm font-medium">Cancel</button>
                    <button type="submit" disabled={isLoading || !meetingId.trim()} className="btn-live flex-1 rounded-xl py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isLoading ? (<><LoadingSpinner size="small" /> Joining…</>) : (<><VideoCameraIcon className="h-4 w-4" /> Join</>)}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-4 border-t border-white/8">
                  <h4 className="mono-label text-[0.5rem] text-faint mb-2.5">How to join</h4>
                  <ul className="text-xs text-muted space-y-1.5">
                    <li>• Enter the room ID shared by the host</li>
                    <li>• If protected, you'll be prompted for a password</li>
                    <li>• Hit Join to enter the control room</li>
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
