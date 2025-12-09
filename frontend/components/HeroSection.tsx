import Link from 'next/link'
import {
  VideoCameraIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

export default function HeroSection() {
  return (
    <section className="relative bg-slate-950 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              The Future of{' '}
              <span className="text-indigo-400">
                Remote Collaboration
              </span>
            </h1>

            <p className="mt-6 text-xl text-slate-400 leading-relaxed">
              Experience seamless video communication with crystal-clear quality,
              real-time collaboration tools, and secure connections. Built for teams
              who demand excellence in their remote work experience.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex justify-center lg:justify-start gap-4">
              <Link
                href="/auth/register"
                className="group bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-600/25"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="#features"
                className="text-slate-300 px-8 py-4 rounded-lg text-lg font-semibold hover:text-white border border-slate-700 hover:border-slate-600 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-500 text-sm">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-slate-500 text-sm">256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span className="text-slate-500 text-sm">HD Quality</span>
              </div>
            </div>

          </div>

          {/* Right content - Product showcase */}
          <div className="relative lg:ml-8">
            {/* Main dashboard mockup */}
            <div className="relative bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-800">
              {/* Browser bar */}
              <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                </div>
                <div className="flex-1 bg-slate-700 rounded mx-4 py-1 px-3 text-sm text-slate-400">
                  meetvault.app/meeting/abc123
                </div>
              </div>

              {/* Meeting interface mockup */}
              <div className="bg-slate-950 p-4">
                {/* Video grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-700"
                    >
                      <div className="relative text-white text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-2">
                          <VideoCameraIcon className="h-6 w-6 text-slate-400" />
                        </div>
                        <div className="text-xs font-medium text-slate-400">User {i}</div>
                      </div>

                      {/* Status indicators */}
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center">
                          <VideoCameraIcon className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controls bar */}
                <div className="flex justify-center gap-3">
                  {[
                    { icon: VideoCameraIcon, color: 'bg-slate-700' },
                    { icon: UserGroupIcon, color: 'bg-slate-700' },
                    { icon: ChatBubbleLeftRightIcon, color: 'bg-indigo-600' },
                    { icon: ComputerDesktopIcon, color: 'bg-slate-700' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center`}
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 16l1-1m1-1l1 1m-1-1l-1-1m1 1v2.5a.5.5 0 00.5.5h1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chat widget */}
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-4 w-64">
              <div className="flex items-center gap-2 mb-3">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-500" />
                <span className="font-semibold text-white">Live Chat</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-800 rounded-lg p-2">
                  <div className="text-xs text-slate-500">Sarah</div>
                  <div className="text-sm text-white">Great presentation! 👏</div>
                </div>
                <div className="bg-indigo-600 rounded-lg p-2 ml-8">
                  <div className="text-xs text-indigo-200">You</div>
                  <div className="text-sm text-white">Thanks everyone!</div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <div className="flex-1 bg-slate-800 rounded px-2 py-1 text-xs text-slate-500">
                  Type a message...
                </div>
                <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -left-4 bottom-8 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">12 Participants</div>
                  <div className="text-xs text-slate-500">Connected worldwide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}