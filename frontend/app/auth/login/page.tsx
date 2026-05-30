'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { signIn } from 'next-auth/react'
import {
  UserIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/LoadingSpinner'
import BrandMark from '@/components/BrandMark'

export default function LoginPage() {
  const [formData, setFormData] = useState({ identifier: '', password: '' })
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
      if (result.success) router.push('/dashboard')
      else setError(result.message)
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      await signIn(provider, { callbackUrl: '/dashboard', redirect: true })
    } catch (error) {
      console.error('OAuth sign in error:', error)
      setError('Failed to sign in with ' + provider + '. Please try again.')
    }
  }

  const perks = [
    { icon: ClockIcon, title: 'Quick access', body: 'Jump straight back into your rooms and conversations.' },
    { icon: ShieldCheckIcon, title: 'Secure login', body: 'JWT-backed sessions keep your account protected.' },
    { icon: UserGroupIcon, title: 'Team sync', body: 'Reconnect with your team and pick up where you left off.' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="grid-bg absolute inset-0 opacity-50" style={{ WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 30% 30%, #000 20%, transparent 75%)', maskImage: 'radial-gradient(ellipse 60% 60% at 30% 30%, #000 20%, transparent 75%)' }} />
        <div className="absolute -top-20 -left-20 w-[40rem] h-[34rem] rounded-full bg-lime-500/[0.07] blur-[150px]" />
      </div>

      <div className="absolute top-5 left-5 z-10">
        <Link href="/" className="inline-flex items-center gap-2 panel rounded-xl px-3 py-2 mono-label text-[0.55rem] text-muted hover:text-fg transition-colors group">
          <ArrowLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Home
        </Link>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-5 sm:p-8">
        <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left welcome */}
          <div className="hidden lg:flex flex-col justify-center">
            <BrandMark href="/" />
            <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-lime-500/25 bg-lime-500/[0.06] px-3 py-1.5 w-fit">
              <span className="live-dot" />
              <span className="mono-label text-[0.5rem] text-lime-300">Returning host</span>
            </div>
            <h2 className="font-display text-4xl font-extrabold mt-5 leading-tight">Back to the<br /><span className="text-lime-400">control room.</span></h2>
            <p className="text-muted mt-4 max-w-sm leading-relaxed">Pick up exactly where you left off — your rooms, chats, and recordings are ready.</p>

            <div className="mt-9 space-y-3">
              {perks.map((p) => (
                <div key={p.title} className="flex items-start gap-3.5 rounded-2xl border border-white/8 bg-white/[0.015] p-4">
                  <div className="w-9 h-9 rounded-lg border border-white/8 bg-white/[0.02] flex items-center justify-center text-lime-400 flex-shrink-0">
                    <p.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <p className="text-xs text-muted mt-0.5">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="panel rounded-3xl p-7 sm:p-8">
              <div className="lg:hidden mb-6"><BrandMark href="/" /></div>
              <h2 className="font-display text-2xl font-bold">Sign in</h2>
              <p className="text-sm text-muted mt-1.5 mb-6">Welcome back — let's get you on air.</p>

              {error && (
                <div className="mb-5 rounded-xl border border-tally-500/30 bg-tally-500/10 p-3.5">
                  <p className="text-sm text-tally-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="identifier" className="mono-label text-[0.5rem] text-faint block mb-2">Email or username</label>
                  <div className="relative">
                    <UserIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'identifier' ? 'text-lime-400' : 'text-faint'}`} />
                    <input
                      id="identifier" name="identifier" type="text" required value={formData.identifier} onChange={handleChange}
                      onFocus={() => setFocusedField('identifier')} onBlur={() => setFocusedField('')}
                      className="field pl-10 pr-10 py-3 text-sm" placeholder="you@studio.com" disabled={isLoading}
                    />
                    {formData.identifier && <CheckCircleIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-lime-400" />}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mono-label text-[0.5rem] text-faint block mb-2">Password</label>
                  <div className="relative">
                    <LockClosedIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'password' ? 'text-lime-400' : 'text-faint'}`} />
                    <input
                      id="password" name="password" type="password" required value={formData.password} onChange={handleChange}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')}
                      className="field pl-10 pr-4 py-3 text-sm" placeholder="••••••••" disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 accent-lime-500" />
                    <span className="text-xs text-muted">Remember me</span>
                  </label>
                  <a href="#" className="mono-label text-[0.5rem] text-lime-400 hover:text-lime-300 transition-colors">Forgot?</a>
                </div>

                <button type="submit" disabled={isLoading || !formData.identifier || !formData.password} className="btn-live w-full rounded-xl py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? (<><LoadingSpinner size="small" className="mr-1" /> Signing in…</>) : (<>Sign in <ArrowRightIcon className="h-4 w-4" /></>)}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative flex items-center">
                  <div className="flex-1 border-t border-white/8" />
                  <span className="px-3 mono-label text-[0.45rem] text-faint">or continue with</span>
                  <div className="flex-1 border-t border-white/8" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => handleOAuthSignIn('google')} className="btn-ghost rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Google
                  </button>
                  <button type="button" onClick={() => handleOAuthSignIn('github')} className="btn-ghost rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 2.2C6.486 2.2 2 6.685 2 12.216c0 4.43 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112.017 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022.034 12.216C22.034 6.685 17.548 2.2 12.017 2.2z" /></svg>
                    GitHub
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted">
                  New here?{' '}
                  <Link href="/auth/register" className="text-lime-400 hover:text-lime-300 font-medium transition-colors">Create an account</Link>
                </p>
                <p className="mt-3 pt-3 border-t border-white/8 text-[0.7rem] text-faint">
                  By signing in you agree to our{' '}
                  <Link href="/terms" className="text-muted hover:text-lime-300">Terms</Link> and{' '}
                  <Link href="/privacy" className="text-muted hover:text-lime-300">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
