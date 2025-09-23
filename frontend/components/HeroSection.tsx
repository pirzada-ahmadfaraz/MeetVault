import Link from 'next/link'
import { 
  PlayIcon,
  VideoCameraIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              The Future of{' '}
              <span className="gradient-text-animated">
                Remote Collaboration
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-300 leading-relaxed">
              Experience seamless video communication with crystal-clear quality,
              real-time collaboration tools, and secure connections. Built for teams
              who demand excellence in their remote work experience.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link
                href="/auth/register"
                className="group bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-gray-400 text-sm">256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-gray-400 text-sm">HD Quality</span>
              </div>
            </div>

          </div>

          {/* Right content - Product showcase */}
          <div className="relative lg:ml-8">
            {/* Main dashboard mockup */}
            <div className="relative bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
              {/* Fake browser bar */}
              <div className="bg-gray-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-gray-600 rounded mx-4 py-1 px-3 text-sm text-gray-300">
                  meetvault.app/meeting/abc123
                </div>
              </div>

              {/* Meeting interface mockup */}
              <div className="bg-gray-900 p-4">
                {/* Video grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative text-white text-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                          <VideoCameraIcon className="h-6 w-6" />
                        </div>
                        <div className="text-xs font-medium">User {i}</div>
                      </div>
                      
                      {/* Status indicators */}
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
                          <VideoCameraIcon className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controls bar */}
                <div className="flex justify-center gap-3">
                  {[
                    { icon: VideoCameraIcon, color: 'bg-gray-700' },
                    { icon: UserGroupIcon, color: 'bg-gray-700' },
                    { icon: ChatBubbleLeftRightIcon, color: 'bg-blue-600' },
                    { icon: ComputerDesktopIcon, color: 'bg-gray-700' },
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
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 glass rounded-lg shadow-xl p-4 w-64 animate-float-smooth">
              <div className="flex items-center gap-2 mb-3">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-white">Live Chat</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-2">
                <div className="bg-gray-700 rounded-lg p-2">
                  <div className="text-xs text-gray-400">Sarah</div>
                  <div className="text-sm text-white">Great presentation! 👏</div>
                </div>
                <div className="bg-blue-600 rounded-lg p-2 ml-8">
                  <div className="text-xs text-gray-200">You</div>
                  <div className="text-sm text-white">Thanks everyone!</div>
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <div className="flex-1 bg-gray-700 rounded px-2 py-1 text-xs text-gray-400">
                  Type a message...
                </div>
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -left-4 bottom-8 glass rounded-lg shadow-xl p-4 animate-pulse-glow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">12 Participants</div>
                  <div className="text-xs text-gray-400">Connected worldwide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(-16px); }
          50% { transform: translateY(-10px) translateX(-16px); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px) translateX(-16px); }
          50% { transform: translateY(-5px) translateX(-16px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}