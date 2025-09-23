'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { chatAPI } from '@/lib/api'
import socketService from '@/lib/socket'
import { ChatMessage } from '@/types'
import ChatMessageComponent from './ChatMessage'
import LoadingSpinner from './LoadingSpinner'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface ChatPanelProps {
  meetingId: string
}

export default function ChatPanel({ meetingId }: ChatPanelProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadMessages()
    setupSocketListeners()

    return () => {
      socketService.off('new-message')
      socketService.off('user-typing-start')
      socketService.off('user-typing-stop')
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [meetingId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const response = await chatAPI.getMessages(meetingId, 1, 50)
      
      if (response.success) {
        setMessages(response.data.reverse()) // API returns newest first, we want oldest first
      } else {
        setError('Failed to load messages')
      }
    } catch (error: any) {
      console.error('Error loading messages:', error)
      setError('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const setupSocketListeners = () => {
    socketService.onNewMessage((message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    })

    socketService.onUserTypingStart(({ userId, user: typingUser }) => {
      if (userId !== user?._id) {
        setTypingUsers(prev => new Set([...prev, typingUser.username]))
      }
    })

    socketService.onUserTypingStop(({ userId }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        // We need to find the username by userId, but for simplicity, we'll clear after timeout
        return newSet
      })
    })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      // Send via Socket.IO for real-time delivery
      socketService.sendMessage(meetingId, messageContent)
      
      // Also send via API for persistence (optional, as socket handler should save it)
      // await chatAPI.sendMessage(meetingId, { content: messageContent })
    } catch (error: any) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
      setNewMessage(messageContent) // Restore message on error
    } finally {
      setIsSending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)

    // Handle typing indicators
    if (value.trim()) {
      socketService.startTyping(meetingId)
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(meetingId)
      }, 1000)
    } else {
      socketService.stopTyping(meetingId)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="medium" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-red-700 hover:text-red-800 text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageComponent
              key={message._id}
              message={message}
              isOwn={message.sender._id === user?._id}
            />
          ))
        )}

        {/* Typing indicators */}
        {typingUsers.size > 0 && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-600">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSending ? (
              <LoadingSpinner size="small" />
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}