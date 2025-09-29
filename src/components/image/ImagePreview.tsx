import React, { useState } from 'react'
import { Modal, Image } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import type { UploadFile } from '../../types'

interface ImagePreviewProps {
  file: UploadFile
  width?: number
  height?: number
  className?: string
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  width = 120,
  height = 120,
  className = ''
}) => {
  const [previewVisible, setPreviewVisible] = useState(false)

  return (
    <>
      <div 
        className={`relative group cursor-pointer border border-gray-200 rounded-lg overflow-hidden ${className}`}
        style={{ width, height }}
        onClick={() => setPreviewVisible(true)}
      >
        <img
          src={file.preview}
          alt={file.file.name}
          className="w-full h-full object-cover"
        />
        
        {/* 悬停遮罩 */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <EyeOutlined className="text-white text-xl" />
        </div>
        
        {/* 文件名显示 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate">
          {file.file.name}
        </div>
      </div>

      {/* 预览模态框 */}
      <Modal
        open={previewVisible}
        title={file.file.name}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="auto"
        centered
      >
        <Image
          src={file.preview}
          alt={file.file.name}
          style={{ maxWidth: '100%', maxHeight: '70vh' }}
          preview={false}
        />
        <div className="mt-4 text-sm text-gray-500">
          <p>文件大小: {(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
          <p>文件类型: {file.file.type}</p>
        </div>
      </Modal>
    </>
  )
}

export default ImagePreview