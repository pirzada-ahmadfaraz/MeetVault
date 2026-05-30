'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import LandingNavbar from '@/components/LandingNavbar'
import HeroSection from '@/components/HeroSection'
import StatsSection from '@/components/StatsSection'
import FeaturesSection from '@/components/FeaturesSection'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function HomePage() {
  const { user } = useAuth()

  useEffect(() => {
    if (user) window.location.href = '/dashboard'
  }, [user])

  return (
    <div className="grain min-h-screen bg-ink text-fg">
      <LandingNavbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  )
}
