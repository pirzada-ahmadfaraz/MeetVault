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

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center">
        <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 mono-label text-[0.45rem] text-muted">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        {!isOwn && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-500/15 border border-lime-500/25 flex items-center justify-center text-lime-300 text-xs font-display font-bold">
            {getInitials(message.sender.firstName, message.sender.lastName)}
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-fg">{message.sender.firstName} {message.sender.lastName}</span>
              <span className="mono-label text-[0.4rem] text-faint">{formatTime(message.createdAt)}</span>
            </div>
          )}

          <div className={`px-3.5 py-2 rounded-2xl text-sm ${isOwn ? 'bg-lime-sheen text-[#11160a] rounded-br-md' : 'bg-surface-2 text-fg border border-white/8 rounded-bl-md'}`}>
            {message.replyTo && (
              <div className={`text-xs mb-1 ${isOwn ? 'text-[#11160a]/70' : 'text-faint'}`}>
                Replying to: {message.replyTo.content.substring(0, 50)}{message.replyTo.content.length > 50 ? '…' : ''}
              </div>
            )}
            <div className="whitespace-pre-wrap break-words">
              {message.isDeleted ? (
                <em className={isOwn ? 'text-[#11160a]/70' : 'text-faint'}>This message was deleted</em>
              ) : (
                message.content
              )}
            </div>
            {message.isEdited && !message.isDeleted && (
              <div className={`text-[0.65rem] mt-1 ${isOwn ? 'text-[#11160a]/60' : 'text-faint'}`}>(edited)</div>
            )}
          </div>

          {isOwn && <span className="mono-label text-[0.4rem] text-faint mt-1">{formatTime(message.createdAt)}</span>}

          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(message.reactionSummary || {}).map(([emoji, data]) => (
                <div key={emoji} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs flex items-center gap-1 hover:bg-white/10 transition-colors">
                  <span>{emoji}</span>
                  <span className="text-muted">{data.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
