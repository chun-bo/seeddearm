import type { User, Project, DoubaoApiResponse } from '@/types'

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock用户数据
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    username: 'demo',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// Mock项目数据
const mockProjects: Project[] = [
  {
    id: '1',
    userId: '1',
    title: '示例项目',
    description: '这是一个示例项目',
    prompt: '将两张图片融合成一张艺术作品',
    status: 'completed',
    resultImageUrl: 'https://via.placeholder.com/512x512',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export const mockApi = {
  // 用户认证
  async login(email: string, password: string): Promise<User> {
    await delay(1000)
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      throw new Error('用户不存在')
    }
    return user
  },

  async register(email: string, password: string, username: string): Promise<User> {
    await delay(1000)
    const newUser: User = {
      id: Date.now().toString(),
      email,
      username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    return newUser
  },

  // 项目管理
  async getProjects(userId: string): Promise<Project[]> {
    await delay(500)
    return mockProjects.filter(p => p.userId === userId)
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    await delay(1000)
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockProjects.push(newProject)
    return newProject
  },

  // Doubao API模拟
  async submitFusionTask(prompt: string, images: string[]): Promise<DoubaoApiResponse> {
    await delay(2000)
    return {
      taskId: Date.now().toString(),
      status: 'processing',
    }
  },

  async getTaskStatus(taskId: string): Promise<DoubaoApiResponse> {
    await delay(1000)
    // 模拟任务完成
    return {
      taskId,
      status: 'completed',
      resultUrl: 'https://via.placeholder.com/512x512',
    }
  },
}