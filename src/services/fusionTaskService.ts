import type { 
  FusionTask, 
  CreateFusionTaskRequest, 
  SeedreamResponse,
  ApiResponse 
} from '@/types'
import { createSeedreamAPI } from './seedreamApi'

/**
 * 图片融合任务管理服务
 * 负责任务的创建、状态管理、结果处理等
 */
export class FusionTaskService {
  private tasks: Map<string, FusionTask> = new Map()
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 创建新的融合任务
   */
  async createTask(request: CreateFusionTaskRequest): Promise<FusionTask> {
    const taskId = this.generateTaskId()
    
    const task: FusionTask = {
      id: taskId,
      userId: 'current-user', // TODO: 从用户状态获取
      title: request.title,
      prompt: request.prompt,
      images: request.images,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: {
        model: 'doubao-seedream-4-0-250828',
        size: '2K',
        sequential_image_generation: 'disabled',
        response_format: 'url',
        watermark: true,
        ...request.config
      }
    }

    this.tasks.set(taskId, task)
    return task
  }

  /**
   * 提交任务到 Doubao API
   */
  async submitTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error('任务不存在')
    }

    try {
      // 更新任务状态为处理中
      this.updateTaskStatus(taskId, 'processing', 10)

      const api = createSeedreamAPI(this.apiKey)
      
      // 在调用 API 前转换图片
      const processedImages = await this.convertImagesToBase64(task.images);

      // 根据图片数量和配置选择合适的生成方法
      let result: SeedreamResponse

      if (processedImages.length === 0) {
        // 文生图
        result = await api.textToImage(task.prompt, {
          size: task.config.size,
          response_format: task.config.response_format,
          watermark: task.config.watermark
        })
      } else if (processedImages.length === 1 && task.config.sequential_image_generation === 'disabled') {
        // 单图生图
        result = await api.imageToImage(task.prompt, processedImages[0], {
          size: task.config.size,
          response_format: task.config.response_format,
          watermark: task.config.watermark
        })
      } else if (task.config.sequential_image_generation === 'auto') {
        // 组图生成
        result = await api.generateImageSet(
          task.prompt,
          task.config.max_images || 4,
          processedImages.length > 0 ? processedImages : undefined,
          {
            size: task.config.size,
            response_format: task.config.response_format,
            watermark: task.config.watermark
          }
        )
      } else {
        // 多图融合
        result = await api.fuseImages(task.prompt, processedImages, {
          size: task.config.size,
          response_format: task.config.response_format,
          watermark: task.config.watermark
        })
      }

      // 任务完成
      this.updateTaskResult(taskId, result)
      
    } catch (error) {
      console.error('任务执行失败:', error)
      this.updateTaskError(taskId, error instanceof Error ? error.message : '未知错误')
    }
  }

  /**
   * 使用流式 API 提交任务
   */
  async submitTaskWithStream(
    taskId: string,
    onProgress?: (progress: number, data?: any) => void
  ): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error('任务不存在')
    }

    try {
      this.updateTaskStatus(taskId, 'processing', 10)

      const api = createSeedreamAPI(this.apiKey)
      
      // 在调用 API 前转换图片
      const processedImages = await this.convertImagesToBase64(task.images);
      
      // 根据图片数量决定 image 参数的格式
      let imageParam: string | string[] | undefined;
      if (processedImages.length === 1) {
        imageParam = processedImages[0]; // 单图模式，使用字符串
      } else if (processedImages.length > 1) {
        imageParam = processedImages; // 多图模式，使用数组
      } else {
        imageParam = undefined; // 文生图模式
      }

      const result = await api.generateWithStream(
        {
          model: task.config.model,
          prompt: task.prompt,
          image: imageParam,
          size: task.config.size,
          sequential_image_generation: task.config.sequential_image_generation,
          sequential_image_generation_options: task.config.max_images ? {
            max_images: task.config.max_images
          } : undefined,
          response_format: task.config.response_format,
          watermark: task.config.watermark
        },
        (data) => {
          // 处理流式数据
          if (data.data && data.data.length > 0) {
            const progress = Math.min(90, 20 + (data.data.length * 20))
            this.updateTaskStatus(taskId, 'processing', progress)
            if (onProgress) {
              onProgress(progress, data)
            }
          }
        }
      )

      this.updateTaskResult(taskId, result)
      if (onProgress) {
        onProgress(100, result)
      }
      
    } catch (error) {
      console.error('流式任务执行失败:', error)
      this.updateTaskError(taskId, error instanceof Error ? error.message : '未知错误')
    }
  }

  /**
   * 获取任务详情
   */
  getTask(taskId: string): FusionTask | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): FusionTask[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  /**
   * 获取用户的任务列表
   */
  getUserTasks(userId: string): FusionTask[] {
    return this.getAllTasks().filter(task => task.userId === userId)
  }

  /**
   * 删除任务
   */
  deleteTask(taskId: string): boolean {
    return this.tasks.delete(taskId)
  }

  /**
   * 更新任务状态
   */
  private updateTaskStatus(
    taskId: string, 
    status: FusionTask['status'], 
    progress?: number
  ): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = status
      if (progress !== undefined) {
        task.progress = progress
      }
      task.updatedAt = new Date().toISOString()
      this.tasks.set(taskId, task)
    }
  }

  /**
   * 更新任务结果
   */
  private updateTaskResult(taskId: string, result: SeedreamResponse): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = 'completed'
      task.progress = 100
      task.result = result
      task.updatedAt = new Date().toISOString()
      this.tasks.set(taskId, task)
    }
  }

  /**
   * 更新任务错误
   */
  private updateTaskError(taskId: string, error: string): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = 'failed'
      task.error = error
      task.updatedAt = new Date().toISOString()
      this.tasks.set(taskId, task)
    }
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 将图片（特别是 blob URL）转换为 Base64 编码
   */
  private async convertImagesToBase64(imageUrls: string[]): Promise<string[]> {
    const conversionPromises = imageUrls.map(async (url) => {
      // 只转换 blob URL，其他假定为有效的公网 URL
      if (url.startsWith('blob:')) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error(`将 blob URL 转换为 Base64 失败: ${url}`, error);
          throw new Error(`无法转换图片: ${url}`);
        }
      }
      return url;
    });
    return Promise.all(conversionPromises);
  }

  /**
   * 重试失败的任务
   */
  async retryTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error('任务不存在')
    }

    if (task.status !== 'failed') {
      throw new Error('只能重试失败的任务')
    }

    // 重置任务状态
    task.status = 'pending'
    task.progress = 0
    task.error = undefined
    task.result = undefined
    task.updatedAt = new Date().toISOString()
    this.tasks.set(taskId, task)

    // 重新提交任务
    await this.submitTask(taskId)
  }
}

/**
 * 全局任务服务实例
 */
let globalTaskService: FusionTaskService | null = null

/**
 * 获取或创建任务服务实例
 */
export function getTaskService(apiKey?: string): FusionTaskService {
  if (!globalTaskService && apiKey) {
    globalTaskService = new FusionTaskService(apiKey)
  }
  
  if (!globalTaskService) {
    throw new Error('任务服务未初始化，请先提供 API Key')
  }
  
  return globalTaskService
}

/**
 * 重置任务服务（用于切换用户或API Key）
 */
export function resetTaskService(): void {
  globalTaskService = null
}