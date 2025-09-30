import React, { useState, useCallback } from 'react'
import {
  Card,
  Form,
  Select,
  Switch,
  InputNumber,
  Radio,
  Space,
  Typography,
  Tooltip,
  Divider,
  Alert,
  Row,
  Col
} from 'antd'
import {
  SettingOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  GroupOutlined
} from '@ant-design/icons'
import type { FusionTask, SizeOption } from '@/types'
import { PRESET_SIZES, FusionMode } from '@/types'

const { Text, Title } = Typography
const { Option } = Select

interface TaskConfigProps {
  config: Partial<FusionTask['config']>
  onChange: (config: Partial<FusionTask['config']>) => void
  imageCount: number
  disabled?: boolean
}

// 融合模式配置
const FUSION_MODES = [
  {
    key: FusionMode.TEXT_TO_IMAGE,
    label: '文生图',
    description: '纯文字描述生成图片',
    icon: <PictureOutlined />,
    requiresImages: false
  },
  {
    key: FusionMode.IMAGE_TO_IMAGE,
    label: '图文生图',
    description: '基于单张图片和文字生成',
    icon: <PictureOutlined />,
    requiresImages: true,
    maxImages: 1
  },
  {
    key: FusionMode.MULTI_IMAGE_FUSION,
    label: '多图融合',
    description: '融合多张图片的特征',
    icon: <GroupOutlined />,
    requiresImages: true,
    minImages: 2
  },
  {
    key: FusionMode.IMAGE_SET_GENERATION,
    label: '组图生成',
    description: '生成一组相关图片',
    icon: <GroupOutlined />,
    requiresImages: false,
    supportsSequential: true
  }
]

const TaskConfig: React.FC<TaskConfigProps> = ({
  config,
  onChange,
  imageCount,
  disabled = false
}) => {
  const [form] = Form.useForm()

  // 根据图片数量自动推荐模式
  const getRecommendedMode = useCallback(() => {
    if (imageCount === 0) return FusionMode.TEXT_TO_IMAGE
    if (imageCount === 1) return FusionMode.IMAGE_TO_IMAGE
    return FusionMode.MULTI_IMAGE_FUSION
  }, [imageCount])

  // 当前选择的模式
  const currentMode = config.sequential_image_generation === 'auto' 
    ? FusionMode.IMAGE_SET_GENERATION 
    : getRecommendedMode()

  // 处理配置变化
  const handleConfigChange = useCallback((key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    
    // 特殊处理：当启用组图生成时
    if (key === 'sequential_image_generation' && value === 'auto') {
      newConfig.max_images = newConfig.max_images || 4
    }
    
    onChange(newConfig)
  }, [config, onChange])

  // 处理模式切换
  const handleModeChange = useCallback((mode: FusionMode) => {
    const newConfig = { ...config }
    
    if (mode === FusionMode.IMAGE_SET_GENERATION) {
      newConfig.sequential_image_generation = 'auto'
      newConfig.max_images = newConfig.max_images || 4
    } else {
      newConfig.sequential_image_generation = 'disabled'
      delete newConfig.max_images
    }
    
    onChange(newConfig)
  }, [config, onChange])

  // 验证当前配置是否有效
  const validateConfig = useCallback(() => {
    const mode = FUSION_MODES.find(m => m.key === currentMode)
    if (!mode) return { valid: false, message: '未知的生成模式' }
    
    if (mode.requiresImages && imageCount === 0) {
      return { valid: false, message: `${mode.label}模式需要至少上传一张图片` }
    }
    
    if (mode.minImages && imageCount < mode.minImages) {
      return { valid: false, message: `${mode.label}模式需要至少${mode.minImages}张图片` }
    }
    
    if (mode.maxImages && imageCount > mode.maxImages) {
      return { valid: false, message: `${mode.label}模式最多支持${mode.maxImages}张图片` }
    }
    
    return { valid: true, message: '' }
  }, [currentMode, imageCount])

  const validation = validateConfig()

  return (
    <Card
      title={
        <Space>
          <SettingOutlined />
          <span>生成配置</span>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        disabled={disabled}
        initialValues={{
          size: config.size || '2K',
          response_format: config.response_format || 'url',
          watermark: config.watermark !== false,
          sequential_image_generation: config.sequential_image_generation || 'disabled',
          max_images: config.max_images || 4
        }}
      >
        {/* 生成模式选择 */}
        <Form.Item label="生成模式">
          <Radio.Group
            value={currentMode}
            onChange={(e) => handleModeChange(e.target.value)}
            className="w-full"
          >
            <Row gutter={[16, 16]}>
              {FUSION_MODES.map((mode) => {
                const isDisabled = mode.requiresImages && imageCount === 0
                const isRecommended = mode.key === getRecommendedMode()
                
                return (
                  <Col xs={24} sm={12} key={mode.key}>
                    <Radio.Button
                      value={mode.key}
                      disabled={isDisabled}
                      className={`w-full h-auto p-3 text-left ${
                        isRecommended ? 'border-blue-400' : ''
                      }`}
                    >
                      <div>
                        <Space>
                          {mode.icon}
                          <Text strong>{mode.label}</Text>
                          {isRecommended && (
                            <Text type="success" className="text-xs">推荐</Text>
                          )}
                        </Space>
                        <div className="mt-1">
                          <Text type="secondary" className="text-sm">
                            {mode.description}
                          </Text>
                        </div>
                      </div>
                    </Radio.Button>
                  </Col>
                )
              })}
            </Row>
          </Radio.Group>
        </Form.Item>

        {/* 配置验证提示 */}
        {!validation.valid && (
          <Alert
            type="warning"
            message={validation.message}
            className="mb-4"
            showIcon
          />
        )}

        <Row gutter={16}>
          {/* 图片尺寸 */}
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <Space>
                  <span>图片尺寸</span>
                  <Tooltip title="选择生成图片的尺寸规格">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Select
                value={config.size || '2K'}
                onChange={(value) => handleConfigChange('size', value)}
                placeholder="选择图片尺寸"
              >
                <Option value="1K">1K (1024x1024)</Option>
                <Option value="2K">2K (2048x2048)</Option>
                <Option value="4K">4K (4096x4096)</Option>
                <Divider className="my-1" />
                {PRESET_SIZES.map((size) => (
                  <Option key={size.value} value={size.value}>
                    {size.label} ({size.pixels})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* 返回格式 */}
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <Space>
                  <span>返回格式</span>
                  <Tooltip title="选择图片的返回格式">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Select
                value={config.response_format || 'url'}
                onChange={(value) => handleConfigChange('response_format', value)}
              >
                <Option value="url">图片链接 (推荐)</Option>
                <Option value="b64_json">Base64编码</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* 组图配置 */}
        {currentMode === FusionMode.IMAGE_SET_GENERATION && (
          <Form.Item
            label={
              <Space>
                <span>生成图片数量</span>
                <Tooltip title="指定要生成的图片数量，最多15张">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <InputNumber
              min={1}
              max={15}
              value={config.max_images || 4}
              onChange={(value) => handleConfigChange('max_images', value)}
              className="w-full"
              formatter={(value) => `${value} 张`}
              parser={(value) => value?.replace(' 张', '') as any}
            />
          </Form.Item>
        )}

        {/* 高级选项 */}
        <Divider orientation="left" className="text-sm">高级选项</Divider>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <Space>
                  <span>添加水印</span>
                  <Tooltip title="在生成的图片右下角添加AI生成标识">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Switch
                checked={config.watermark !== false}
                onChange={(checked) => handleConfigChange('watermark', checked)}
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* 配置说明 */}
        <div className="bg-gray-50 p-3 rounded mt-4">
          <Text type="secondary" className="text-sm">
            <InfoCircleOutlined className="mr-1" />
            <strong>配置说明：</strong>
            <br />
            • 图片链接格式生成速度更快，但链接24小时后失效
            <br />
            • Base64格式可永久保存，但文件较大
            <br />
            • 组图生成适合创作系列作品或品牌物料
            <br />
            • 建议开启水印以标识AI生成内容
          </Text>
        </div>
      </Form>
    </Card>
  )
}

export default TaskConfig