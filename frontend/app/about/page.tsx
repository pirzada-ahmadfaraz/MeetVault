'use client'

import Link from 'next/link'
import { ArrowLeftIcon, VideoCameraIcon, CodeBracketIcon, GlobeAltIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import BrandMark from '@/components/BrandMark'

export default function AboutPage() {
  const highlights = [
    { icon: VideoCameraIcon, title: 'Real-time communication', body: 'WebRTC and Socket.IO for video calls and instant messaging.' },
    { icon: CodeBracketIcon, title: 'Modern tech stack', body: 'Next.js, TypeScript, Tailwind, Node.js, MongoDB.' },
    { icon: GlobeAltIcon, title: 'Responsive design', body: 'Mobile-first, seamless across every device.' },
    { icon: UserGroupIcon, title: 'Secure auth', body: 'JWT-based authentication with protected routes.' },
  ]

  return (
    <div className="grain min-h-screen bg-ink text-fg">
      <div className="border-b border-white/8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 mono-label text-[0.55rem] text-muted hover:text-fg transition-colors">
            <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to home
          </Link>
          <BrandMark href="/" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-12">
          <p className="mono-label text-[0.6rem] text-lime-400 mb-5">// The project</p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-4">About <span className="text-lime-400">MeetVault</span></h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">A portfolio project demonstrating modern full-stack development and real-time communication.</p>
        </div>

        <div className="panel rounded-2xl p-8 mb-6">
          <h2 className="font-display text-2xl font-bold mb-4">Overview</h2>
          <p className="text-muted mb-7 leading-relaxed">
            MeetVault is a full-stack video conferencing application built to showcase modern web development and real-time communication — frontend and backend engineering, WebRTC, and responsive design.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-3.5 rounded-2xl border border-white/8 bg-white/[0.015] p-4">
                <div className="w-9 h-9 rounded-lg border border-white/8 bg-white/[0.02] flex items-center justify-center text-lime-400 flex-shrink-0"><h.icon className="h-4 w-4" /></div>
                <div>
                  <h3 className="font-semibold text-sm">{h.title}</h3>
                  <p className="text-xs text-muted mt-0.5">{h.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-2xl p-8 mb-6">
          <h2 className="font-display text-2xl font-bold mb-5">Technical implementation</h2>
          <div className="space-y-6">
            {[
              { h: 'Frontend', items: ['Next.js 15 App Router', 'TypeScript for type safety', 'TailwindCSS, utility-first', 'React Context for state', 'WebRTC for peer-to-peer video'] },
              { h: 'Backend', items: ['Node.js + Express REST API', 'Socket.IO real-time signaling', 'MongoDB persistence', 'JWT authentication', 'bcrypt password hashing'] },
              { h: 'Key features', items: ['Auth + protected routes', 'Multi-party video conferencing', 'Live chat with reactions', 'Screen sharing', 'Room creation & management'] },
            ].map((s) => (
              <div key={s.h}>
                <h3 className="mono-label text-[0.55rem] text-lime-300 mb-2.5">{s.h}</h3>
                <ul className="space-y-1.5">
                  {s.items.map((i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-muted"><span className="w-1 h-1 rounded-full bg-lime-400/70 flex-shrink-0" /> {i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold mb-4">About the developer</h2>
          <p className="text-muted mb-6 leading-relaxed">
            Built by Ahmad Faraz as a demonstration of full-stack capabilities — frontend and backend engineering, real-time protocols, and responsive interface design.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/register" className="btn-live rounded-xl px-6 py-3 font-semibold text-center">Try the app</Link>
            <a href="https://github.com/pirzada-ahmadfaraz/MeetVault" target="_blank" rel="noopener noreferrer" className="btn-ghost rounded-xl px-6 py-3 font-semibold text-center">View source</a>
          </div>
        </div>
      </div>
    </div>
  )
}
