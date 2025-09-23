'use client'

import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-4">
              This Privacy Policy describes how MeetVault ("we", "our", or "us") collects, 
              uses, and protects your information when you use our video conferencing service. 
              This is a portfolio project for demonstration purposes.
            </p>
            <p className="text-gray-600">
              By using MeetVault, you agree to the collection and use of information in 
              accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Name and email address when you create an account</li>
              <li>Profile information you choose to provide</li>
              <li>Meeting participation data (meeting IDs, duration, participants)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Information</h3>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location information</li>
              <li>Log data (access times, pages viewed, errors)</li>
              <li>Meeting usage statistics and performance metrics</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>To provide and maintain our video conferencing service</li>
              <li>To create and manage your user account</li>
              <li>To facilitate video calls and messaging between users</li>
              <li>To improve our service quality and user experience</li>
              <li>To send important service notifications and updates</li>
              <li>To ensure security and prevent unauthorized access</li>
              <li>To comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection & Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>End-to-end encryption for video calls and messages</li>
              <li>Secure password hashing using industry-standard algorithms</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Limited access to personal data on a need-to-know basis</li>
              <li>Secure data transmission using HTTPS/SSL protocols</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information to third parties. 
              We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>With your explicit consent</li>
              <li>To comply with legal requirements or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>In case of business transfer or merger (with prior notice)</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your personal information only as long as necessary:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Account information: Until you delete your account</li>
              <li>Meeting data: 30 days after the meeting ends</li>
              <li>Chat messages: 90 days or until manually deleted</li>
              <li>Log data: 12 months for security and performance analysis</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the following rights regarding your data:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Access: Request a copy of your personal data</li>
              <li>Correction: Update or correct inaccurate information</li>
              <li>Deletion: Request deletion of your personal data</li>
              <li>Portability: Request your data in a portable format</li>
              <li>Objection: Object to certain processing of your data</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">
                <strong>Email:</strong> privacy@meetvault.demo<br/>
                <strong>Note:</strong> This is a portfolio project - the email is for demonstration purposes only.
              </p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new Privacy Policy on this page and updating the 
              "Last updated" date. You are advised to review this Privacy Policy periodically 
              for any changes.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}