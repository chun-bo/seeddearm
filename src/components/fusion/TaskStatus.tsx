import React, { useEffect, useState } from 'react'
import {
  Card,
  Progress,
  Typography,
  Space,
  Tag,
  Button,
  Alert,
  Timeline,
  Spin,
  Statistic,
  Row,
  Col
} from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons'
import type { FusionTask } from '@/types'

const { Text, Title } = Typography

interface TaskStatusProps {
  task: FusionTask
  onRetry?: (taskId: string) => void
  onCancel?: (taskId: string) => void
  showDetails?: boolean
}

// 状态配置
const STATUS_CONFIG = {
  pending: {
    color: 'blue',
    icon: <ClockCircleOutlined />,
    label: '等待中',
    description: '任务已创建，等待处理'
  },
  processing: {
    color: 'orange',
    icon: <PlayCircleOutlined />,
    label: '处理中',
    description: '正在生成图片，请耐心等待'
  },
  completed: {
    color: 'green',
    icon: <CheckCircleOutlined />,
    label: '已完成',
    description: '图片生成成功'
  },
  failed: {
    color: 'red',
    icon: <ExclamationCircleOutlined />,
    label: '失败',
    description: '图片生成失败'
  }
}

const TaskStatus: React.FC<TaskStatusProps> = ({
  task,
  onRetry,
  onCancel,
  showDetails = true
}) => {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const statusConfig = STATUS_CONFIG[task.status]
  const progress = task.progress || 0

  // 计算耗时
  useEffect(() => {
    const startTime = new Date(task.createdAt).getTime()
    const shouldRun = task.status === 'processing'
    setIsRunning(shouldRun)

    if (!shouldRun) {
      const endTime = task.status === 'completed' || task.status === 'failed' 
        ? new Date(task.updatedAt).getTime()
        : Date.now()
      setElapsedTime(Math.floor((endTime - startTime) / 1000))
      return
    }

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [task.status, task.createdAt, task.updatedAt])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 获取进度条状态
  const getProgressStatus = () => {
    if (task.status === 'completed') return 'success'
    if (task.status === 'failed') return 'exception'
    if (task.status === 'processing') return 'active'
    return 'normal'
  }

  // 生成时间线数据
  const getTimelineItems = () => {
    const items = [
      {
        color: 'blue',
        dot: <ClockCircleOutlined />,
        children: (
          <div>
            <Text strong>任务创建</Text>
            <br />
            <Text type="secondary" className="text-sm">
              {new Date(task.createdAt).toLocaleString()}
            </Text>
          </div>
        )
      }
    ]

    if (task.status === 'processing') {
      items.push({
        color: 'orange',
        dot: <Spin size="small" />,
        children: (
          <div>
            <Text strong>正在处理</Text>
            <br />
            <Text type="secondary" className="text-sm">
              进度: {progress}%
            </Text>
          </div>
        )
      })
    }

    if (task.status === 'completed') {
      items.push({
        color: 'green',
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong>生成完成</Text>
            <br />
            <Text type="secondary" className="text-sm">
              {new Date(task.updatedAt).toLocaleString()}
            </Text>
            {task.result && (
              <div className="mt-1">
                <Text type="secondary" className="text-sm">
                  生成了 {task.result.data.length} 张图片
                </Text>
              </div>
            )}
          </div>
        )
      })
    }

    if (task.status === 'failed') {
      items.push({
        color: 'red',
        dot: <ExclamationCircleOutlined />,
        children: (
          <div>
            <Text strong>生成失败</Text>
            <br />
            <Text type="secondary" className="text-sm">
              {new Date(task.updatedAt).toLocaleString()}
            </Text>
            {task.error && (
              <div className="mt-1">
                <Text type="danger" className="text-sm">
                  {task.error}
                </Text>
              </div>
            )}
          </div>
        )
      })
    }

    return items
  }

  return (
    <Card
      title={
        <Space>
          {statusConfig.icon}
          <span>任务状态</span>
          <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
        </Space>
      }
      extra={
        <Space>
          {task.status === 'failed' && onRetry && (
            <Button
              type="primary"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => onRetry(task.id)}
            >
              重试
            </Button>
          )}
          {(task.status === 'pending' || task.status === 'processing') && onCancel && (
            <Button
              size="small"
              icon={<PauseCircleOutlined />}
              onClick={() => onCancel(task.id)}
            >
              取消
            </Button>
          )}
        </Space>
      }
    >
      <Space direction="vertical" className="w-full" size="middle">
        {/* 基本信息 */}
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Statistic
              title="任务ID"
              value={task.id.slice(-8)}
              prefix="#"
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="耗时"
              value={formatTime(elapsedTime)}
              suffix={isRunning ? <Spin size="small" /> : null}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="进度"
              value={progress}
              suffix="%"
            />
          </Col>
        </Row>

        {/* 进度条 */}
        <Progress
          percent={progress}
          status={getProgressStatus()}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          showInfo={false}
        />

        {/* 状态描述 */}
        <Alert
          type={task.status === 'failed' ? 'error' : 'info'}
          message={statusConfig.description}
          showIcon
        />

        {/* 任务配置信息 */}
        {showDetails && (
          <div className="bg-gray-50 p-3 rounded">
            <Text strong className="text-sm">任务配置：</Text>
            <div className="mt-2 space-y-1">
              <div>
                <Text type="secondary" className="text-sm">
                  模型: {task.config.model}
                </Text>
              </div>
              <div>
                <Text type="secondary" className="text-sm">
                  尺寸: {task.config.size}
                </Text>
              </div>
              <div>
                <Text type="secondary" className="text-sm">
                  参考图片: {task.images.length} 张
                </Text>
              </div>
              {task.config.sequential_image_generation === 'auto' && (
                <div>
                  <Text type="secondary" className="text-sm">
                    组图模式: 最多 {task.config.max_images} 张
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 详细时间线 */}
        {showDetails && (
          <div>
            <Title level={5} className="mb-3">处理时间线</Title>
            <Timeline items={getTimelineItems()} />
          </div>
        )}

        {/* 使用统计 */}
        {task.result?.usage && (
          <div className="bg-blue-50 p-3 rounded">
            <Text strong className="text-sm">使用统计：</Text>
            <Row gutter={16} className="mt-2">
              <Col xs={8}>
                <Text type="secondary" className="text-sm">
                  生成图片: {task.result.usage.generated_images}
                </Text>
              </Col>
              <Col xs={8}>
                <Text type="secondary" className="text-sm">
                  输出Token: {task.result.usage.output_tokens}
                </Text>
              </Col>
              <Col xs={8}>
                <Text type="secondary" className="text-sm">
                  总Token: {task.result.usage.total_tokens}
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </Space>
    </Card>
  )
}

export default TaskStatus