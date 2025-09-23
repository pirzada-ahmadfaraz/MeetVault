export interface User {
  _id: string
  username: string
  email: string
  firstName: string
  lastName: string
  fullName?: string
  profilePicture?: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export interface Meeting {
  _id: string
  meetingId: string
  title: string
  description?: string
  host: User
  participants: Participant[]
  isActive: boolean
  startTime: string | null
  endTime: string | null
  scheduledStartTime: string | null
  maxParticipants: number
  currentParticipantCount: number
  settings: MeetingSettings
  createdAt: string
  updatedAt: string
}

export interface Participant {
  _id: string
  user: User
  joinedAt: string
  leftAt: string | null
  isHost: boolean
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
}

export interface MeetingSettings {
  allowChat: boolean
  allowScreenShare: boolean
  requirePassword: boolean
  hasPassword?: boolean
  waitingRoom: boolean
  muteParticipantsOnEntry: boolean
}

export interface ChatMessage {
  _id: string
  meeting: string
  sender: User
  content: string
  messageType: 'text' | 'system' | 'file'
  isEdited: boolean
  editedAt: string | null
  isDeleted: boolean
  deletedAt: string | null
  replyTo: ChatMessage | null
  reactions: Reaction[]
  reactionSummary?: { [emoji: string]: { count: number; users: User[] } }
  readBy: { user: string; readAt: string }[]
  createdAt: string
  updatedAt: string
}

export interface Reaction {
  _id: string
  user: User
  emoji: string
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
    refreshToken: string
  }
  timestamp: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  message: string
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  timestamp: string
}

export interface LoginCredentials {
  identifier: string // email or username
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface CreateMeetingData {
  title: string
  description?: string
  scheduledStartTime?: string
  maxParticipants?: number
  settings?: Partial<MeetingSettings>
}

export interface JoinMeetingData {
  password?: string
}

export interface SendMessageData {
  content: string
  replyTo?: string
}