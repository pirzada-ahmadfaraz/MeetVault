import axios, { AxiosResponse } from 'axios'
import { 
  User, 
  Meeting, 
  ChatMessage, 
  AuthResponse, 
  ApiResponse, 
  PaginatedResponse,
  LoginCredentials,
  RegisterCredentials,
  CreateMeetingData,
  JoinMeetingData,
  SendMessageData
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', credentials)
    return response.data
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
    const response: AxiosResponse<ApiResponse<{ token: string; refreshToken: string }>> = await api.post('/auth/refresh-token', { refreshToken })
    return response.data
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.get('/auth/profile')
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.put('/auth/profile', data)
    return response.data
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.post('/auth/logout')
    return response.data
  }
}

// Meeting API
export const meetingAPI = {
  createMeeting: async (data: CreateMeetingData): Promise<ApiResponse<Meeting>> => {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.post('/meetings', data)
    return response.data
  },

  getMeeting: async (meetingId: string): Promise<ApiResponse<Meeting>> => {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.get(`/meetings/${meetingId}`)
    return response.data
  },

  joinMeeting: async (meetingId: string, data?: JoinMeetingData): Promise<ApiResponse<Meeting>> => {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.post(`/meetings/${meetingId}/join`, data || {})
    return response.data
  },

  leaveMeeting: async (meetingId: string): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.post(`/meetings/${meetingId}/leave`)
    return response.data
  },

  startMeeting: async (meetingId: string): Promise<ApiResponse<Meeting>> => {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.post(`/meetings/${meetingId}/start`)
    return response.data
  },

  endMeeting: async (meetingId: string): Promise<ApiResponse<Meeting>> => {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.post(`/meetings/${meetingId}/end`)
    return response.data
  },

  getUserMeetings: async (page = 1, limit = 10, status = 'all'): Promise<PaginatedResponse<Meeting>> => {
    const response: AxiosResponse<PaginatedResponse<Meeting>> = await api.get('/meetings/my-meetings', {
      params: { page, limit, status }
    })
    return response.data
  },

  getActiveMeetings: async (): Promise<ApiResponse<Meeting[]>> => {
    const response: AxiosResponse<ApiResponse<Meeting[]>> = await api.get('/meetings/active')
    return response.data
  },

  updateMeetingSettings: async (meetingId: string, settings: Partial<Meeting['settings']>): Promise<ApiResponse<Meeting>> => {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.put(`/meetings/${meetingId}/settings`, settings)
    return response.data
  }
}

// Chat API
export const chatAPI = {
  sendMessage: async (meetingId: string, data: SendMessageData): Promise<ApiResponse<ChatMessage>> => {
    const response: AxiosResponse<ApiResponse<ChatMessage>> = await api.post(`/chat/meetings/${meetingId}/messages`, data)
    return response.data
  },

  getMessages: async (meetingId: string, page = 1, limit = 50): Promise<PaginatedResponse<ChatMessage>> => {
    const response: AxiosResponse<PaginatedResponse<ChatMessage>> = await api.get(`/chat/meetings/${meetingId}/messages`, {
      params: { page, limit }
    })
    return response.data
  },

  editMessage: async (messageId: string, content: string): Promise<ApiResponse<ChatMessage>> => {
    const response: AxiosResponse<ApiResponse<ChatMessage>> = await api.put(`/chat/messages/${messageId}`, { content })
    return response.data
  },

  deleteMessage: async (messageId: string): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.delete(`/chat/messages/${messageId}`)
    return response.data
  },

  addReaction: async (messageId: string, emoji: string): Promise<ApiResponse<ChatMessage>> => {
    const response: AxiosResponse<ApiResponse<ChatMessage>> = await api.post(`/chat/messages/${messageId}/reactions`, { emoji })
    return response.data
  },

  removeReaction: async (messageId: string, emoji: string): Promise<ApiResponse<ChatMessage>> => {
    const response: AxiosResponse<ApiResponse<ChatMessage>> = await api.delete(`/chat/messages/${messageId}/reactions`, { data: { emoji } })
    return response.data
  },

  markAsRead: async (messageId: string): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.post(`/chat/messages/${messageId}/read`)
    return response.data
  },

  getUnreadCount: async (meetingId: string): Promise<ApiResponse<{ unreadCount: number }>> => {
    const response: AxiosResponse<ApiResponse<{ unreadCount: number }>> = await api.get(`/chat/meetings/${meetingId}/unread-count`)
    return response.data
  }
}

// Health check
export const healthAPI = {
  check: async (): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/health')
    return response.data
  }
}

export default api