'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import {
  BellIcon, VideoCameraIcon, MicrophoneIcon, SpeakerWaveIcon, ShieldCheckIcon,
  GlobeAltIcon, MoonIcon, SunIcon, ComputerDesktopIcon, CheckCircleIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    emailNotifications: true, pushNotifications: true, meetingReminders: true, chatNotifications: true,
    defaultCamera: 'default', defaultMicrophone: 'default', defaultSpeaker: 'default', autoJoinAudio: true, autoJoinVideo: false,
    profileVisibility: 'public', meetingHistory: 'private', language: 'en',
    defaultMeetingDuration: 60, waitingRoom: true, muteOnEntry: true, allowScreenShare: true, allowChat: true,
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSettingChange = (key: string, value: any) => setSettings((prev) => ({ ...prev, [key]: value }))
  const handleSaveSettings = () => {
    setMessage({ type: 'success', text: 'Settings saved successfully!' })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="panel rounded-2xl p-6">
      <h2 className="font-display text-lg font-bold mb-4">{title}</h2>
      <div className="divide-y divide-white/6">{children}</div>
    </div>
  )

  const ToggleSetting = ({ label, description, checked, onChange, icon: Icon }: { label: string; description?: string; checked: boolean; onChange: (checked: boolean) => void; icon?: any }) => (
    <div className="flex items-start justify-between py-3.5">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="h-5 w-5 text-faint mt-0.5 flex-shrink-0" />}
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-lime-500' : 'bg-white/10'}`}
        onClick={(e) => { e.preventDefault(); onChange(!checked) }}
        role="switch"
        aria-checked={checked}
      >
        <span aria-hidden className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )

  const SelectSetting = ({ label, value, options, onChange, icon: Icon }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; icon?: any }) => (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-faint" />}
        <label className="text-sm font-medium">{label}</label>
      </div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field px-3 py-2 text-sm cursor-pointer w-44">
        {options.map((option) => <option key={option.value} value={option.value} className="bg-surface text-fg">{option.label}</option>)}
      </select>
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="grain min-h-screen bg-ink text-fg">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-extrabold">Settings</h1>
            <p className="text-muted mt-1.5">Tune your MeetVault control room.</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success' ? 'border-lime-500/25 bg-lime-500/10 text-lime-300' : 'border-tally-500/30 bg-tally-500/10 text-tally-300'}`}>
              {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="space-y-5">
            <SettingSection title="Notifications">
              <ToggleSetting icon={BellIcon} label="Email notifications" description="Meeting updates and reminders via email" checked={settings.emailNotifications} onChange={(c) => handleSettingChange('emailNotifications', c)} />
              <ToggleSetting icon={BellIcon} label="Push notifications" description="Real-time browser notifications" checked={settings.pushNotifications} onChange={(c) => handleSettingChange('pushNotifications', c)} />
              <ToggleSetting icon={BellIcon} label="Meeting reminders" description="Get notified before meetings start" checked={settings.meetingReminders} onChange={(c) => handleSettingChange('meetingReminders', c)} />
              <ToggleSetting icon={BellIcon} label="Chat notifications" description="Notifications for new messages" checked={settings.chatNotifications} onChange={(c) => handleSettingChange('chatNotifications', c)} />
            </SettingSection>

            <SettingSection title="Video & Audio">
              <SelectSetting icon={VideoCameraIcon} label="Default camera" value={settings.defaultCamera} options={[{ value: 'default', label: 'Default camera' }, { value: 'front', label: 'Front camera' }, { value: 'back', label: 'Back camera' }]} onChange={(v) => handleSettingChange('defaultCamera', v)} />
              <SelectSetting icon={MicrophoneIcon} label="Default microphone" value={settings.defaultMicrophone} options={[{ value: 'default', label: 'Default mic' }, { value: 'built-in', label: 'Built-in mic' }]} onChange={(v) => handleSettingChange('defaultMicrophone', v)} />
              <SelectSetting icon={SpeakerWaveIcon} label="Default speaker" value={settings.defaultSpeaker} options={[{ value: 'default', label: 'Default speaker' }, { value: 'built-in', label: 'Built-in speaker' }]} onChange={(v) => handleSettingChange('defaultSpeaker', v)} />
              <ToggleSetting icon={MicrophoneIcon} label="Auto-join audio" description="Join audio automatically on entry" checked={settings.autoJoinAudio} onChange={(c) => handleSettingChange('autoJoinAudio', c)} />
              <ToggleSetting icon={VideoCameraIcon} label="Auto-join video" description="Turn on camera automatically on entry" checked={settings.autoJoinVideo} onChange={(c) => handleSettingChange('autoJoinVideo', c)} />
            </SettingSection>

            <SettingSection title="Privacy & Security">
              <SelectSetting icon={ShieldCheckIcon} label="Profile visibility" value={settings.profileVisibility} options={[{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }]} onChange={(v) => handleSettingChange('profileVisibility', v)} />
              <SelectSetting icon={ShieldCheckIcon} label="Meeting history" value={settings.meetingHistory} options={[{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }]} onChange={(v) => handleSettingChange('meetingHistory', v)} />
            </SettingSection>

            <SettingSection title="Appearance">
              <SelectSetting icon={theme === 'light' ? SunIcon : theme === 'dark' ? MoonIcon : ComputerDesktopIcon} label="Theme" value={theme} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} onChange={(v) => setTheme(v as 'light' | 'dark' | 'system')} />
              <SelectSetting icon={GlobeAltIcon} label="Language" value={settings.language} options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }]} onChange={(v) => handleSettingChange('language', v)} />
            </SettingSection>

            <SettingSection title="Meeting Defaults">
              <SelectSetting label="Default duration" value={settings.defaultMeetingDuration.toString()} options={[{ value: '30', label: '30 minutes' }, { value: '60', label: '1 hour' }, { value: '90', label: '1.5 hours' }, { value: '120', label: '2 hours' }]} onChange={(v) => handleSettingChange('defaultMeetingDuration', parseInt(v))} />
              <ToggleSetting label="Waiting room" description="Require host approval to join" checked={settings.waitingRoom} onChange={(c) => handleSettingChange('waitingRoom', c)} />
              <ToggleSetting label="Mute on entry" description="Mute participants when they join" checked={settings.muteOnEntry} onChange={(c) => handleSettingChange('muteOnEntry', c)} />
              <ToggleSetting label="Allow screen sharing" description="Let participants share screens" checked={settings.allowScreenShare} onChange={(c) => handleSettingChange('allowScreenShare', c)} />
              <ToggleSetting label="Allow chat" description="Enable chat during meetings" checked={settings.allowChat} onChange={(c) => handleSettingChange('allowChat', c)} />
            </SettingSection>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="button" onClick={(e) => { e.preventDefault(); handleSaveSettings() }} className="btn-live rounded-xl px-8 py-3 font-semibold">Save settings</button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
