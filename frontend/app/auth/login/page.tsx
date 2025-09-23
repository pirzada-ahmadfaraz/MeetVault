'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { signIn } from 'next-auth/react'
import {
  VideoCameraIcon,
  UserIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState('')

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(formData.identifier, formData.password)

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
          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors group bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-6">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Welcome Content */}
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
                  Welcome back to the future
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Continue your video conferencing journey with seamless meetings,
                  crystal-clear communication, and powerful collaboration tools.
                </p>
              </div>

              {/* Welcome Features */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Quick Access</h3>
                    <p className="text-gray-300">Jump right back into your meetings and conversations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-500/20 p-2 rounded-lg">
                    <ShieldCheckIcon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Secure Login</h3>
                    <p className="text-gray-300">Your account is protected with enterprise-grade security</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-teal-500/20 p-2 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Team Sync</h3>
                    <p className="text-gray-300">Connect with your team and continue where you left off</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-lg mx-auto lg:mx-0">
              <div className="glass rounded-2xl shadow-2xl p-8">

                {/* Mobile Header */}
                <div className="text-center mb-8 lg:hidden">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                      <VideoCameraIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-gray-300">Sign in to continue to MeetVault</p>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:block text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
                  <p className="text-gray-300">Welcome back! Please sign in to your account</p>
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
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email/Username */}
                  <div className="group">
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-2">
                      Email or Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className={`h-5 w-5 transition-colors ${focusedField === 'identifier' ? 'text-emerald-400' : 'text-gray-500'}`} />
                      </div>
                      <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        required
                        value={formData.identifier}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('identifier')}
                        onBlur={() => setFocusedField('')}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-600 bg-gray-700 rounded-lg shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                        placeholder="Enter your email or username"
                        disabled={isLoading}
                      />
                      {formData.identifier && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className={`h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-emerald-400' : 'text-gray-500'}`} />
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-600 bg-gray-700 rounded-lg shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                        placeholder="Enter your password"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                      {/* Testing Something Out */}
                  {/* Remember me & Forgot password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-600 rounded bg-gray-700"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <a href="#" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !formData.identifier || !formData.password}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Signing you in...
                      </>
                    ) : (
                      <>
                        <VideoCameraIcon className="h-5 w-5 mr-2" />
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                {/* Alternative Sign In Options */}
                <div className="mt-6">
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
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-300">
                    Don't have an account?{' '}
                    <Link
                      href="/auth/register"
                      className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Sign up here
                    </Link>
                  </p>

                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      By signing in, you agree to our{' '}
                      <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}