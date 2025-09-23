'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import { 
  BellIcon, 
  VideoCameraIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    meetingReminders: true,
    chatNotifications: true,
    
    // Video & Audio Settings
    defaultCamera: 'default',
    defaultMicrophone: 'default',
    defaultSpeaker: 'default',
    autoJoinAudio: true,
    autoJoinVideo: false,
    
    // Privacy Settings
    profileVisibility: 'public',
    meetingHistory: 'private',
    
    // Appearance
    language: 'en',
    
    // Meeting Defaults
    defaultMeetingDuration: 60,
    waitingRoom: true,
    muteOnEntry: true,
    allowScreenShare: true,
    allowChat: true
  })

  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = () => {
    // Here you would typically save to API
    setMessage({ type: 'success', text: 'Settings saved successfully!' })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 settings-section hover-lift transition-colors duration-300">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{title}</h2>
      {children}
    </div>
  )

  const ToggleSetting = ({
    label,
    description,
    checked,
    onChange,
    icon: Icon
  }: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon?: any;
  }) => (
    <div className="flex items-start justify-between py-3">
      <div className="flex items-start">
        {Icon && <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
        onClick={(e) => {
          e.preventDefault()
          onChange(!checked)
        }}
        role="switch"
        aria-checked={checked}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )

  const SelectSetting = ({
    label,
    value,
    options,
    onChange,
    icon: Icon
  }: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    icon?: any;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center">
        {Icon && <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />}
        <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value} className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Customize your MeetVault experience and preferences.
            </p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-3" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 mr-3" />
              )}
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Notifications */}
            <SettingSection title="Notifications">
              <div className="space-y-1">
                <ToggleSetting
                  icon={BellIcon}
                  label="Email Notifications"
                  description="Receive meeting updates and reminders via email"
                  checked={settings.emailNotifications}
                  onChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
                <ToggleSetting
                  icon={BellIcon}
                  label="Push Notifications"
                  description="Get real-time notifications in your browser"
                  checked={settings.pushNotifications}
                  onChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
                <ToggleSetting
                  icon={BellIcon}
                  label="Meeting Reminders"
                  description="Get notified before your meetings start"
                  checked={settings.meetingReminders}
                  onChange={(checked) => handleSettingChange('meetingReminders', checked)}
                />
                <ToggleSetting
                  icon={BellIcon}
                  label="Chat Notifications"
                  description="Receive notifications for new chat messages"
                  checked={settings.chatNotifications}
                  onChange={(checked) => handleSettingChange('chatNotifications', checked)}
                />
              </div>
            </SettingSection>

            {/* Video & Audio */}
            <SettingSection title="Video & Audio">
              <div className="space-y-1">
                <SelectSetting
                  icon={VideoCameraIcon}
                  label="Default Camera"
                  value={settings.defaultCamera}
                  options={[
                    { value: 'default', label: 'Default Camera' },
                    { value: 'front', label: 'Front Camera' },
                    { value: 'back', label: 'Back Camera' }
                  ]}
                  onChange={(value) => handleSettingChange('defaultCamera', value)}
                />
                <SelectSetting
                  icon={MicrophoneIcon}
                  label="Default Microphone"
                  value={settings.defaultMicrophone}
                  options={[
                    { value: 'default', label: 'Default Microphone' },
                    { value: 'built-in', label: 'Built-in Microphone' }
                  ]}
                  onChange={(value) => handleSettingChange('defaultMicrophone', value)}
                />
                <SelectSetting
                  icon={SpeakerWaveIcon}
                  label="Default Speaker"
                  value={settings.defaultSpeaker}
                  options={[
                    { value: 'default', label: 'Default Speaker' },
                    { value: 'built-in', label: 'Built-in Speaker' }
                  ]}
                  onChange={(value) => handleSettingChange('defaultSpeaker', value)}
                />
                <ToggleSetting
                  icon={MicrophoneIcon}
                  label="Auto Join Audio"
                  description="Automatically join meeting audio when you enter"
                  checked={settings.autoJoinAudio}
                  onChange={(checked) => handleSettingChange('autoJoinAudio', checked)}
                />
                <ToggleSetting
                  icon={VideoCameraIcon}
                  label="Auto Join Video"
                  description="Automatically turn on camera when you enter"
                  checked={settings.autoJoinVideo}
                  onChange={(checked) => handleSettingChange('autoJoinVideo', checked)}
                />
              </div>
            </SettingSection>

            {/* Privacy */}
            <SettingSection title="Privacy & Security">
              <div className="space-y-1">
                <SelectSetting
                  icon={ShieldCheckIcon}
                  label="Profile Visibility"
                  value={settings.profileVisibility}
                  options={[
                    { value: 'public', label: 'Public' },
                    { value: 'private', label: 'Private' }
                  ]}
                  onChange={(value) => handleSettingChange('profileVisibility', value)}
                />
                <SelectSetting
                  icon={ShieldCheckIcon}
                  label="Meeting History"
                  value={settings.meetingHistory}
                  options={[
                    { value: 'public', label: 'Public' },
                    { value: 'private', label: 'Private' }
                  ]}
                  onChange={(value) => handleSettingChange('meetingHistory', value)}
                />
              </div>
            </SettingSection>

            {/* Appearance */}
            <SettingSection title="Appearance">
              <div className="space-y-1">
                <SelectSetting
                  icon={theme === 'light' ? SunIcon : theme === 'dark' ? MoonIcon : ComputerDesktopIcon}
                  label="Theme"
                  value={theme}
                  options={[
                    { value: 'system', label: 'System' },
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' }
                  ]}
                  onChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                />
                <SelectSetting
                  icon={GlobeAltIcon}
                  label="Language"
                  value={settings.language}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' }
                  ]}
                  onChange={(value) => handleSettingChange('language', value)}
                />
              </div>
            </SettingSection>

            {/* Meeting Defaults */}
            <SettingSection title="Meeting Defaults">
              <div className="space-y-1">
                <SelectSetting
                  label="Default Meeting Duration"
                  value={settings.defaultMeetingDuration.toString()}
                  options={[
                    { value: '30', label: '30 minutes' },
                    { value: '60', label: '1 hour' },
                    { value: '90', label: '1.5 hours' },
                    { value: '120', label: '2 hours' }
                  ]}
                  onChange={(value) => handleSettingChange('defaultMeetingDuration', parseInt(value))}
                />
                <ToggleSetting
                  label="Enable Waiting Room"
                  description="Require host approval for participants to join"
                  checked={settings.waitingRoom}
                  onChange={(checked) => handleSettingChange('waitingRoom', checked)}
                />
                <ToggleSetting
                  label="Mute Participants on Entry"
                  description="Automatically mute participants when they join"
                  checked={settings.muteOnEntry}
                  onChange={(checked) => handleSettingChange('muteOnEntry', checked)}
                />
                <ToggleSetting
                  label="Allow Screen Sharing"
                  description="Let participants share their screens"
                  checked={settings.allowScreenShare}
                  onChange={(checked) => handleSettingChange('allowScreenShare', checked)}
                />
                <ToggleSetting
                  label="Allow Chat"
                  description="Enable chat during meetings"
                  checked={settings.allowChat}
                  onChange={(checked) => handleSettingChange('allowChat', checked)}
                />
              </div>
            </SettingSection>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                handleSaveSettings()
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium shadow-lg hover:shadow-xl"
            >
              Save Settings
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}