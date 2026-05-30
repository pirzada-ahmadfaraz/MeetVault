'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { chatAPI } from '@/lib/api'
import socketService from '@/lib/socket'
import { ChatMessage } from '@/types'
import ChatMessageComponent from './ChatMessage'
import LoadingSpinner from './LoadingSpinner'
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

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
      if (newMessageCallbackRef.current) socketService.off('new-message', newMessageCallbackRef.current)
      if (typingStartCallbackRef.current) socketService.off('user-typing-start', typingStartCallbackRef.current)
      if (typingStopCallbackRef.current) socketService.off('user-typing-stop', typingStopCallbackRef.current)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId])

  useEffect(() => { scrollToBottom() }, [messages])

  const loadMessages = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) setIsLoading(true)
      const response = await chatAPI.getMessages(meetingId, page, 100)
      if (response.success) {
        const sortedMessages = response.data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        if (append) setMessages((prev) => [...sortedMessages, ...prev])
        else setMessages(sortedMessages)
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
    if (newMessageCallbackRef.current) socketService.off('new-message', newMessageCallbackRef.current)
    if (typingStartCallbackRef.current) socketService.off('user-typing-start', typingStartCallbackRef.current)
    if (typingStopCallbackRef.current) socketService.off('user-typing-stop', typingStopCallbackRef.current)

    newMessageCallbackRef.current = (message: ChatMessage) => {
      setMessages((prev) => {
        const optimisticIndex = prev.findIndex((msg) => msg._id.startsWith('temp-') && msg.content === message.content && msg.sender._id === message.sender._id)
        if (optimisticIndex !== -1) {
          const newMessages = [...prev]
          newMessages[optimisticIndex] = message
          return newMessages
        }
        if (prev.some((msg) => msg._id === message._id)) return prev
        return [...prev, message]
      })
    }

    typingStartCallbackRef.current = ({ userId, user: typingUser }) => {
      if (userId !== user?._id) setTypingUsers((prev) => new Set([...prev, typingUser.username]))
    }

    typingStopCallbackRef.current = ({ userId }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev)
        setTimeout(() => setTypingUsers(new Set()), 1000)
        return newSet
      })
    }

    socketService.onNewMessage(newMessageCallbackRef.current)
    socketService.onUserTypingStart(typingStartCallbackRef.current)
    socketService.onUserTypingStop(typingStopCallbackRef.current)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending || !user) return
    setIsSending(true)
    const messageContent = newMessage.trim()
    const tempId = `temp-${Date.now()}-${Math.random()}`

    const optimisticMessage: ChatMessage = {
      _id: tempId, content: messageContent,
      sender: { _id: user._id, firstName: user.firstName, lastName: user.lastName, username: user.username, email: user.email, isActive: user.isActive, lastLogin: user.lastLogin, createdAt: user.createdAt, updatedAt: user.updatedAt },
      meeting: meetingId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      messageType: 'text', isDeleted: false, isEdited: false, editedAt: null, deletedAt: null, replyTo: null, readBy: [], reactions: [], reactionSummary: {},
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage('')

    try {
      socketService.sendMessage(meetingId, messageContent)
    } catch (error: any) {
      console.error('❌ ChatPanel: Error sending message:', error)
      setError('Failed to send message')
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId))
      setNewMessage(messageContent)
    } finally {
      setIsSending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)
    if (value.trim()) {
      socketService.startTyping(meetingId)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => socketService.stopTyping(meetingId), 1000)
    } else {
      socketService.stopTyping(meetingId)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <LoadingSpinner size="medium" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-surface min-h-0">
      {error && (
        <div className="p-3 bg-tally-500/10 border-b border-tally-500/20 flex items-center justify-between">
          <p className="text-sm text-tally-300">{error}</p>
          <button onClick={() => setError('')} className="mono-label text-[0.5rem] text-tally-300 hover:text-tally-200">Dismiss</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMoreMessages && messages.length > 0 && (
          <div className="text-center">
            <button onClick={() => loadMessages(currentPage + 1, true)} disabled={isLoading} className="btn-ghost rounded-lg px-4 py-2 mono-label text-[0.5rem]">
              {isLoading ? 'Loading…' : 'Load older messages'}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center justify-center text-faint mx-auto mb-3">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted">No messages yet</p>
            <p className="mono-label text-[0.45rem] text-faint mt-1">Start the conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageComponent key={message._id} message={message} isOwn={message.sender._id === user?._id} />
          ))
        )}

        {typingUsers.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/8 bg-white/[0.02] w-fit">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </span>
            <span className="text-xs text-muted">{Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/8 bg-surface-2/60">
        <form onSubmit={handleSendMessage} className="flex gap-2.5">
          <input type="text" value={newMessage} onChange={handleInputChange} placeholder="Type a message…" className="field flex-1 px-4 py-2.5 text-sm" disabled={isSending} />
          <button type="submit" disabled={!newMessage.trim() || isSending} className="btn-live rounded-xl px-4 flex items-center justify-center min-w-[44px] disabled:opacity-50 disabled:cursor-not-allowed">
            {isSending ? <LoadingSpinner size="small" /> : <PaperAirplaneIcon className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
