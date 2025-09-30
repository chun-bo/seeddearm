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

// Doubao-Seedream API 完整类型定义
export interface SeedreamRequest {
  model: string
  prompt: string
  image?: string | string[]
  size?: string
  seed?: number
  sequential_image_generation?: 'auto' | 'disabled'
  sequential_image_generation_options?: {
    max_images?: number
  }
  stream?: boolean
  guidance_scale?: number
  response_format?: 'url' | 'b64_json'
  watermark?: boolean
}

export interface SeedreamResponse {
  model: string
  created: number
  data: Array<{
    url?: string
    b64_json?: string
    size: string
  }>
  usage: {
    generated_images: number
    output_tokens: number
    total_tokens: number
  }
}

export interface SeedreamError {
  error: {
    code: string
    message: string
  }
}

// 图片融合任务类型
export interface FusionTask {
  id: string
  userId: string
  title: string
  prompt: string
  images: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  result?: SeedreamResponse
  error?: string
  createdAt: string
  updatedAt: string
  // 任务配置
  config: {
    model: string
    size: string
    sequential_image_generation: 'auto' | 'disabled'
    max_images?: number
    response_format: 'url' | 'b64_json'
    watermark: boolean
  }
}

// 任务创建请求
export interface CreateFusionTaskRequest {
  title: string
  prompt: string
  images: string[]
  config?: Partial<FusionTask['config']>
}

// 废弃的旧类型（保持向后兼容）
/** @deprecated 使用 SeedreamRequest 替代 */
export interface DoubaoApiRequest {
  prompt: string
  images: string[]
  model?: string
  parameters?: Record<string, any>
}

/** @deprecated 使用 FusionTask 替代 */
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

// 图片融合模式枚举
export enum FusionMode {
  TEXT_TO_IMAGE = 'text_to_image',           // 文生图
  IMAGE_TO_IMAGE = 'image_to_image',         // 图文生图
  MULTI_IMAGE_FUSION = 'multi_image_fusion', // 多图融合
  IMAGE_SET_GENERATION = 'image_set_generation', // 组图生成
  SINGLE_IMAGE_TO_SET = 'single_image_to_set',   // 单图生组图
  MULTI_IMAGE_TO_SET = 'multi_image_to_set'      // 多图生组图
}

// 预设尺寸选项
export interface SizeOption {
  label: string
  value: string
  ratio: string
  pixels: string
}

export const PRESET_SIZES: SizeOption[] = [
  { label: '1:1 正方形', value: '2048x2048', ratio: '1:1', pixels: '2048x2048' },
  { label: '4:3 横屏', value: '2304x1728', ratio: '4:3', pixels: '2304x1728' },
  { label: '3:4 竖屏', value: '1728x2304', ratio: '3:4', pixels: '1728x2304' },
  { label: '16:9 宽屏', value: '2560x1440', ratio: '16:9', pixels: '2560x1440' },
  { label: '9:16 手机屏', value: '1440x2560', ratio: '9:16', pixels: '1440x2560' },
  { label: '3:2 相机', value: '2496x1664', ratio: '3:2', pixels: '2496x1664' },
  { label: '2:3 相机竖屏', value: '1664x2496', ratio: '2:3', pixels: '1664x2496' },
  { label: '21:9 超宽屏', value: '3024x1296', ratio: '21:9', pixels: '3024x1296' }
]