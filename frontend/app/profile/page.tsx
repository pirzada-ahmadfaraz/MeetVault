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
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || ''
      })
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
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      })
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
      const response = await authAPI.changePassword(
        passwordData.currentPassword, 
        passwordData.newPassword
      )
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password. Please try again.' 
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your account information and preferences.
            </p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-3" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 mr-3" />
              )}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
                
                <div className="text-center">
                  <div className="mx-auto w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto">
                    <CameraIcon className="h-4 w-4 mr-2" />
                    Change Photo
                  </button>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Basic Information</h2>
                
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <UserIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <div className="relative">
                        <UserIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">@</span>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={profileData.username}
                        onChange={handleProfileChange}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-300"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Email cannot be changed for security reasons.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isSaving ? (
                        <LoadingSpinner size="small" className="mr-2" />
                      ) : null}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Change Password</h2>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <KeyIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <KeyIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <KeyIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isChangingPassword ? (
                        <LoadingSpinner size="small" className="mr-2" />
                      ) : null}
                      {isChangingPassword ? 'Changing...' : 'Change Password'}
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