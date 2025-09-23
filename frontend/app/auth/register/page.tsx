'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { signIn } from 'next-auth/react'
import {
  VideoCameraIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState('')

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      const { confirmPassword, ...registerData } = formData
      const result = await register(registerData)

      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.username &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword
    )
  }

  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, text: '', color: '' }

    let strength = 0
    if (password.length >= 6) strength += 1
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    const strengthLevels = [
      { text: 'Very Weak', color: 'bg-red-500' },
      { text: 'Weak', color: 'bg-orange-500' },
      { text: 'Fair', color: 'bg-yellow-500' },
      { text: 'Good', color: 'bg-emerald-500' },
      { text: 'Strong', color: 'bg-emerald-600' }
    ]

    return {
      strength,
      ...strengthLevels[Math.min(strength, 4)]
    }
  }

  const passwordStrength = getPasswordStrength()

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      await signIn(provider, {
        callbackUrl: '/dashboard',
        redirect: true
      })
    } catch (error) {
      console.error('OAuth sign in error:', error)
      setError('Failed to sign in with ' + provider + '. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Back to home link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors group bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-6">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Promotional Content */}
            <div className="hidden lg:flex flex-col justify-center space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                    <VideoCameraIcon className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    MeetVault
                  </h1>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  Join the future of video conferencing
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Connect with teams worldwide through high-quality video calls,
                  real-time chat, and seamless collaboration tools.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <VideoCameraIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">HD Video Quality</h3>
                    <p className="text-gray-300">Crystal clear video calls with adaptive streaming</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-500/20 p-2 rounded-lg">
                    <ShieldCheckIcon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Secure & Private</h3>
                    <p className="text-gray-300">End-to-end encryption for all your meetings</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-teal-500/20 p-2 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Team Collaboration</h3>
                    <p className="text-gray-300">Screen sharing, chat, and meeting management</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">10+</div>
                  <div className="text-sm text-gray-400">Technologies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">100%</div>
                  <div className="text-sm text-gray-400">Responsive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-400">6+</div>
                  <div className="text-sm text-gray-400">Core Features</div>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="glass rounded-2xl shadow-2xl p-8">

                {/* Mobile Header */}
                <div className="text-center mb-8 lg:hidden">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                      <VideoCameraIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    Join MeetVault
                  </h1>
                  <p className="text-gray-300">Create your account to start connecting</p>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:block text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                  <p className="text-gray-300">Get started with your free account</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                    <p className="text-sm text-red-300 flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="group">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className={`h-4 w-4 transition-colors ${focusedField === 'firstName' ? 'text-emerald-400' : 'text-gray-500'}`} />
                        </div>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('firstName')}
                          onBlur={() => setFocusedField('')}
                          className="w-full pl-9 pr-3 py-2 border border-gray-600 bg-gray-700 rounded-lg shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                          placeholder="John"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                        Last Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className={`h-4 w-4 transition-colors ${focusedField === 'lastName' ? 'text-emerald-400' : 'text-gray-500'}`} />
                        </div>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('lastName')}
                          onBlur={() => setFocusedField('')}
                          className="w-full pl-9 pr-3 py-2 border border-gray-600 bg-gray-700 rounded-lg shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                          placeholder="Doe"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="group">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className={`text-sm transition-colors ${focusedField === 'username' ? 'text-emerald-400' : 'text-gray-500'}`}>@</span>
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField('')}
                        className="w-full pl-8 pr-3 py-2 border border-gray-600 bg-gray-700 rounded-lg shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                        placeholder="johndoe"
                        disabled={isLoading}
                      />
                      {formData.username && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className={`h-4 w-4 transition-colors ${focusedField === 'email' ? 'text-emerald-400' : 'text-gray-500'}`} />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        className="w-full pl-9 pr-3 py-2 border border-gray-600 bg-gray-700 rounded-lg shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                        placeholder="john@example.com"
                        disabled={isLoading}
                      />
                      {formData.email && formData.email.includes('@') && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className={`h-4 w-4 transition-colors ${focusedField === 'password' ? 'text-emerald-400' : 'text-gray-500'}`} />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        className="w-full pl-9 pr-4 py-2 border border-gray-600 bg-gray-700 rounded-lg shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                        placeholder="Create a strong password"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-600 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">{passwordStrength.text}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="group">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className={`h-4 w-4 transition-colors ${focusedField === 'confirmPassword' ? 'text-emerald-400' : 'text-gray-500'}`} />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField('')}
                        className="w-full pl-9 pr-4 py-2 border border-gray-600 bg-gray-700 rounded-lg shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                        placeholder="Confirm your password"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <div className="mt-1">
                        {formData.password === formData.confirmPassword ? (
                          <p className="text-xs text-emerald-400 flex items-center">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Passwords match
                          </p>
                        ) : (
                          <p className="text-xs text-red-400 flex items-center">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Passwords don't match
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid()}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        <VideoCameraIcon className="h-5 w-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </button>
                </form>

                {/* Alternative Sign Up Options */}
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleOAuthSignIn('google')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="ml-2">Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOAuthSignIn('github')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 2.2C6.486 2.2 2 6.685 2 12.216c0 4.43 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112.017 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022.034 12.216C22.034 6.685 17.548 2.2 12.017 2.2z"/>
                      </svg>
                      <span className="ml-2">GitHub</span>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-300">
                    Already have an account?{' '}
                    <Link
                      href="/auth/login"
                      className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}