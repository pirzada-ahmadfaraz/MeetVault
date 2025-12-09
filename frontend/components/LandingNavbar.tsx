'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  VideoCameraIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <VideoCameraIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MeetVault</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-slate-300 hover:text-indigo-400 transition-colors">
              Features
            </Link>

            <Link href="/about" className="text-slate-300 hover:text-indigo-400 transition-colors">
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-slate-300 hover:text-indigo-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-300 hover:text-white"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-slate-300 hover:text-indigo-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>

              <Link
                href="/about"
                className="text-slate-300 hover:text-indigo-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-slate-800">
                <Link
                  href="/auth/login"
                  className="block text-slate-300 hover:text-indigo-400 transition-colors mb-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}