// 用户相关类型
export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  id: string
  userId: string
  doubaoApiKey?: string
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  createdAt: string
  updatedAt: string
}

// 项目相关类型
export interface Project {
  id: string
  userId: string
  title: string
  description?: string
  prompt: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  resultImageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectImage {
  id: string
  projectId: string
  originalName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  order: number
  createdAt: string
}

// API相关类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface DoubaoApiRequest {
  prompt: string
  images: string[]
  model?: string
  parameters?: Record<string, any>
}

export interface DoubaoApiResponse {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  resultUrl?: string
  error?: string
}

// 上传相关类型
export interface UploadFile {
  id: string
  file: File
  preview: string
  status: 'uploading' | 'done' | 'error'
  progress: number
}

// 使用统计类型
export interface UsageStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalCost: number
  dailyStats: DailyUsage[]
}

export interface DailyUsage {
  date: string
  requests: number
  cost: number
}