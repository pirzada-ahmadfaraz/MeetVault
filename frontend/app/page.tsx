'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import LandingNavbar from '@/components/LandingNavbar'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function HomePage() {
  const { user } = useAuth()

  // If user is logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard'
    }
  }, [user])

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gray-900">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  )
}