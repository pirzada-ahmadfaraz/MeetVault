import {
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: VideoCameraIcon,
    title: 'HD Video Calls',
    description: 'High-quality video calls with multiple participants and reliable connection.'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Real-time Chat',
    description: 'Instant messaging during calls with emoji reactions and file sharing.'
  },
  {
    icon: ComputerDesktopIcon,
    title: 'Screen Sharing',
    description: 'Share your screen for presentations and collaborative work sessions.'
  },
  {
    icon: UserGroupIcon,
    title: 'Group Meetings',
    description: 'Host meetings with multiple participants and easy room management.'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile Friendly',
    description: 'Responsive design that works seamlessly on desktop and mobile devices.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Meetings',
    description: 'Protected meeting rooms with user authentication and privacy controls.'
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Powerful <span className="text-indigo-400">Features</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Everything you need for productive remote collaboration. Built with cutting-edge
            technology to deliver exceptional user experiences.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-indigo-400" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>

              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}