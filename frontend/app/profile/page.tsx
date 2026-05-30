'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { authAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', username: '', email: '' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    if (user) {
      setProfileData({ firstName: user.firstName || '', lastName: user.lastName || '', username: user.username || '', email: user.email || '' })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const response = await authAPI.updateProfile(profileData)
      if (response.success) {
        updateUser(response.data)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    setIsChangingPassword(true)
    setMessage({ type: '', text: '' })
    try {
      const response = await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password. Please try again.' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <ProtectedRoute>
      <div className="grain min-h-screen bg-ink text-fg">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-extrabold">Profile</h1>
            <p className="text-muted mt-1.5">Manage your account information.</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success' ? 'border-lime-500/25 bg-lime-500/10 text-lime-300' : 'border-tally-500/30 bg-tally-500/10 text-tally-300'}`}>
              {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationCircleIcon className="h-5 w-5" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar */}
            <div className="lg:col-span-1">
              <div className="panel rounded-2xl p-6 text-center">
                <h2 className="mono-label text-[0.5rem] text-faint mb-5">Profile picture</h2>
                <div className="mx-auto w-28 h-28 rounded-2xl bg-lime-500/15 border border-lime-500/25 flex items-center justify-center mb-4 overflow-hidden">
                  {user?.profilePicture ? <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <span className="font-display text-3xl font-bold text-lime-300">{initials || '?'}</span>}
                </div>
                <button className="btn-ghost rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 mx-auto"><CameraIcon className="h-4 w-4" /> Change photo</button>
                <p className="mono-label text-[0.45rem] text-faint mt-3">JPG · GIF · PNG · 1MB max</p>
              </div>
            </div>

            {/* Forms */}
            <div className="lg:col-span-2 space-y-6">
              <div className="panel rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold mb-5">Basic info</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="mono-label text-[0.5rem] text-faint block mb-1.5">First name</label>
                      <div className="relative">
                        <UserIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                        <input type="text" id="firstName" name="firstName" value={profileData.firstName} onChange={handleProfileChange} className="field pl-9 pr-3 py-2.5 text-sm" required />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="mono-label text-[0.5rem] text-faint block mb-1.5">Last name</label>
                      <div className="relative">
                        <UserIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                        <input type="text" id="lastName" name="lastName" value={profileData.lastName} onChange={handleProfileChange} className="field pl-9 pr-3 py-2.5 text-sm" required />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="username" className="mono-label text-[0.5rem] text-faint block mb-1.5">Username</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint text-sm">@</span>
                      <input type="text" id="username" name="username" value={profileData.username} onChange={handleProfileChange} className="field pl-8 pr-3 py-2.5 text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="mono-label text-[0.5rem] text-faint block mb-1.5">Email</label>
                    <div className="relative">
                      <EnvelopeIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                      <input type="email" id="email" name="email" value={profileData.email} onChange={handleProfileChange} className="field pl-9 pr-3 py-2.5 text-sm opacity-60 cursor-not-allowed" disabled />
                    </div>
                    <p className="mono-label text-[0.45rem] text-faint mt-1.5">Email can't be changed for security.</p>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="btn-live rounded-xl px-6 py-2.5 text-sm disabled:opacity-50 flex items-center gap-2">
                      {isSaving && <LoadingSpinner size="small" />} {isSaving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="panel rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold mb-5">Change password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {[
                    { id: 'currentPassword', label: 'Current password', min: undefined },
                    { id: 'newPassword', label: 'New password', min: 6 },
                    { id: 'confirmPassword', label: 'Confirm new password', min: 6 },
                  ].map((f) => (
                    <div key={f.id}>
                      <label htmlFor={f.id} className="mono-label text-[0.5rem] text-faint block mb-1.5">{f.label}</label>
                      <div className="relative">
                        <KeyIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                        <input type="password" id={f.id} name={f.id} value={(passwordData as any)[f.id]} onChange={handlePasswordChange} className="field pl-9 pr-3 py-2.5 text-sm" required minLength={f.min} />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <button type="submit" disabled={isChangingPassword} className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-tally-500 text-white hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2">
                      {isChangingPassword && <LoadingSpinner size="small" />} {isChangingPassword ? 'Changing…' : 'Change password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
