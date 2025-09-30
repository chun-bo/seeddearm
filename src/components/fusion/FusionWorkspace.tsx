import React, { useState, useCallback, useEffect } from 'react'
import {
  Row,
  Col,
  Space,
  Button,
  message,
  Typography,
  Steps,
  Card,
  Alert,
  Spin
} from 'antd'
import {
  PlayCircleOutlined,
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { PromptInput, TaskConfig, TaskStatus, ResultDisplay } from './index'
import { ImageUpload, ImageList } from '../image'
import type { 
  UploadFile, 
  FusionTask, 
  CreateFusionTaskRequest,
  SeedreamRequest 
} from '@/types'
import { getTaskService } from '@/services/fusionTaskService'
import { useSettingsStore } from '@/stores/settingsStore'

const { Title } = Typography

interface FusionWorkspaceProps {
  onTaskComplete?: (task: FusionTask) => void
  onTaskSave?: (task: FusionTask) => void
}

const FusionWorkspace: React.FC<FusionWorkspaceProps> = ({
  onTaskComplete,
  onTaskSave
}) => {
  // 状态管理
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [prompt, setPrompt] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskConfig, setTaskConfig] = useState<Partial<FusionTask['config']>>({
    model: 'doubao-seedream-4-0-250828',
    size: '2K',
    sequential_image_generation: 'disabled',
    response_format: 'url',
    watermark: true
  })
  const [currentTask, setCurrentTask] = useState<FusionTask | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 获取用户设置
  const { settings } = useSettingsStore()
  const apiKey = settings?.doubaoApiKey

  // 步骤配置
  const steps = [
    {
      title: '上传图片',
      description: '选择要处理的参考图片'
    },
    {
      title: '输入提示词',
      description: '描述想要生成的内容'
    },
    {
      title: '配置参数',
      description: '设置生成参数'
    },
    {
      title: '生成图片',
      description: '提交任务并等待结果'
    }
  ]

  // 检查是否可以进行下一步
  const canProceedToStep = useCallback((step: number) => {
    switch (step) {
      case 1: // 可以跳过图片上传（文生图模式）
        return true
      case 2: // 需要提示词
        return prompt.trim().length > 0
      case 3: // 需要配置和API Key
        return prompt.trim().length > 0 && !!apiKey
      default:
        return true
    }
  }, [prompt, apiKey])

  // 处理图片上传
  const handleImageUpload = useCallback((newFiles: UploadFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  // 处理图片删除
  const handleImageRemove = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }, [])

  // 清空所有图片
  const handleClearAllImages = useCallback(() => {
    setUploadedFiles([])
  }, [])

  // 生成任务标题
  const generateTaskTitle = useCallback(() => {
    const timestamp = new Date().toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    const modeText = uploadedFiles.length === 0 ? '文生图' : 
                    uploadedFiles.length === 1 ? '图文生图' : '多图融合'
    return `${modeText}_${timestamp}`
  }, [uploadedFiles.length])

  // 提交任务
  const handleSubmitTask = useCallback(async () => {
    if (!apiKey) {
      message.error('请先在个人中心配置 API Key')
      return
    }

    if (!prompt.trim()) {
      message.error('请输入提示词')
      return
    }

    setIsSubmitting(true)

    try {
      // 准备图片数据
      const imageUrls: string[] = []
      for (const file of uploadedFiles) {
        if (file.status === 'done') {
          // 这里应该是已上传的图片URL，暂时使用preview
          imageUrls.push(file.preview)
        }
      }

      // 创建任务请求
      const taskRequest: CreateFusionTaskRequest = {
        title: taskTitle || generateTaskTitle(),
        prompt: prompt.trim(),
        images: imageUrls,
        config: taskConfig
      }

      // 获取任务服务
      const taskService = getTaskService(apiKey)
      
      // 创建任务
      const task = await taskService.createTask(taskRequest)
      setCurrentTask(task)
      setCurrentStep(3) // 跳转到结果页面

      // 提交任务（使用流式处理）
      await taskService.submitTaskWithStream(
        task.id,
        (progress, data) => {
          // 更新任务状态
          const updatedTask = taskService.getTask(task.id)
          if (updatedTask) {
            setCurrentTask(updatedTask)
          }
        }
      )

      // 获取最终结果
      const finalTask = taskService.getTask(task.id)
      if (finalTask) {
        setCurrentTask(finalTask)
        if (finalTask.status === 'completed') {
          message.success('图片生成成功！')
          onTaskComplete?.(finalTask)
        } else if (finalTask.status === 'failed') {
          message.error('图片生成失败')
        }
      }

    } catch (error) {
      console.error('任务提交失败:', error)
      message.error(error instanceof Error ? error.message : '任务提交失败')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    apiKey, 
    prompt, 
    uploadedFiles, 
    taskTitle, 
    taskConfig, 
    generateTaskTitle, 
    onTaskComplete
  ])

  // 重试任务
  const handleRetryTask = useCallback(async (taskId: string) => {
    if (!apiKey) return

    try {
      const taskService = getTaskService(apiKey)
      await taskService.retryTask(taskId)
      
      const updatedTask = taskService.getTask(taskId)
      if (updatedTask) {
        setCurrentTask(updatedTask)
      }
    } catch (error) {
      console.error('重试失败:', error)
      message.error('重试失败')
    }
  }, [apiKey])

  // 保存任务
  const handleSaveTask = useCallback(() => {
    if (currentTask) {
      onTaskSave?.(currentTask)
      message.success('任务已保存')
    }
  }, [currentTask, onTaskSave])

  // 重置工作区
  const handleReset = useCallback(() => {
    setCurrentStep(0)
    setUploadedFiles([])
    setPrompt('')
    setTaskTitle('')
    setCurrentTask(null)
    setTaskConfig({
      model: 'doubao-seedream-4-0-250828',
      size: '2K',
      sequential_image_generation: 'disabled',
      response_format: 'url',
      watermark: true
    })
  }, [])

  // 自动生成任务标题
  useEffect(() => {
    if (!taskTitle) {
      setTaskTitle(generateTaskTitle())
    }
  }, [uploadedFiles.length, generateTaskTitle, taskTitle])

  return (
    <div className="fusion-workspace">
      {/* 步骤指示器 */}
      <Card className="mb-6">
        <Steps
          current={currentStep}
          items={steps}
          className="mb-4"
        />
        
        {/* 步骤导航 */}
        <div className="flex justify-between">
          <Button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          >
            上一步
          </Button>
          
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
            
            {currentTask && (
              <Button
                icon={<SaveOutlined />}
                onClick={handleSaveTask}
              >
                保存任务
              </Button>
            )}
          </Space>
          
          <Button
            type="primary"
            disabled={!canProceedToStep(currentStep + 1)}
            onClick={() => {
              if (currentStep === 2) {
                handleSubmitTask()
              } else {
                setCurrentStep(prev => Math.min(3, prev + 1))
              }
            }}
            loading={isSubmitting}
            icon={currentStep === 2 ? <PlayCircleOutlined /> : undefined}
          >
            {currentStep === 2 ? '开始生成' : '下一步'}
          </Button>
        </div>
      </Card>

      {/* API Key 检查 */}
      {!apiKey && (
        <Alert
          type="warning"
          message="API Key 未配置"
          description="请先在个人中心配置您的 Doubao API Key 才能使用图片生成功能"
          className="mb-6"
          showIcon
        />
      )}

      {/* 步骤内容 */}
      <Row gutter={[24, 24]}>
        {/* 步骤1: 图片上传 */}
        {currentStep === 0 && (
          <Col span={24}>
            <Space direction="vertical" className="w-full" size="large">
              <Card title="上传参考图片">
                <Space direction="vertical" className="w-full" size="middle">
                  <ImageUpload 
                    onUpload={handleImageUpload}
                    maxCount={10}
                    disabled={!apiKey}
                  />
                  
                  {uploadedFiles.length > 0 && (
                    <ImageList
                      files={uploadedFiles}
                      onRemove={handleImageRemove}
                      onClear={handleClearAllImages}
                    />
                  )}
                </Space>
              </Card>
              
              <Alert
                type="info"
                message="提示"
                description="您可以跳过图片上传直接进行文生图，或上传1-10张参考图片进行图文生图或多图融合"
                showIcon
              />
            </Space>
          </Col>
        )}

        {/* 步骤2: 提示词输入 */}
        {currentStep === 1 && (
          <Col span={24}>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              disabled={!apiKey}
              showSuggestions={true}
            />
          </Col>
        )}

        {/* 步骤3: 配置参数 */}
        {currentStep === 2 && (
          <Col span={24}>
            <TaskConfig
              config={taskConfig}
              onChange={setTaskConfig}
              imageCount={uploadedFiles.length}
              disabled={!apiKey}
            />
          </Col>
        )}

        {/* 步骤4: 任务状态和结果 */}
        {currentStep === 3 && currentTask && (
          <Col span={24}>
            <Space direction="vertical" className="w-full" size="large">
              <TaskStatus
                task={currentTask}
                onRetry={handleRetryTask}
                showDetails={true}
              />
              
              <ResultDisplay
                task={currentTask}
                apiKey={apiKey}
                showActions={true}
              />
            </Space>
          </Col>
        )}
      </Row>
    </div>
  )
}

export default FusionWorkspace