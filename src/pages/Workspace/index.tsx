import React, { useState, useCallback } from 'react'
import { Typography, Tabs, message } from 'antd'
import { 
  HistoryOutlined, 
  SettingOutlined,
  RocketOutlined 
} from '@ant-design/icons'
import { FusionWorkspace } from '../../components/fusion'
import type { UploadFile, FusionTask } from '../../types'
import { useSettingsStore } from '../../stores/settingsStore'

const { Title } = Typography

const Workspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fusion')
  const [taskHistory, setTaskHistory] = useState<FusionTask[]>([])

  const { settings } = useSettingsStore()

  // 处理任务完成
  const handleTaskComplete = useCallback((task: FusionTask) => {
    console.log('任务完成:', task)
    // 可以在这里添加成功后的处理逻辑
    // 比如跳转到历史记录页面，或者显示成功提示
  }, [])

  // 处理任务保存
  const handleTaskSave = useCallback((task: FusionTask) => {
    setTaskHistory(prev => {
      // 避免重复保存
      const exists = prev.find(t => t.id === task.id)
      if (exists) {
        return prev.map(t => t.id === task.id ? task : t)
      }
      return [task, ...prev]
    })
  }, [])

  // 标签页配置
  const tabItems = [
    {
      key: 'fusion',
      label: (
        <span>
          <RocketOutlined />
          图片融合
        </span>
      ),
      children: (
        <FusionWorkspace
          onTaskComplete={handleTaskComplete}
          onTaskSave={handleTaskSave}
        />
      )
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          历史记录 ({taskHistory.length})
        </span>
      ),
      children: (
        <div className="space-y-4">
          {taskHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <HistoryOutlined className="text-4xl mb-4" />
              <div>暂无历史记录</div>
              <div className="text-sm mt-2">完成的任务将显示在这里</div>
            </div>
          ) : (
            <div className="space-y-4">
              {taskHistory.map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <Title level={5} className="mb-0">{task.title}</Title>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'failed' ? 'bg-red-100 text-red-800' :
                      task.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'completed' ? '已完成' :
                       task.status === 'failed' ? '失败' :
                       task.status === 'processing' ? '处理中' : '等待中'}
                    </span>
                  </div>
                  
                  <div className="text-gray-600 text-sm mb-2">
                    {task.prompt.length > 100 ? `${task.prompt.slice(0, 100)}...` : task.prompt}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>创建时间: {new Date(task.createdAt).toLocaleString()}</span>
                    <span>参考图片: {task.images.length} 张</span>
                  </div>
                  
                  {task.result && task.result.data.length > 0 && (
                    <div className="mt-3 flex space-x-2">
                      {task.result.data.slice(0, 4).map((img, index) => (
                        <img
                          key={index}
                          src={img.url || `data:image/jpeg;base64,${img.b64_json}`}
                          alt={`结果 ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                      {task.result.data.length > 4 && (
                        <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                          +{task.result.data.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Title level={2} className="mb-2">AI 图片融合工作台</Title>
        <div className="text-gray-600">
          使用 Doubao-Seedream 4.0 进行智能图片生成和融合
        </div>
      </div>

      {/* API Key 状态检查 */}
      {!settings?.doubaoApiKey && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <SettingOutlined className="text-yellow-600" />
            <span className="text-yellow-800 font-medium">API Key 未配置</span>
          </div>
          <div className="text-yellow-700 text-sm mt-1">
            请先在 <a href="/profile" className="text-yellow-800 underline">个人中心</a> 配置您的 Doubao API Key 才能使用图片生成功能
          </div>
        </div>
      )}

      {/* 主要内容区域 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        className="workspace-tabs"
      />
    </div>
  )
}

export default Workspace