import React, { useRef, useState } from 'react'
import { Upload, Button, message } from 'antd'
import { UploadOutlined, PlusOutlined } from '@ant-design/icons'
import type { UploadFile } from '../../types'

interface ImageUploadProps {
  onUpload: (files: UploadFile[]) => void
  maxCount?: number
  accept?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  maxCount = 10,
  accept = 'image/jpeg,image/png,image/webp'
}) => {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const fileArray = Array.from(files)
    
    // 验证文件格式
    const validFiles = fileArray.filter(file => {
      const isValidType = accept.split(',').some(type => 
        file.type === type.trim()
      )
      
      if (!isValidType) {
        message.error(`文件 ${file.name} 格式不支持，请选择 JPG、PNG 或 WebP 格式的图片`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)

    // 转换为 UploadFile 格式
    const uploadFiles: UploadFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'done',
      progress: 100
    }))

    // 调用父组件的回调
    onUpload(uploadFiles)
    setUploading(false)

    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
      >
        <PlusOutlined className="text-2xl mb-2" />
        <div>点击选择图片</div>
        <div className="text-sm text-gray-500 mt-1">
          支持 JPG、PNG、WebP 格式
        </div>
      </Button>
    </div>
  )
}

export default ImageUpload