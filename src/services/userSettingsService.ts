import { supabase } from './supabaseClient';
import type { Database } from '@/types/database';

type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

/**
 * 用户设置服务
 * 负责管理用户的个人设置，包括API密钥、主题、语言等
 */
export class UserSettingsService {
  /**
   * 获取用户设置
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 没有找到记录，返回 null
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('获取用户设置失败:', error);
      throw error;
    }
  }

  /**
   * 创建用户设置
   */
  async createUserSettings(settings: UserSettingsInsert): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert(settings)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建用户设置失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户设置
   */
  async updateUserSettings(
    userId: string, 
    updates: UserSettingsUpdate
  ): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新用户设置失败:', error);
      throw error;
    }
  }

  /**
   * 获取或创建用户设置
   * 如果用户设置不存在，则创建默认设置
   */
  async getOrCreateUserSettings(userId: string): Promise<UserSettings> {
    try {
      let settings = await this.getUserSettings(userId);
      
      if (!settings) {
        // 创建默认设置
        const defaultSettings: UserSettingsInsert = {
          user_id: userId,
          theme: 'light',
          language: 'zh-CN'
        };
        
        settings = await this.createUserSettings(defaultSettings);
      }
      
      return settings;
    } catch (error) {
      console.error('获取或创建用户设置失败:', error);
      throw error;
    }
  }

  /**
   * 更新API密钥
   * 注意：这里应该实现加密存储，暂时先明文存储
   */
  async updateApiKey(userId: string, apiKey: string): Promise<UserSettings> {
    try {
      // TODO: 实现API密钥加密
      const updates: UserSettingsUpdate = {
        api_key: apiKey,
        // api_key_encrypted: await this.encryptApiKey(apiKey)
      };
      
      return await this.updateUserSettings(userId, updates);
    } catch (error) {
      console.error('更新API密钥失败:', error);
      throw error;
    }
  }

  /**
   * 更新主题设置
   */
  async updateTheme(userId: string, theme: string): Promise<UserSettings> {
    try {
      return await this.updateUserSettings(userId, { theme });
    } catch (error) {
      console.error('更新主题失败:', error);
      throw error;
    }
  }

  /**
   * 更新语言设置
   */
  async updateLanguage(userId: string, language: string): Promise<UserSettings> {
    try {
      return await this.updateUserSettings(userId, { language });
    } catch (error) {
      console.error('更新语言失败:', error);
      throw error;
    }
  }

  // TODO: 实现API密钥加密/解密方法
  // private async encryptApiKey(apiKey: string): Promise<string> {
  //   // 实现加密逻辑
  // }
  
  // private async decryptApiKey(encryptedApiKey: string): Promise<string> {
  //   // 实现解密逻辑
  // }
}

// 导出单例实例
export const userSettingsService = new UserSettingsService();