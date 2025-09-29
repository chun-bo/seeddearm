import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // TODO: 实际的登录API调用
          // 这里先用Mock数据
          const mockUser: User = {
            id: '1',
            email,
            username: email.split('@')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (email: string, password: string, username: string) => {
        set({ isLoading: true })
        try {
          // TODO: 实际的注册API调用
          const mockUser: User = {
            id: '1',
            email,
            username,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)