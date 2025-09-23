import { StarIcon } from '@heroicons/react/24/solid'
import { 
  UserCircleIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

const testimonials = [
  {
    name: 'Demo User',
    role: 'Developer',
    company: 'Portfolio Review',
    avatar: UserCircleIcon,
    rating: 5,
    content: 'Great example of modern video conferencing implementation. Clean UI and smooth functionality showcase excellent development skills.',
    companyIcon: BuildingOfficeIcon,
    gradient: 'from-emerald-500 to-cyan-500'
  },
  {
    name: 'Test Account',
    role: 'Designer',
    company: 'UI/UX Review',
    avatar: UserCircleIcon,
    rating: 5,
    content: 'The interface is intuitive and responsive. The design patterns and component structure demonstrate solid frontend expertise.',
    companyIcon: HeartIcon,
    gradient: 'from-teal-500 to-blue-500'
  },
  {
    name: 'Sample Reviewer',
    role: 'Tech Lead',
    company: 'Code Review',
    avatar: UserCircleIcon,
    rating: 5,
    content: 'Well-structured codebase with modern React patterns. The real-time features and responsive design are implemented professionally.',
    companyIcon: AcademicCapIcon,
    gradient: 'from-cyan-500 to-emerald-500'
  }
]

const stats = [
  { label: 'Technologies', value: '10+', description: 'modern tools used' },
  { label: 'Components', value: '25+', description: 'reusable UI elements' },
  { label: 'Features', value: '6+', description: 'core functionalities' },
  { label: 'Responsive', value: '100%', description: 'mobile friendly' }
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Project{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Overview
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A full-stack video conferencing application demonstrating modern web development 
            techniques and real-time communication technologies.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              {/* Stars */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                  <testimonial.avatar className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.role}
                  </div>
                  <div className="flex items-center mt-1">
                    <testimonial.companyIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-500 text-sm">
                      {testimonial.company}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section with tech stack */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="text-center mb-8">
            <p className="text-gray-500 font-medium">
              Built with modern technologies
            </p>
          </div>
          
          {/* Tech stack */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[
              'Next.js',
              'TypeScript', 
              'TailwindCSS',
              'Socket.io',
              'WebRTC',
              'Node.js'
            ].map((tech, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-12 px-6 bg-gray-100 rounded-lg font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}