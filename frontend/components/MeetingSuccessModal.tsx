'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ClipboardIcon, CheckIcon, VideoCameraIcon, ShareIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Meeting } from '@/types'

interface MeetingSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  meeting: Meeting | null
  onJoinNow?: (meetingId: string) => void
}

export default function MeetingSuccessModal({ isOpen, onClose, meeting, onJoinNow }: MeetingSuccessModalProps) {
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

  const getMeetingLink = () => `${window.location.origin}/meeting/${meeting.meetingId}`

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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden frost rounded-3xl p-6 text-left align-middle transition-all text-fg">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-lime-500/15 border border-lime-500/25 flex items-center justify-center text-lime-300"><CheckCircleIcon className="h-5 w-5" /></span>
                    <Dialog.Title as="h3" className="font-display text-lg font-bold">Room is ready</Dialog.Title>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center text-muted hover:text-fg transition-colors"><XMarkIcon className="h-4 w-4" /></button>
                </div>

                <div className="space-y-4 mb-5">
                  <div>
                    <h4 className="font-display text-lg font-bold">{meeting.title}</h4>
                    {meeting.description && <p className="text-sm text-muted mt-0.5">{meeting.description}</p>}
                  </div>
                  <CopyRow label="Room ID" value={meeting.meetingId} field="id" mono />
                  <CopyRow label="Room link" value={getMeetingLink()} field="link" />
                </div>

                <div className="mb-5">
                  <label className="mono-label text-[0.5rem] text-faint block mb-2.5">Share with others</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={shareViaEmail} className="btn-ghost rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2"><EnvelopeIcon className="h-4 w-4" /> Email</button>
                    <button onClick={shareViaWhatsApp} className="btn-ghost rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2"><ShareIcon className="h-4 w-4" /> WhatsApp</button>
                  </div>
                  <button onClick={copyInviteText} className="btn-ghost w-full mt-3 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2">
                    {copiedField === 'invite' ? <><CheckIcon className="h-4 w-4 text-lime-400" /> Copied!</> : <><ClipboardIcon className="h-4 w-4" /> Copy invitation text</>}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button onClick={onClose} className="btn-ghost flex-1 rounded-xl py-2.5 text-sm font-medium">Done</button>
                  {onJoinNow && (
                    <button onClick={() => onJoinNow(meeting.meetingId)} className="btn-live flex-1 rounded-xl py-2.5 text-sm flex items-center justify-center gap-2"><VideoCameraIcon className="h-4 w-4" /> Start room</button>
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
