'use client'

import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { 
  VideoCameraIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              MeetVault
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A portfolio project demonstrating modern full-stack development 
            and real-time communication technologies.
          </p>
        </div>

        {/* Project Overview */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
          <p className="text-gray-600 mb-6">
            MeetVault is a full-stack video conferencing application built to showcase 
            modern web development skills and real-time communication technologies. 
            This project demonstrates proficiency in frontend and backend development, 
            WebRTC implementation, and responsive design.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <VideoCameraIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Real-time Communication</h3>
                <p className="text-gray-600 text-sm">WebRTC and Socket.io for video calls and instant messaging</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <CodeBracketIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Modern Tech Stack</h3>
                <p className="text-gray-600 text-sm">Next.js, TypeScript, TailwindCSS, Node.js, MongoDB</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Responsive Design</h3>
                <p className="text-gray-600 text-sm">Mobile-first approach with seamless cross-device experience</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">User Authentication</h3>
                <p className="text-gray-600 text-sm">JWT-based secure authentication with protected routes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Implementation</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Frontend</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Next.js 15 with App Router for server-side rendering and routing</li>
                <li>TypeScript for type safety and better development experience</li>
                <li>TailwindCSS for utility-first styling and responsive design</li>
                <li>React Context API for state management</li>
                <li>WebRTC for peer-to-peer video communication</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Backend</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Node.js with Express.js for RESTful API development</li>
                <li>Socket.io for real-time bidirectional communication</li>
                <li>MongoDB for data persistence and user management</li>
                <li>JWT (JSON Web Tokens) for secure authentication</li>
                <li>bcrypt for password hashing and security</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Features</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>User registration and authentication system</li>
                <li>Real-time video conferencing with multiple participants</li>
                <li>Instant messaging with emoji reactions</li>
                <li>Screen sharing capabilities</li>
                <li>Responsive design for desktop and mobile devices</li>
                <li>Meeting room creation and management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Developer Info */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Developer</h2>
          <p className="text-gray-600 mb-4">
            This project was developed by Ahmad Faraz as a demonstration of full-stack 
            development capabilities and modern web technologies. The application showcases 
            skills in both frontend and backend development, real-time communication protocols, 
            and responsive user interface design.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth/register"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-center"
            >
              Try the Application
            </Link>
            <a
              href="#"
              className="border border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-center"
            >
              View Source Code
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}