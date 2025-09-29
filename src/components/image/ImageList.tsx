import React from 'react'
import { Empty, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import ImagePreview from './ImagePreview'
import type { UploadFile } from '../../types'

interface ImageListProps {
  files: UploadFile[]
  onRemove?: (fileId: string) => void
  showRemoveButton?: boolean
}

const ImageList: React.FC<ImageListProps> = ({
  files,
  onRemove,
  showRemoveButton = true
}) => {
  if (files.length === 0) {
    return (
      <div className="py-8">
        <Empty 
          description="暂无图片"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    )
  }

  return (
    <div className="image-list">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {files.map((file) => (
          <div key={file.id} className="relative w-fit">
            <ImagePreview file={file} />
            
            {/* 删除按钮 */}
            {showRemoveButton && onRemove && (
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
                className="absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(file.id)
                }}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        已选择 {files.length} 张图片
      </div>
    </div>
  )
}

export default ImageList