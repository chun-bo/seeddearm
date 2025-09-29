import React, { useState } from 'react'
import { Typography, Card, Divider, Space, Button } from 'antd'
import { ImageUpload, ImageList } from '../../components/image'
import type { UploadFile } from '../../types'

const { Title, Text } = Typography

const Workspace: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])

  // 处理图片上传
  const handleImageUpload = (newFiles: UploadFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  // 处理图片删除
  const handleImageRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  // 清空所有图片
  const handleClearAll = () => {
    setUploadedFiles([])
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Title level={2}>工作台</Title>
      
      {/* 图片上传区域 */}
      <Card title="图片上传" className="mb-6">
        <Space direction="vertical" className="w-full" size="large">
          <div>
            <Text type="secondary">
              请选择要处理的图片文件，支持 JPG、PNG、WebP 格式
            </Text>
          </div>
          
          <ImageUpload 
            onUpload={handleImageUpload}
            maxCount={10}
          />
        </Space>
      </Card>

      {/* 图片列表区域 */}
      <Card 
        title="已上传的图片" 
        className="mb-6"
        extra={
          uploadedFiles.length > 0 && (
            <Button 
              type="link" 
              danger 
              onClick={handleClearAll}
            >
              清空所有
            </Button>
          )
        }
      >
        <ImageList 
          files={uploadedFiles}
          onRemove={handleImageRemove}
          showRemoveButton={true}
        />
      </Card>

      {/* 下一步操作提示 */}
      {uploadedFiles.length > 0 && (
        <Card>
          <div className="text-center py-4">
            <Text type="secondary">
              图片上传完成！下一步将实现图片融合功能...
            </Text>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Workspace