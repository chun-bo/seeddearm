import { supabase } from './supabaseClient';
import type { Database } from '@/types/database';

type ProjectImage = Database['public']['Tables']['project_images']['Row'];
type ProjectImageInsert = Database['public']['Tables']['project_images']['Insert'];

export interface UploadImageResult {
  id: string;
  file_url: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

/**
 * 图片存储服务
 * 负责图片的上传、存储和数据库记录管理
 */
export class ImageStorageService {
  private readonly bucketName = 'project-images';

  /**
   * 上传单个图片到 Supabase Storage
   */
  async uploadImage(
    file: File, 
    userId: string,
    projectId?: string
  ): Promise<UploadImageResult> {
    try {
      // 生成唯一文件名
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`上传文件失败: ${uploadError.message}`);
      }

      // 获取公共 URL
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('获取文件公共链接失败');
      }

      const result: UploadImageResult = {
        id: crypto.randomUUID(),
        file_url: publicUrlData.publicUrl,
        storage_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type
      };

      // 如果提供了项目ID，则保存到数据库
      if (projectId) {
        await this.saveImageRecord(projectId, result);
      }

      return result;
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  }

  /**
   * 批量上传图片
   */
  async uploadImages(
    files: File[], 
    userId: string,
    projectId?: string
  ): Promise<UploadImageResult[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadImage(file, userId, projectId)
      );
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('批量上传图片失败:', error);
      throw error;
    }
  }

  /**
   * 保存图片记录到数据库
   */
  async saveImageRecord(
    projectId: string, 
    imageData: UploadImageResult,
    orderIndex: number = 0
  ): Promise<ProjectImage> {
    try {
      const imageRecord: ProjectImageInsert = {
        project_id: projectId,
        file_url: imageData.file_url,
        file_name: imageData.file_name,
        file_size: imageData.file_size,
        mime_type: imageData.mime_type,
        storage_path: imageData.storage_path,
        order_index: orderIndex
      };

      const { data, error } = await supabase
        .from('project_images')
        .insert(imageRecord)
        .select()
        .single();

      if (error) {
        throw new Error(`保存图片记录失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('保存图片记录失败:', error);
      throw error;
    }
  }

  /**
   * 删除图片（同时删除存储文件和数据库记录）
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      // 先获取图片记录
      const { data: imageRecord, error: fetchError } = await supabase
        .from('project_images')
        .select('storage_path')
        .eq('id', imageId)
        .single();

      if (fetchError) {
        throw new Error(`获取图片记录失败: ${fetchError.message}`);
      }

      // 删除存储文件
      if (imageRecord.storage_path) {
        const { error: deleteStorageError } = await supabase.storage
          .from(this.bucketName)
          .remove([imageRecord.storage_path]);

        if (deleteStorageError) {
          console.warn('删除存储文件失败:', deleteStorageError.message);
          // 不抛出错误，继续删除数据库记录
        }
      }

      // 删除数据库记录
      const { error: deleteDbError } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId);

      if (deleteDbError) {
        throw new Error(`删除图片记录失败: ${deleteDbError.message}`);
      }
    } catch (error) {
      console.error('删除图片失败:', error);
      throw error;
    }
  }

  /**
   * 获取项目的所有图片
   */
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    try {
      const { data, error } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) {
        throw new Error(`获取项目图片失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('获取项目图片失败:', error);
      throw error;
    }
  }

  /**
   * 更新图片顺序
   */
  async updateImageOrder(imageId: string, newOrder: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_images')
        .update({ order_index: newOrder })
        .eq('id', imageId);

      if (error) {
        throw new Error(`更新图片顺序失败: ${error.message}`);
      }
    } catch (error) {
      console.error('更新图片顺序失败:', error);
      throw error;
    }
  }

  /**
   * 清理临时上传的图片（没有关联项目的图片）
   */
  async cleanupTempImages(userId: string, olderThanHours: number = 24): Promise<void> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - olderThanHours);

      // 查找没有关联项目且超过指定时间的图片
      const { data: tempImages, error: fetchError } = await supabase
        .from('project_images')
        .select('id, storage_path')
        .is('project_id', null)
        .lt('created_at', cutoffTime.toISOString());

      if (fetchError) {
        throw new Error(`查找临时图片失败: ${fetchError.message}`);
      }

      if (!tempImages || tempImages.length === 0) {
        return;
      }

      // 删除存储文件
      const storagePaths = tempImages
        .map(img => img.storage_path)
        .filter(path => path) as string[];

      if (storagePaths.length > 0) {
        const { error: deleteStorageError } = await supabase.storage
          .from(this.bucketName)
          .remove(storagePaths);

        if (deleteStorageError) {
          console.warn('删除临时存储文件失败:', deleteStorageError.message);
        }
      }

      // 删除数据库记录
      const imageIds = tempImages.map(img => img.id);
      const { error: deleteDbError } = await supabase
        .from('project_images')
        .delete()
        .in('id', imageIds);

      if (deleteDbError) {
        console.warn('删除临时图片记录失败:', deleteDbError.message);
      }

      console.log(`清理了 ${tempImages.length} 个临时图片`);
    } catch (error) {
      console.error('清理临时图片失败:', error);
      // 不抛出错误，这是后台清理任务
    }
  }
}

// 导出单例实例
export const imageStorageService = new ImageStorageService();