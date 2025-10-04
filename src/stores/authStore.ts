import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as AppUser } from '@/types';
import { supabase } from '@/services/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<AppUser>) => void;
  setSupabaseUser: (user: SupabaseUser | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      supabaseUser: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        set({ isLoading: false });
        if (error) throw error;
      },

      register: async (email, password, username) => {
        set({ isLoading: true });
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });
        set({ isLoading: false });
        if (error) throw error;
      },

      logout: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ user: null, supabaseUser: null, isAuthenticated: false, isLoading: false });
      },

      updateUser: (userData) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      setSupabaseUser: (supabaseUser) => {
        if (supabaseUser) {
          const appUser: AppUser = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            username: supabaseUser.user_metadata.username || '',
            createdAt: supabaseUser.created_at,
            updatedAt: supabaseUser.updated_at,
          };
          set({ user: appUser, supabaseUser, isAuthenticated: true });
        } else {
          set({ user: null, supabaseUser: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // We don't persist the user object from here anymore,
        // as it will be restored from onAuthStateChange
      }),
    }
  )
);

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.getState().setSupabaseUser(session?.user ?? null);
});