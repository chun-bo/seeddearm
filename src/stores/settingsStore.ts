import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userSettingsService } from '@/services/userSettingsService'
import { useAuthStore } from './authStore'
import type { Database } from '@/types/database'

type UserSettings = Database['public']['Tables']['user_settings']['Row']

interface SettingsState {
  settings: UserSettings | null
  loading: boolean
  error: string | null
  
  // Actions
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
  updateApiKey: (apiKey: string) => Promise<void>
  updateTheme: (theme: string) => Promise<void>
  updateLanguage: (language: string) => Promise<void>
  clearError: () => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      loading: false,
      error: null,

      loadSettings: async () => {
        const { user } = useAuthStore.getState()
        if (!user) {
          set({ error: '用户未登录', loading: false })
          return
        }

        set({ loading: true, error: null })
        try {
          const settings = await userSettingsService.getOrCreateUserSettings(user.id)
          set({ settings, loading: false })
        } catch (error) {
          console.error('加载用户设置失败:', error)
          set({ 
            error: error instanceof Error ? error.message : '加载设置失败',
            loading: false 
          })
        }
      },

      updateSettings: async (newSettings: Partial<UserSettings>) => {
        const { user } = useAuthStore.getState()
        if (!user) {
          set({ error: '用户未登录' })
          return
        }

        set({ loading: true, error: null })
        try {
          const updatedSettings = await userSettingsService.updateUserSettings(
            user.id, 
            newSettings
          )
          set({ 
            settings: updatedSettings, 
            loading: false 
          })
        } catch (error) {
          console.error('更新设置失败:', error)
          set({ 
            error: error instanceof Error ? error.message : '更新设置失败',
            loading: false 
          })
        }
      },

      updateApiKey: async (apiKey: string) => {
        const { user } = useAuthStore.getState()
        if (!user) {
          set({ error: '用户未登录' })
          return
        }

        set({ loading: true, error: null })
        try {
          const updatedSettings = await userSettingsService.updateApiKey(user.id, apiKey)
          set({ 
            settings: updatedSettings, 
            loading: false 
          })
        } catch (error) {
          console.error('更新API密钥失败:', error)
          set({ 
            error: error instanceof Error ? error.message : '更新API密钥失败',
            loading: false 
          })
        }
      },

      updateTheme: async (theme: string) => {
        const { user } = useAuthStore.getState()
        if (!user) {
          set({ error: '用户未登录' })
          return
        }

        set({ loading: true, error: null })
        try {
          const updatedSettings = await userSettingsService.updateTheme(user.id, theme)
          set({ 
            settings: updatedSettings, 
            loading: false 
          })
        } catch (error) {
          console.error('更新主题失败:', error)
          set({ 
            error: error instanceof Error ? error.message : '更新主题失败',
            loading: false 
          })
        }
      },

      updateLanguage: async (language: string) => {
        const { user } = useAuthStore.getState()
        if (!user) {
          set({ error: '用户未登录' })
          return
        }

        set({ loading: true, error: null })
        try {
          const updatedSettings = await userSettingsService.updateLanguage(user.id, language)
          set({ 
            settings: updatedSettings, 
            loading: false 
          })
        } catch (error) {
          console.error('更新语言失败:', error)
          set({ 
            error: error instanceof Error ? error.message : '更新语言失败',
            loading: false 
          })
        }
      },

      clearError: () => set({ error: null }),

      reset: () => set({ 
        settings: null, 
        loading: false, 
        error: null 
      }),
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ 
        // 不持久化敏感信息，只在内存中保存
        // settings: state.settings 
      }),
    }
  )
)

// 监听认证状态变化，自动加载/清理设置
useAuthStore.subscribe((state) => {
  const { loadSettings, reset } = useSettingsStore.getState()
  
  if (state.isAuthenticated && state.user) {
    // 用户登录时自动加载设置
    loadSettings()
  } else {
    // 用户登出时清理设置
    reset()
  }
})