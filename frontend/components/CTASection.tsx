import Link from 'next/link'
import {
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const benefits = [
  {
    icon: SparklesIcon,
    title: 'Modern Tech Stack',
    description: 'Built with Next.js, TypeScript, and TailwindCSS'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Authentication',
    description: 'JWT-based auth with protected routes'
  },
  {
    icon: ClockIcon,
    title: 'Real-time Features',
    description: 'WebRTC and Socket.io for live communication'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Responsive Design',
    description: 'Mobile-first approach with modern UI'
  }
]

export default function CTASection() {
  return (
    <section className="py-24 bg-indigo-600 relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to <span className="text-indigo-200">Transform</span> your meetings?
          </h2>
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-4xl mx-auto">
            Join thousands of teams already using MeetVault for seamless collaboration.
            Experience the future of remote work today.
          </p>

          {/* Benefits grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-indigo-100 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Primary CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/auth/register"
              className="group bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-all duration-200 shadow-lg"
            >
              <span className="flex items-center gap-2 justify-center">
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/auth/login"
              className="group border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-200"
            >
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}