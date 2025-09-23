'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types'
import { authAPI } from '@/lib/api'
import socketService from '@/lib/socket'
import { useSession } from 'next-auth/react'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<{ success: boolean; message: string }>
  logout: () => void
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
  }, [session, status])

  const initializeAuth = async () => {
    try {
      // Check for NextAuth session first
      if (session?.backendToken) {
        // User signed in with OAuth - use backend token from NextAuth
        localStorage.setItem('authToken', session.backendToken)
        if (session.refreshToken) {
          localStorage.setItem('refreshToken', session.refreshToken)
        }
        
        const response = await authAPI.getProfile()
        if (response.success) {
          setUser(response.data)
          
          // Connect to Socket.IO
          try {
            await socketService.connect(session.backendToken)
          } catch (error) {
            console.error('Socket connection failed during init:', error)
          }
        }
      } else if (status !== 'loading') {
        // Check for traditional auth token
        const token = localStorage.getItem('authToken')
        if (token) {
          const response = await authAPI.getProfile()
          if (response.success) {
            setUser(response.data)
            
            // Connect to Socket.IO
            try {
              await socketService.connect(token)
            } catch (error) {
              console.error('Socket connection failed during init:', error)
            }
          } else {
            // Invalid token, clear localStorage
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      // Clear invalid tokens
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
    } finally {
      if (status !== 'loading') {
        setIsLoading(false)
      }
    }
  }

  const login = async (identifier: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authAPI.login({ identifier, password })
      
      if (response.success) {
        // Store tokens
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        
        // Set user
        setUser(response.data.user)
        
        // Connect to Socket.IO
        try {
          await socketService.connect(response.data.token)
        } catch (error) {
          console.error('Socket connection failed:', error)
        }
        
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || 'Login failed. Please try again.'
      return { success: false, message }
    }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authAPI.register(userData)
      
      if (response.success) {
        // Store tokens
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        
        // Set user
        setUser(response.data.user)
        
        // Connect to Socket.IO
        try {
          await socketService.connect(response.data.token)
        } catch (error) {
          console.error('Socket connection failed:', error)
        }
        
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error: any) {
      console.error('Register error:', error)
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of API call success
      setUser(null)
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      
      // Disconnect socket
      socketService.disconnect()
    }
  }

  const refreshAuth = async () => {
    try {
      const response = await authAPI.getProfile()
      if (response.success) {
        setUser(response.data)
      }
    } catch (error) {
      console.error('Refresh auth error:', error)
      // If profile fetch fails, logout user
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isLoading
  }
}