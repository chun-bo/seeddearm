// 数据库相关类型定义
export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          id: string
          user_id: string
          api_key: string | null
          api_key_encrypted: string | null
          theme: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          api_key?: string | null
          api_key_encrypted?: string | null
          theme?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          api_key?: string | null
          api_key_encrypted?: string | null
          theme?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          prompt: string | null
          status: string
          progress: number
          result: any | null
          error_message: string | null
          config: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          prompt?: string | null
          status?: string
          progress?: number
          result?: any | null
          error_message?: string | null
          config?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          prompt?: string | null
          status?: string
          progress?: number
          result?: any | null
          error_message?: string | null
          config?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      project_images: {
        Row: {
          id: string
          project_id: string
          file_url: string
          file_name: string | null
          file_size: number | null
          mime_type: string | null
          storage_path: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          file_url: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          storage_path?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          file_url?: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          storage_path?: string | null
          order_index?: number
          created_at?: string
        }
      }
    }
  }
}