'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  VideoCameraIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <VideoCameraIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">MeetVault</span>
            </Link>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-slate-900 dark:text-white hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/meetings"
              className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Meetings
            </Link>
          </div>

          {/* User dropdown */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 p-2"
              >
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full">
                  <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    @{user?.username}
                  </p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-slate-400" />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserIcon className="h-4 w-4 mr-3" />
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3" />
                      Settings
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}