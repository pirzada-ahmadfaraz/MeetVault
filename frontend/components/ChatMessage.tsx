import { ChatMessage as ChatMessageType } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface ChatMessageProps {
  message: ChatMessageType
  isOwn: boolean
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm border border-gray-700">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-lg">
              {getInitials(message.sender.firstName, message.sender.lastName)}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender name and time */}
          {!isOwn && (
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-white">
                {message.sender.firstName} {message.sender.lastName}
              </span>
              <span className="text-xs text-gray-400">
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`px-4 py-2 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-md'
            }`}
          >
            {/* Reply indicator */}
            {message.replyTo && (
              <div className={`text-xs mb-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                Replying to: {message.replyTo.content.substring(0, 50)}
                {message.replyTo.content.length > 50 ? '...' : ''}
              </div>
            )}

            {/* Message content */}
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.isDeleted ? (
                <em className={isOwn ? 'text-blue-200' : 'text-gray-400'}>
                  This message was deleted
                </em>
              ) : (
                message.content
              )}
            </div>

            {/* Edited indicator */}
            {message.isEdited && !message.isDeleted && (
              <div className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                (edited)
              </div>
            )}
          </div>

          {/* Time for own messages */}
          {isOwn && (
            <span className="text-xs text-gray-400 mt-1">
              {formatTime(message.createdAt)}
            </span>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(message.reactionSummary || {}).map(([emoji, data]) => (
                <div
                  key={emoji}
                  className="bg-gray-700 border border-gray-600 rounded-full px-2 py-1 text-xs flex items-center space-x-1 hover:bg-gray-600 transition-colors"
                >
                  <span>{emoji}</span>
                  <span className="text-gray-300">{data.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}