import type {
  FusionTask,
  CreateFusionTaskRequest,
  SeedreamResponse,
} from '@/types'
import { createSeedreamAPI } from './seedreamApi'
import { supabase } from './supabaseClient'
import { useAuthStore } from '@/stores/authStore'

/**
 * 将数据库项目记录转换为前端 FusionTask 对象
 */
function projectToFusionTask(project: any, images: any[] = []): FusionTask {
  const imageUrls = images.sort((a, b) => a.order_index - b.order_index).map(img => img.file_url);
  return {
    id: project.id,
    userId: project.user_id,
    title: project.title,
    prompt: project.prompt,
    images: imageUrls,
    status: project.status,
    progress: project.progress || 0,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    result: project.result || undefined,
    error: project.error || undefined,
    config: {
      model: project.config?.model || 'doubao-seedream-4-0-250828',
      size: project.config?.size || '2K',
      sequential_image_generation: project.config?.sequential_image_generation || 'disabled',
      response_format: project.config?.response_format || 'url',
      watermark: project.config?.watermark ?? true,
      ...(project.config || {})
    },
  };
}


/**
 * 图片融合任务管理服务
 * 负责任务的创建、状态管理、结果处理等
 */
export class FusionTaskService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 创建新的融合任务并存入数据库
   */
  async createTask(request: CreateFusionTaskRequest): Promise<FusionTask> {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw new Error('用户未登录，无法创建任务')
    }

    // 1. 在 projects 表中创建主任务记录
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: request.title,
        prompt: request.prompt,
        status: 'pending',
        progress: 0,
        config: request.config,
      })
      .select()
      .single()

    if (projectError) {
      console.error('创建项目失败:', projectError)
      throw new Error(`创建任务失败: ${projectError.message}`)
    }

    const newProjectId = projectData.id

    // 2. 将图片信息存入 project_images 表
    if (request.images && request.images.length > 0) {
      const imageRecords = request.images.map((imageUrl, index) => ({
        project_id: newProjectId,
        file_url: imageUrl,
        order_index: index,
        file_name: `image_${index}.jpg`,
        file_size: 0,
        mime_type: 'image/jpeg'
      }))

      const { error: imageError } = await supabase
        .from('project_images')
        .insert(imageRecords)

      if (imageError) {
        console.error('存储项目图片失败:', imageError)
        // 在生产环境中，这里应该回滚（删除）已创建的 project
        throw new Error(`存储任务图片失败: ${imageError.message}`)
      }
    }

    return projectToFusionTask(projectData, request.images.map(url => ({ file_url: url })));
  }

  /**
   * 提交任务到 Doubao API
   */
  async submitTask(taskId: string): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) {
      throw new Error('任务不存在');
    }

    try {
      await this.updateTask(taskId, { status: 'processing', progress: 10 });

      const api = createSeedreamAPI(this.apiKey);
      const processedImages = await this.convertImagesToBase64(task.images);

      let result: SeedreamResponse;

      if (processedImages.length === 0) {
        result = await api.textToImage(task.prompt, { ...task.config });
      } else if (processedImages.length === 1 && task.config.sequential_image_generation === 'disabled') {
        result = await api.imageToImage(task.prompt, processedImages[0], { ...task.config });
      } else if (task.config.sequential_image_generation === 'auto') {
        result = await api.generateImageSet(
          task.prompt,
          task.config.max_images || 4,
          processedImages.length > 0 ? processedImages : undefined,
          { ...task.config }
        );
      } else {
        result = await api.fuseImages(task.prompt, processedImages, { ...task.config });
      }

      await this.updateTask(taskId, { status: 'completed', progress: 100, result });
    } catch (error) {
      console.error('任务执行失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      await this.updateTask(taskId, { status: 'failed', error: errorMessage });
    }
  }

  /**
   * 使用流式 API 提交任务
   */
  async submitTaskWithStream(
    taskId: string,
    onProgress?: (progress: number, data?: any) => void
  ): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) {
      throw new Error('任务不存在');
    }

    try {
      await this.updateTask(taskId, { status: 'processing', progress: 10 });
      if (onProgress) onProgress(10);

      const api = createSeedreamAPI(this.apiKey);
      const processedImages = await this.convertImagesToBase64(task.images);
      
      let imageParam: string | string[] | undefined;
      if (processedImages.length === 1) {
        imageParam = processedImages[0];
      } else if (processedImages.length > 1) {
        imageParam = processedImages;
      }

      const result = await api.generateWithStream(
        {
          model: task.config.model,
          prompt: task.prompt,
          image: imageParam,
          ...task.config,
        },
        (data) => {
          if (data.data && data.data.length > 0) {
            const progress = Math.min(90, 20 + (data.data.length * 20));
            this.updateTask(taskId, { progress }); // Fire-and-forget update
            if (onProgress) {
              onProgress(progress, data);
            }
          }
        }
      );

      await this.updateTask(taskId, { status: 'completed', progress: 100, result });
      if (onProgress) {
        onProgress(100, result);
      }
    } catch (error) {
      console.error('流式任务执行失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      await this.updateTask(taskId, { status: 'failed', error: errorMessage });
    }
  }

  /**
   * 获取任务详情
   */
  async getTask(taskId: string): Promise<FusionTask | undefined> {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !project) {
      console.error('获取任务失败:', error);
      return undefined;
    }

    const { data: images, error: imageError } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', taskId)
      .order('order_index', { ascending: true });

    if (imageError) {
      console.error('获取任务图片失败:', imageError);
      // Even if images fail, we can still return the main task data
    }

    return projectToFusionTask(project, images || []);
  }

  /**
   * 获取所有任务
   */
  async getAllTasks(): Promise<FusionTask[]> {
     const { user } = useAuthStore.getState();
     if (!user) return [];
     return this.getUserTasks(user.id);
  }

  /**
   * 获取用户的任务列表
   */
  async getUserTasks(userId: string): Promise<FusionTask[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取用户任务列表失败:', error);
      return [];
    }
    
    // For simplicity, this doesn't fetch images for the whole list.
    // The full details (including images) are fetched when a single task is opened.
    return projects.map(p => projectToFusionTask(p));
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string): Promise<boolean> {
    // First delete associated images
    const { error: imageError } = await supabase
      .from('project_images')
      .delete()
      .eq('project_id', taskId);

    if (imageError) {
      console.error('删除任务图片失败:', imageError);
      return false;
    }

    // Then delete the project itself
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', taskId);
      
    if (projectError) {
      console.error('删除任务失败:', projectError);
      return false;
    }
    
    return true;
  }

  /**
   * 更新任务 (统一的更新方法)
   */
  async updateTask(
    taskId: string, 
    updates: Partial<Omit<FusionTask, 'id' | 'createdAt'>> & { result?: SeedreamResponse, error?: string }
  ): Promise<FusionTask | undefined> {
    const dbUpdates: { [key: string]: any } = { ...updates, updated_at: new Date().toISOString() };

    // FusionTask properties to database column names
    if (updates.userId) dbUpdates.user_id = updates.userId;
    
    // Remove frontend-only properties
    delete dbUpdates.userId;
    delete dbUpdates.images;

    const { data, error } = await supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error(`更新任务 ${taskId} 失败:`, error);
      return undefined;
    }
    
    return this.getTask(taskId); // Re-fetch to get consistent data with images
  }

  /**
   * 将图片（特别是 blob URL）转换为 Base64 编码
   */
  private async convertImagesToBase64(imageUrls: string[]): Promise<string[]> {
    const conversionPromises = imageUrls.map(async (url) => {
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
    const task = await this.getTask(taskId);
    if (!task) {
      throw new Error('任务不存在');
    }

    if (task.status !== 'failed') {
      throw new Error('只能重试失败的任务');
    }

    await this.updateTask(taskId, {
      status: 'pending',
      progress: 0,
      error: undefined,
      result: undefined,
    });

    // 重新提交任务
    await this.submitTask(taskId);
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