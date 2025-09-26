'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={28}
                height={28}
                className="rounded-md"
                priority
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">MeetVault</span>
            </Link>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-gray-900 dark:text-white hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/meetings"
              className="text-gray-500 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Meetings
            </Link>
          </div>

          {/* User dropdown */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-2"
              >
                <div className="bg-blue-100 p-2 rounded-full">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    @{user?.username}
                  </p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-600 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserIcon className="h-4 w-4 mr-3" />
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700">
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