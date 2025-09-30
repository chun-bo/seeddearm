import React, { useState, useCallback } from 'react'
import {
  Card,
  Image,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Modal,
  Tooltip,
  message,
  Spin,
  Empty,
  Tag,
  Divider
} from 'antd'
import {
  DownloadOutlined,
  EyeOutlined,
  CopyOutlined,
  ShareAltOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  PictureOutlined
} from '@ant-design/icons'
import type { FusionTask, SeedreamResponse } from '@/types'
import { createSeedreamAPI } from '@/services/seedreamApi'

const { Text, Title } = Typography

interface ResultDisplayProps {
  task: FusionTask
  apiKey?: string
  onImageSelect?: (imageUrl: string, index: number) => void
  showActions?: boolean
  compact?: boolean
}

interface ImageViewerState {
  visible: boolean
  current: number
  images: Array<{
    url: string
    size: string
    index: number
  }>
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  task,
  apiKey,
  onImageSelect,
  showActions = true,
  compact = false
}) => {
  const [downloading, setDownloading] = useState<Set<number>>(new Set())
  const [imageViewer, setImageViewer] = useState<ImageViewerState>({
    visible: false,
    current: 0,
    images: []
  })

  const result = task.result
  const images = result?.data || []

  // 处理图片下载
  const handleDownload = useCallback(async (imageUrl: string, index: number) => {
    if (!apiKey) {
      message.error('API Key 未配置，无法下载图片')
      return
    }

    setDownloading(prev => new Set(prev).add(index))
    
    try {
      const api = createSeedreamAPI(apiKey)
      const filename = `${task.title}_${index + 1}_${Date.now()}`
      await api.downloadImage(imageUrl, filename)
      message.success('图片下载成功')
    } catch (error) {
      console.error('下载失败:', error)
      message.error('图片下载失败')
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }
  }, [apiKey, task.title])

  // 批量下载所有图片
  const handleDownloadAll = useCallback(async () => {
    if (!apiKey || images.length === 0) {
      message.error('无法下载图片')
      return
    }

    try {
      const api = createSeedreamAPI(apiKey)
      const urls = images.map(img => img.url || img.b64_json || '')
      await api.downloadImages(urls, task.title)
      message.success(`成功下载 ${images.length} 张图片`)
    } catch (error) {
      console.error('批量下载失败:', error)
      message.error('批量下载失败')
    }
  }, [apiKey, images, task.title])

  // 复制图片链接
  const handleCopyUrl = useCallback(async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      message.success('图片链接已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      message.error('复制链接失败')
    }
  }, [])

  // 打开图片查看器
  const openImageViewer = useCallback((index: number) => {
    const viewerImages = images.map((img, i) => ({
      url: img.url || `data:image/jpeg;base64,${img.b64_json}`,
      size: img.size,
      index: i
    }))

    setImageViewer({
      visible: true,
      current: index,
      images: viewerImages
    })
  }, [images])

  // 关闭图片查看器
  const closeImageViewer = useCallback(() => {
    setImageViewer(prev => ({ ...prev, visible: false }))
  }, [])

  // 分享图片
  const handleShare = useCallback(async (imageUrl: string, index: number) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${task.title} - 图片 ${index + 1}`,
          text: '查看我用AI生成的图片',
          url: imageUrl
        })
      } catch (error) {
        console.error('分享失败:', error)
        handleCopyUrl(imageUrl)
      }
    } else {
      handleCopyUrl(imageUrl)
    }
  }, [task.title, handleCopyUrl])

  // 如果任务未完成，显示空状态
  if (task.status !== 'completed' || !result) {
    return (
      <Card
        title={
          <Space>
            <PictureOutlined />
            <span>生成结果</span>
          </Space>
        }
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            task.status === 'processing' ? '正在生成图片...' : 
            task.status === 'failed' ? '生成失败' : 
            '等待生成'
          }
        >
          {task.status === 'processing' && <Spin />}
        </Empty>
      </Card>
    )
  }

  return (
    <>
      <Card
        title={
          <Space>
            <PictureOutlined />
            <span>生成结果</span>
            <Tag color="green">{images.length} 张图片</Tag>
          </Space>
        }
        extra={
          showActions && images.length > 1 && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadAll}
            >
              下载全部
            </Button>
          )
        }
      >
        <Space direction="vertical" className="w-full" size="middle">
          {/* 图片网格 */}
          <Row gutter={[16, 16]}>
            {images.map((image, index) => {
              const imageUrl = image.url || `data:image/jpeg;base64,${image.b64_json}`
              const isDownloading = downloading.has(index)

              return (
                <Col 
                  key={index} 
                  xs={24} 
                  sm={12} 
                  md={images.length === 1 ? 24 : 12}
                  lg={images.length === 1 ? 24 : images.length === 2 ? 12 : 8}
                  xl={images.length === 1 ? 24 : images.length === 2 ? 12 : 6}
                >
                  <Card
                    hoverable
                    className="overflow-hidden"
                    cover={
                      <div className="relative group">
                        <Image
                          src={imageUrl}
                          alt={`生成图片 ${index + 1}`}
                          className="w-full h-48 object-cover"
                          preview={false}
                          onClick={() => openImageViewer(index)}
                        />
                        
                        {/* 悬浮操作按钮 */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Space>
                            <Tooltip title="查看大图">
                              <Button
                                type="primary"
                                shape="circle"
                                icon={<EyeOutlined />}
                                onClick={() => openImageViewer(index)}
                              />
                            </Tooltip>
                            
                            {showActions && (
                              <>
                                <Tooltip title="下载图片">
                                  <Button
                                    type="primary"
                                    shape="circle"
                                    icon={<DownloadOutlined />}
                                    loading={isDownloading}
                                    onClick={() => handleDownload(imageUrl, index)}
                                  />
                                </Tooltip>
                                
                                <Tooltip title="复制链接">
                                  <Button
                                    type="primary"
                                    shape="circle"
                                    icon={<CopyOutlined />}
                                    onClick={() => handleCopyUrl(imageUrl)}
                                  />
                                </Tooltip>
                                
                                <Tooltip title="分享">
                                  <Button
                                    type="primary"
                                    shape="circle"
                                    icon={<ShareAltOutlined />}
                                    onClick={() => handleShare(imageUrl, index)}
                                  />
                                </Tooltip>
                              </>
                            )}
                          </Space>
                        </div>
                      </div>
                    }
                    actions={
                      showActions ? [
                        <Tooltip title="选择此图片" key="select">
                          <Button
                            type="text"
                            onClick={() => onImageSelect?.(imageUrl, index)}
                          >
                            选择
                          </Button>
                        </Tooltip>,
                        <Tooltip title="下载" key="download">
                          <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            loading={isDownloading}
                            onClick={() => handleDownload(imageUrl, index)}
                          />
                        </Tooltip>,
                        <Tooltip title="复制链接" key="copy">
                          <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyUrl(imageUrl)}
                          />
                        </Tooltip>
                      ] : undefined
                    }
                  >
                    <Card.Meta
                      title={`图片 ${index + 1}`}
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary" className="text-sm">
                            尺寸: {image.size}
                          </Text>
                          {!compact && (
                            <Text type="secondary" className="text-sm">
                              格式: {image.url ? 'URL' : 'Base64'}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              )
            })}
          </Row>

          {/* 生成信息 */}
          {!compact && result.usage && (
            <>
              <Divider />
              <div className="bg-gray-50 p-4 rounded">
                <Title level={5} className="mb-3">生成信息</Title>
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Text type="secondary">
                      生成时间: {new Date(result.created * 1000).toLocaleString()}
                    </Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text type="secondary">
                      使用模型: {result.model}
                    </Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text type="secondary">
                      Token消耗: {result.usage.total_tokens}
                    </Text>
                  </Col>
                </Row>
              </div>
            </>
          )}
        </Space>
      </Card>

      {/* 图片查看器 */}
      <Modal
        open={imageViewer.visible}
        onCancel={closeImageViewer}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        className="image-viewer-modal"
      >
        <div className="text-center">
          {imageViewer.images.length > 0 && (
            <>
              <div className="mb-4">
                <Image
                  src={imageViewer.images[imageViewer.current]?.url}
                  alt={`图片 ${imageViewer.current + 1}`}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Text>
                  {imageViewer.current + 1} / {imageViewer.images.length}
                </Text>
                
                <Space>
                  <Button
                    disabled={imageViewer.current === 0}
                    onClick={() => setImageViewer(prev => ({
                      ...prev,
                      current: prev.current - 1
                    }))}
                  >
                    上一张
                  </Button>
                  
                  <Button
                    disabled={imageViewer.current === imageViewer.images.length - 1}
                    onClick={() => setImageViewer(prev => ({
                      ...prev,
                      current: prev.current + 1
                    }))}
                  >
                    下一张
                  </Button>
                </Space>
                
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      const currentImage = imageViewer.images[imageViewer.current]
                      if (currentImage) {
                        handleDownload(currentImage.url, currentImage.index)
                      }
                    }}
                  >
                    下载
                  </Button>
                  
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => {
                      const currentImage = imageViewer.images[imageViewer.current]
                      if (currentImage) {
                        handleCopyUrl(currentImage.url)
                      }
                    }}
                  >
                    复制链接
                  </Button>
                </Space>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  )
}

export default ResultDisplay