import Link from 'next/link'
import { VideoCameraIcon } from '@heroicons/react/24/outline'

const navigation = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Sign Up', href: '/auth/register' },
    { name: 'Sign In', href: '/auth/login' }
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' }
  ]
}


export default function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <VideoCameraIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MeetVault</span>
            </div>
            
            <p className="text-gray-400 mb-6 max-w-md">
              A project showcasing modern video conferencing capabilities 
              built with Next.js, TypeScript, and real-time technologies.
            </p>
          </div>

          {/* Navigation sections */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="text-center">
            <div className="text-gray-400 text-sm">
              © 2025 Ahmad Faraz. Built with Next.js & TypeScript.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}