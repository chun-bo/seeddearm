import React, { useState, useCallback } from 'react'
import { 
  Input, 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Button, 
  Tooltip,
  Divider,
  Row,
  Col
} from 'antd'
import { 
  BulbOutlined, 
  CopyOutlined, 
  HistoryOutlined,
  ExperimentOutlined
} from '@ant-design/icons'

const { TextArea } = Input
const { Text, Title } = Typography

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  showSuggestions?: boolean
  onSubmit?: (prompt: string) => void
}

// 提示词建议模板
const PROMPT_SUGGESTIONS = [
  {
    category: '风格转换',
    prompts: [
      '将图片转换为油画风格，色彩丰富，笔触明显',
      '转换为水彩画风格，柔和淡雅，透明感强',
      '转换为卡通动漫风格，色彩鲜艳，线条清晰',
      '转换为素描风格，黑白灰调，线条流畅'
    ]
  },
  {
    category: '场景变换',
    prompts: [
      '将人物放置在樱花飞舞的春日公园中',
      '将场景改为夕阳西下的海边沙滩',
      '将背景替换为繁华的都市夜景',
      '将环境改为神秘的森林深处'
    ]
  },
  {
    category: '服装换装',
    prompts: [
      '将人物的服装替换为优雅的晚礼服',
      '换上休闲的牛仔装搭配',
      '穿上传统的汉服，古典优雅',
      '换成现代时尚的职业装'
    ]
  },
  {
    category: '艺术创作',
    prompts: [
      '创作一组四季变化的风景画',
      '生成不同时间段的同一场景',
      '创作抽象艺术风格的作品',
      '生成极简主义设计风格'
    ]
  }
]

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  placeholder = '请描述您想要生成的图片内容...',
  maxLength = 300,
  disabled = false,
  showSuggestions = true,
  onSubmit
}) => {
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false)
  const [recentPrompts, setRecentPrompts] = useState<string[]>([])

  // 处理提示词变化
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= maxLength) {
      onChange(newValue)
    }
  }, [onChange, maxLength])

  // 应用建议提示词
  const applySuggestion = useCallback((prompt: string) => {
    onChange(prompt)
    setShowSuggestionsPanel(false)
  }, [onChange])

  // 复制提示词
  const copyPrompt = useCallback(async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      // 这里可以添加成功提示
    } catch (error) {
      console.error('复制失败:', error)
    }
  }, [])

  // 提交提示词
  const handleSubmit = useCallback(() => {
    if (value.trim() && onSubmit) {
      onSubmit(value.trim())
      // 保存到最近使用
      setRecentPrompts(prev => {
        const newRecent = [value.trim(), ...prev.filter(p => p !== value.trim())].slice(0, 5)
        return newRecent
      })
    }
  }, [value, onSubmit])

  // 字数统计颜色
  const getCountColor = () => {
    const ratio = value.length / maxLength
    if (ratio > 0.9) return '#ff4d4f'
    if (ratio > 0.7) return '#faad14'
    return '#52c41a'
  }

  return (
    <Card 
      title={
        <Space>
          <ExperimentOutlined />
          <span>提示词输入</span>
        </Space>
      }
      extra={
        showSuggestions && (
          <Button
            type="text"
            icon={<BulbOutlined />}
            onClick={() => setShowSuggestionsPanel(!showSuggestionsPanel)}
          >
            提示词建议
          </Button>
        )
      }
    >
      <Space direction="vertical" className="w-full" size="middle">
        {/* 主输入区域 */}
        <div>
          <TextArea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            autoSize={{ minRows: 4, maxRows: 8 }}
            className="resize-none"
            style={{ fontSize: '14px', lineHeight: '1.6' }}
          />
          
          {/* 字数统计和操作按钮 */}
          <div className="flex justify-between items-center mt-2">
            <Text 
              type="secondary" 
              style={{ color: getCountColor() }}
              className="text-sm"
            >
              {value.length}/{maxLength} 字符
            </Text>
            
            <Space>
              {value && (
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyPrompt(value)}
                >
                  复制
                </Button>
              )}
              
              {onSubmit && (
                <Button
                  type="primary"
                  size="small"
                  disabled={!value.trim() || disabled}
                  onClick={handleSubmit}
                >
                  使用此提示词
                </Button>
              )}
            </Space>
          </div>
        </div>

        {/* 最近使用的提示词 */}
        {recentPrompts.length > 0 && (
          <div>
            <Text type="secondary" className="text-sm">
              <HistoryOutlined className="mr-1" />
              最近使用：
            </Text>
            <div className="mt-2">
              <Space wrap>
                {recentPrompts.map((prompt, index) => (
                  <Tag
                    key={index}
                    className="cursor-pointer max-w-xs truncate"
                    onClick={() => onChange(prompt)}
                  >
                    {prompt}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        )}

        {/* 提示词建议面板 */}
        {showSuggestionsPanel && (
          <>
            <Divider className="my-3" />
            <div>
              <Title level={5} className="mb-3">
                <BulbOutlined className="mr-2" />
                提示词建议
              </Title>
              
              <Row gutter={[16, 16]}>
                {PROMPT_SUGGESTIONS.map((category, categoryIndex) => (
                  <Col xs={24} sm={12} lg={6} key={categoryIndex}>
                    <Card 
                      size="small" 
                      title={category.category}
                      className="h-full"
                    >
                      <Space direction="vertical" className="w-full" size="small">
                        {category.prompts.map((prompt, promptIndex) => (
                          <div
                            key={promptIndex}
                            className="p-2 border border-gray-200 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                            onClick={() => applySuggestion(prompt)}
                          >
                            <Text className="text-sm leading-relaxed">
                              {prompt}
                            </Text>
                            <div className="flex justify-end mt-1">
                              <Tooltip title="复制">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<CopyOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    copyPrompt(prompt)
                                  }}
                                />
                              </Tooltip>
                            </div>
                          </div>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </>
        )}

        {/* 使用提示 */}
        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
          <Text type="secondary" className="text-sm">
            💡 <strong>提示词技巧：</strong>
            <br />
            • 描述要具体明确，避免模糊表达
            <br />
            • 可以指定艺术风格、色彩偏好、构图方式
            <br />
            • 建议控制在300字以内，避免信息过载
            <br />
            • 使用逗号分隔不同的描述要素
          </Text>
        </div>
      </Space>
    </Card>
  )
}

export default PromptInput