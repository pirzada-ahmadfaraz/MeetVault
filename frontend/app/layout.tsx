import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/animations.css'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import AuthSessionProvider from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MeetVault - Connect & Collaborate',
  description: 'Modern video conferencing platform for seamless communication',
  icons: {
    icon: [
      {
        url: '/icon.png',
        sizes: 'any',
      },
      {
        url: '/favicon.ico',
        sizes: '16x16',
        type: 'image/x-icon',
      },
    ],
    apple: '/icon.png',
    shortcut: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}