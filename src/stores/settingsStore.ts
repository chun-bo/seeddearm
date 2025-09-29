import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '@/types'

interface SettingsState {
  settings: UserSettings | null
  loading: boolean
  error: string | null
  
  // Actions
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
  updateApiKey: (apiKey: string) => Promise<void>
  clearError: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      loading: false,
      error: null,

      loadSettings: async () => {
        set({ loading: true, error: null })
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const mockSettings: UserSettings = {
            id: '1',
            userId: '1',
            theme: 'light',
            language: 'zh-CN',
            doubaoApiKey: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          set({ settings: mockSettings, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '加载设置失败',
            loading: false 
          })
        }
      },

      updateSettings: async (newSettings: Partial<UserSettings>) => {
        set({ loading: true, error: null })
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const currentSettings = get().settings
          if (currentSettings) {
            const updatedSettings = {
              ...currentSettings,
              ...newSettings,
              updatedAt: new Date().toISOString(),
            }
            set({ settings: updatedSettings, loading: false })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '更新设置失败',
            loading: false 
          })
        }
      },

      updateApiKey: async (apiKey: string) => {
        set({ loading: true, error: null })
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const currentSettings = get().settings
          if (currentSettings) {
            const updatedSettings = {
              ...currentSettings,
              doubaoApiKey: apiKey,
              updatedAt: new Date().toISOString(),
            }
            set({ settings: updatedSettings, loading: false })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '更新API密钥失败',
            loading: false 
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ 
        settings: state.settings 
      }),
    }
  )
)