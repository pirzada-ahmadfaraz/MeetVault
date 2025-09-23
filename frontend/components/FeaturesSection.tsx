import Link from 'next/link'
import { 
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CogIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: VideoCameraIcon,
    title: 'HD Video Calls',
    description: 'High-quality video calls with multiple participants and reliable connection.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Real-time Chat',
    description: 'Instant messaging during calls with emoji reactions and file sharing.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20'
  },
  {
    icon: ComputerDesktopIcon,
    title: 'Screen Sharing',
    description: 'Share your screen for presentations and collaborative work sessions.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20'
  },
  {
    icon: UserGroupIcon,
    title: 'Group Meetings',
    description: 'Host meetings with multiple participants and easy room management.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile Friendly',
    description: 'Responsive design that works seamlessly on desktop and mobile devices.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Meetings',
    description: 'Protected meeting rooms with user authentication and privacy controls.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Powerful{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need for productive remote collaboration. Built with cutting-edge
            technology to deliver exceptional user experiences.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-modern rounded-xl p-6 hover-lift group relative overflow-hidden"
            >
              <div className={`relative w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}