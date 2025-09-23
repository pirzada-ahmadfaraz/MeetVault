'use client'

import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to MeetVault! These Terms of Service ("Terms") govern your use of 
              the MeetVault video conferencing platform ("Service") operated by us ("Company", "we", 
              "our", or "us"). This is a portfolio project for demonstration purposes.
            </p>
            <p className="text-gray-600">
              By accessing or using our Service, you agree to be bound by these Terms. 
              If you disagree with any part of these terms, then you may not access the Service.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Registration</h2>
            <p className="text-gray-600 mb-4">
              To use certain features of our Service, you must create an account:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 13 years old to create an account</li>
              <li>One person or legal entity may not maintain more than one account</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptable Use</h2>
            <p className="text-gray-600 mb-4">
              You agree to use MeetVault responsibly and in compliance with all applicable laws:
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You MAY:</h3>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Use the Service for legitimate business and personal communication</li>
              <li>Host video conferences with invited participants</li>
              <li>Share your screen for presentations and collaboration</li>
              <li>Use chat features for meeting-related discussions</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">You MAY NOT:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Use the Service for any unlawful or fraudulent activities</li>
              <li>Share inappropriate, offensive, or harmful content</li>
              <li>Attempt to hack, disrupt, or compromise the Service</li>
              <li>Record meetings without consent from all participants</li>
              <li>Use the Service to spam, harass, or abuse other users</li>
              <li>Violate any intellectual property rights</li>
            </ul>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Availability</h2>
            <p className="text-gray-600 mb-4">
              We strive to provide reliable service, but please note:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>The Service is provided "as is" without warranties</li>
              <li>We may experience downtime for maintenance or technical issues</li>
              <li>Service availability may vary based on your internet connection</li>
              <li>We reserve the right to modify or discontinue features</li>
              <li>This is a demonstration project and may have limited functionality</li>
            </ul>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy and Data</h2>
            <p className="text-gray-600 mb-4">
              Your privacy is important to us:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Video calls are encrypted and not stored on our servers</li>
              <li>Chat messages are temporarily stored and automatically deleted</li>
              <li>We collect minimal personal information as outlined in our Privacy Policy</li>
              <li>You retain ownership of content you create or share</li>
              <li>We will not access your private meetings without consent</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              Intellectual property rights are clearly defined:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>The Service and its original content are owned by us</li>
              <li>You retain rights to content you upload or share</li>
              <li>You grant us a license to process your content to provide the Service</li>
              <li>You may not copy, modify, or redistribute our software</li>
              <li>Our trademarks and logos may not be used without permission</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              Our liability is limited as follows:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>We are not liable for any indirect or consequential damages</li>
              <li>Our total liability shall not exceed the amount you paid us (if any)</li>
              <li>We are not responsible for third-party content or services</li>
              <li>You use the Service at your own risk</li>
              <li>This is a portfolio project provided for demonstration purposes</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
            <p className="text-gray-600 mb-4">
              Account termination may occur under these circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>You may delete your account at any time</li>
              <li>We may suspend accounts for Terms violations</li>
              <li>We may terminate the Service with reasonable notice</li>
              <li>Upon termination, your access to the Service will cease</li>
              <li>Data deletion will occur according to our Privacy Policy</li>
            </ul>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these Terms at any time. We will notify users 
              of material changes by posting the updated Terms on our website and updating 
              the "Last updated" date. Your continued use of the Service after changes 
              constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">
                <strong>Email:</strong> legal@meetvault.demo<br/>
                <strong>Note:</strong> This is a portfolio project - the email is for demonstration purposes only.
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Portfolio Project Disclaimer</h2>
            <p className="text-yellow-700 text-sm">
              <strong>Important:</strong> MeetVault is a portfolio project created for 
              demonstration purposes. While functional, it should not be used for sensitive 
              business communications or confidential meetings. This Terms of Service 
              document is created to showcase legal document writing skills and may not 
              constitute legally binding terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}