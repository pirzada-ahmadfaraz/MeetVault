import Link from 'next/link'
import { 
  CheckIcon,
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
    <section className="py-24 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to{' '}
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
              Transform
            </span>
            {' '}your meetings?
          </h2>
          <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-4xl mx-auto">
            Join thousands of teams already using MeetVault for seamless collaboration.
            Experience the future of remote work today.
          </p>

          {/* Benefits grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-emerald-100 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Primary CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/auth/register"
              className="group bg-white text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/auth/login"
              className="group border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-emerald-600 transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </span>
            </Link>
          </div>

          
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  )
}