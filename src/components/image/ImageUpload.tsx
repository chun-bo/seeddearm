import React, { useRef, useState } from 'react'
import { Button, message } from 'antd'
import { UploadOutlined, PlusOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import { imageStorageService } from '@/services/imageStorageService'
import type { UploadFile } from '../../types'

interface ImageUploadProps {
  onUpload: (files: UploadFile[]) => void
  maxCount?: number
  accept?: string
  projectId?: string // 可选的项目ID，如果提供则直接关联到项目
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  maxCount = 10,
  accept = 'image/jpeg,image/png,image/webp',
  projectId
}) => {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()

  // 处理文件选择和上传
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      message.error('请先登录后再上传图片')
      return
    }

    const files = event.target.files
    if (!files) return

    const fileArray = Array.from(files)
    
    // 检查文件数量限制
    if (fileArray.length > maxCount) {
      message.error(`最多只能选择 ${maxCount} 个文件`)
      return
    }
    
    // 验证文件格式和大小
    const validFiles = fileArray.filter(file => {
      // 检查文件类型
      const isValidType = accept.split(',').some(type => 
        file.type === type.trim()
      )
      
      if (!isValidType) {
        message.error(`文件 ${file.name} 格式不支持，请选择 JPG、PNG 或 WebP 格式的图片`)
        return false
      }
      
      // 检查文件大小（10MB限制）
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        message.error(`文件 ${file.name} 大小超过 10MB 限制`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)

    try {
      // 使用新的图片存储服务上传
      const uploadResults = await imageStorageService.uploadImages(
        validFiles, 
        user.id, 
        projectId
      )
      
      // 转换为 UploadFile 格式
      const uploadFiles: UploadFile[] = uploadResults.map((result, index) => {
        const file = validFiles[index]
        return {
          id: result.id,
          file,
          preview: URL.createObjectURL(file), // 本地预览URL
          status: 'done' as const,
          progress: 100,
          // 扩展字段
          supabaseUrl: result.file_url,
          storagePath: result.storage_path
        }
      })
      
      // 调用父组件的回调
      onUpload(uploadFiles)
      message.success(`成功上传 ${uploadFiles.length} 张图片！`)

    } catch (error) {
      console.error('上传失败:', error)
      if (error instanceof Error) {
        message.error(`上传失败: ${error.message}`)
      } else {
        message.error('上传过程中发生未知错误')
      }
    } finally {
      setUploading(false)
      // 清空input值，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <Button
        type="dashed"
        icon={<UploadOutlined />}
        onClick={handleButtonClick}
        loading={uploading}
        size="large"
        className="w-full h-32 flex flex-col items-center justify-center"
        disabled={uploading}
      >
        <PlusOutlined className="text-2xl mb-2" />
        <div>{uploading ? '上传中...' : '点击选择图片'}</div>
        <div className="text-sm text-gray-500 mt-1">
          支持 JPG、PNG、WebP 格式，单个文件最大 10MB
        </div>
        {maxCount > 1 && (
          <div className="text-xs text-gray-400 mt-1">
            最多可选择 {maxCount} 个文件
          </div>
        )}
      </Button>
    </div>
  )
}

export default ImageUpload