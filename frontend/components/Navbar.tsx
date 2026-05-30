'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import BrandMark from './BrandMark'

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const links = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Meetings', href: '/meetings' },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-white/8 bg-ink/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <BrandMark href="/dashboard" />
            <div className="hidden md:flex items-center gap-1">
              {links.map((l) => {
                const active = pathname === l.href
                return (
                  <Link key={l.name} href={l.href} className={`mono-label text-[0.58rem] px-3 py-2 rounded-lg transition-colors ${active ? 'text-lime-300 bg-lime-500/10' : 'text-muted hover:text-fg'}`}>
                    {l.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] hover:border-white/20 px-2 py-1.5 transition-colors">
              <span className="h-8 w-8 rounded-lg bg-lime-500/15 border border-lime-500/25 flex items-center justify-center text-lime-300 font-display font-bold text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
              <div className="hidden md:block text-left leading-tight">
                <p className="text-xs font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="mono-label text-[0.45rem] text-faint">@{user?.username}</p>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-faint" />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 panel rounded-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/8">
                    <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted truncate">{user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-fg hover:bg-white/5 transition-colors">
                      <UserIcon className="h-4 w-4" /> Profile
                    </Link>
                    <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-fg hover:bg-white/5 transition-colors">
                      <Cog6ToothIcon className="h-4 w-4" /> Settings
                    </Link>
                  </div>
                  <div className="p-1.5 border-t border-white/8">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-tally-400 hover:bg-tally-500/10 transition-colors">
                      <ArrowRightOnRectangleIcon className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
