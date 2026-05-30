'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ClipboardIcon, CheckIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { Meeting } from '@/types'

interface MeetingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  meeting: Meeting | null
  onJoin?: (meetingId: string) => void
}

export default function MeetingDetailsModal({ isOpen, onClose, meeting, onJoin }: MeetingDetailsModalProps) {
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
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getMeetingLink = () => `${window.location.origin}/meeting/${meeting.meetingId}`

  const getMeetingStatus = () => {
    if (meeting.isActive) return { text: 'Live', color: 'text-tally-400' }
    if (meeting.endTime) return { text: 'Ended', color: 'text-faint' }
    if (meeting.scheduledStartTime && new Date(meeting.scheduledStartTime) > new Date()) return { text: 'Scheduled', color: 'text-lime-300' }
    return { text: 'Standby', color: 'text-amber-300' }
  }
  const status = getMeetingStatus()

  const CopyRow = ({ label, value, field, mono = false }: { label: string; value: string; field: string; mono?: boolean }) => (
    <div>
      <label className="mono-label text-[0.5rem] text-faint block mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className={`text-sm text-fg truncate ${mono ? 'font-mono' : ''}`}>{value}</div>
        </div>
        <button onClick={() => copyToClipboard(value, field)} className="w-10 h-10 rounded-xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-muted hover:text-fg transition-colors">
          {copiedField === field ? <CheckIcon className="h-4 w-4 text-lime-400" /> : <ClipboardIcon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )

  const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between text-sm"><span className="text-muted">{label}</span><span className="font-medium">{value}</span></div>
  )

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden frost rounded-3xl p-6 text-left align-middle transition-all text-fg">
                <div className="flex items-center justify-between mb-5">
                  <Dialog.Title as="h3" className="font-display text-lg font-bold">Room details</Dialog.Title>
                  <button onClick={onClose} className="w-8 h-8 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center text-muted hover:text-fg transition-colors"><XMarkIcon className="h-4 w-4" /></button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <h4 className="font-display text-xl font-bold">{meeting.title}</h4>
                      <span className={`mono-label text-[0.5rem] ${status.color}`}>{status.text}</span>
                    </div>
                    {meeting.description && <p className="text-sm text-muted">{meeting.description}</p>}
                  </div>

                  <CopyRow label="Room ID" value={meeting.meetingId} field="id" mono />
                  <CopyRow label="Room link" value={getMeetingLink()} field="link" />

                  <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4 space-y-2">
                    <Info label="Host" value={`${meeting.host.firstName} ${meeting.host.lastName}`} />
                    <Info label={meeting.startTime ? 'Started' : meeting.scheduledStartTime ? 'Scheduled' : 'Created'} value={formatDate(meeting.startTime || meeting.scheduledStartTime || meeting.createdAt)} />
                    {meeting.startTime && meeting.endTime && <Info label="Duration" value={`${Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / 60000)} min`} />}
                    <Info label="Participants" value={<span className="tabular-nums">{meeting.currentParticipantCount || 0} / {meeting.maxParticipants}</span>} />
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4 space-y-2">
                    <h5 className="mono-label text-[0.5rem] text-faint mb-1">Settings</h5>
                    <Info label="Chat" value={meeting.settings?.allowChat ? 'Enabled' : 'Disabled'} />
                    <Info label="Screen sharing" value={meeting.settings?.allowScreenShare ? 'Enabled' : 'Disabled'} />
                    <Info label="Password required" value={meeting.settings?.requirePassword ? 'Yes' : 'No'} />
                    <Info label="Waiting room" value={meeting.settings?.waitingRoom ? 'Enabled' : 'Disabled'} />
                  </div>
                </div>

                <div className="flex gap-3 pt-5 mt-5 border-t border-white/8">
                  <button onClick={onClose} className="btn-ghost flex-1 rounded-xl py-2.5 text-sm font-medium">Close</button>
                  {meeting.isActive && onJoin && (
                    <button onClick={() => onJoin(meeting.meetingId)} className="btn-live flex-1 rounded-xl py-2.5 text-sm flex items-center justify-center gap-2"><VideoCameraIcon className="h-4 w-4" /> Join</button>
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
