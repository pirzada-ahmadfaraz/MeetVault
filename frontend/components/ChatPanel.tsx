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
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const newMessageCallbackRef = useRef<((message: ChatMessage) => void) | null>(null)
  const typingStartCallbackRef = useRef<(({ userId, user }: { userId: string; user: any }) => void) | null>(null)
  const typingStopCallbackRef = useRef<(({ userId }: { userId: string }) => void) | null>(null)

  useEffect(() => {
    loadMessages()
    setupSocketListeners()

    return () => {
      // Clean up socket listeners with specific callbacks
      if (newMessageCallbackRef.current) {
        socketService.off('new-message', newMessageCallbackRef.current)
      }
      if (typingStartCallbackRef.current) {
        socketService.off('user-typing-start', typingStartCallbackRef.current)
      }
      if (typingStopCallbackRef.current) {
        socketService.off('user-typing-stop', typingStopCallbackRef.current)
      }

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      console.log('🧹 ChatPanel: Cleaned up socket listeners for meeting:', meetingId)
    }
  }, [meetingId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) setIsLoading(true)

      // Load more messages per page to ensure history is preserved
      const response = await chatAPI.getMessages(meetingId, page, 100)

      if (response.success) {
        const newMessages = response.data.reverse() // API returns newest first, we want oldest first

        if (append) {
          // Append older messages to the beginning
          setMessages(prev => [...newMessages, ...prev])
        } else {
          // Replace all messages (initial load)
          setMessages(newMessages)
        }

        // Check if there are more messages
        setHasMoreMessages(response.data.length === 100)
        setCurrentPage(page)
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
    // Clean up existing listeners first
    if (newMessageCallbackRef.current) {
      socketService.off('new-message', newMessageCallbackRef.current)
    }
    if (typingStartCallbackRef.current) {
      socketService.off('user-typing-start', typingStartCallbackRef.current)
    }
    if (typingStopCallbackRef.current) {
      socketService.off('user-typing-stop', typingStopCallbackRef.current)
    }

    // Create new callback functions and store references
    newMessageCallbackRef.current = (message: ChatMessage) => {
      console.log('📬 ChatPanel: Received new message:', message.content)
      setMessages(prev => {
        // Check if this is replacing an optimistic message (from the same user)
        const optimisticIndex = prev.findIndex(msg =>
          msg._id.startsWith('temp-') &&
          msg.content === message.content &&
          msg.sender._id === message.sender._id
        )

        if (optimisticIndex !== -1) {
          console.log('📬 ChatPanel: Replacing optimistic message with real message')
          // Replace the optimistic message with the real one
          const newMessages = [...prev]
          newMessages[optimisticIndex] = message
          return newMessages
        }

        // Prevent duplicate messages
        const isDuplicate = prev.some(msg => msg._id === message._id)
        if (isDuplicate) {
          console.log('📬 ChatPanel: Duplicate message detected, ignoring')
          return prev
        }

        const newMessages = [...prev, message]
        console.log('📬 ChatPanel: Updated messages count:', newMessages.length)
        return newMessages
      })
    }

    typingStartCallbackRef.current = ({ userId, user: typingUser }) => {
      if (userId !== user?._id) {
        console.log('⌨️ ChatPanel: User started typing:', typingUser.username)
        setTypingUsers(prev => new Set([...prev, typingUser.username]))
      }
    }

    typingStopCallbackRef.current = ({ userId }) => {
      console.log('⌨️ ChatPanel: User stopped typing:', userId)
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        // Clear typing users after a timeout since we don't have username mapping
        setTimeout(() => {
          setTypingUsers(new Set())
        }, 1000)
        return newSet
      })
    }

    // Set up listeners with the new callbacks
    socketService.onNewMessage(newMessageCallbackRef.current)
    socketService.onUserTypingStart(typingStartCallbackRef.current)
    socketService.onUserTypingStop(typingStopCallbackRef.current)

    console.log('🔌 ChatPanel: Socket listeners set up for meeting:', meetingId)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || isSending || !user) return

    setIsSending(true)
    const messageContent = newMessage.trim()
    const tempId = `temp-${Date.now()}-${Math.random()}`

    // Optimistic update - add message immediately to UI
    const optimisticMessage: ChatMessage = {
      _id: tempId,
      content: messageContent,
      sender: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      meeting: meetingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageType: 'text',
      isDeleted: false,
      isEdited: false,
      editedAt: null,
      deletedAt: null,
      replyTo: null,
      readBy: [],
      reactions: [],
      reactionSummary: {}
    }

    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')

    try {
      console.log('📤 ChatPanel: Sending message via socket:', messageContent)
      // Send via Socket.IO for real-time delivery
      socketService.sendMessage(meetingId, messageContent)

    } catch (error: any) {
      console.error('❌ ChatPanel: Error sending message:', error)
      setError('Failed to send message')

      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId))

      // Restore message content
      setNewMessage(messageContent)
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
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="medium" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-900">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900/20 border-b border-red-800/30">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-red-300 hover:text-red-200 text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {/* Load More Messages Button */}
        {hasMoreMessages && messages.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => loadMessages(currentPage + 1, true)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More Messages'}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-gray-300">No messages yet</p>
            <p className="text-xs text-gray-500">Start the conversation!</p>
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
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-300">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-colors"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center min-w-[44px] justify-center"
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