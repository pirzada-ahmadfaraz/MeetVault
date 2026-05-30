'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import BrandMark from './BrandMark'

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { name: 'Features', href: '#features' },
    { name: 'About', href: '/about' },
  ]

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${scrolled ? 'border-b border-white/8 bg-ink/70 backdrop-blur-xl' : 'border-b border-transparent'}`}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
        <BrandMark href="/" />

        <div className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <Link key={l.name} href={l.href} className="text-sm text-muted hover:text-fg transition-colors">
              {l.name}
            </Link>
          ))}
          <Link href="/auth/login" className="text-sm text-muted hover:text-fg transition-colors">Sign in</Link>
          <Link href="/auth/register" className="btn-solid rounded-full px-5 py-2 text-sm">Start a room</Link>
        </div>

        <button className="md:hidden text-muted hover:text-fg p-1" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/8 bg-ink/90 backdrop-blur-xl px-5 py-5 flex flex-col gap-4">
          {links.map((l) => (
            <Link key={l.name} href={l.href} onClick={() => setOpen(false)} className="text-sm text-muted hover:text-fg">{l.name}</Link>
          ))}
          <Link href="/auth/login" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-fg">Sign in</Link>
          <Link href="/auth/register" onClick={() => setOpen(false)} className="btn-solid rounded-full px-5 py-2.5 text-sm text-center">Start a room</Link>
        </div>
      )}
    </nav>
  )
}
