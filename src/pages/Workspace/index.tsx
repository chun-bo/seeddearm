import React, { useState, useCallback } from 'react'
import { Typography, Tabs, message } from 'antd'
import { 
  PictureOutlined, 
  HistoryOutlined, 
  SettingOutlined,
  RocketOutlined 
} from '@ant-design/icons'
import { FusionWorkspace } from '../../components/fusion'
import { ImageUpload, ImageList } from '../../components/image'
import type { UploadFile, FusionTask } from '../../types'
import { useSettingsStore } from '../../stores/settingsStore'

const { Title } = Typography

const Workspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fusion')
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [taskHistory, setTaskHistory] = useState<FusionTask[]>([])

  const { settings } = useSettingsStore()

  // 处理图片上传
  const handleImageUpload = useCallback((newFiles: UploadFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  // 处理图片删除
  const handleImageRemove = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }, [])

  // 清空所有图片
  const handleClearAll = useCallback(() => {
    setUploadedFiles([])
  }, [])

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
      key: 'upload',
      label: (
        <span>
          <PictureOutlined />
          图片管理
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* 图片上传区域 */}
          <div className="bg-white p-6 rounded-lg border">
            <Title level={4} className="mb-4">图片上传</Title>
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">
                  请选择要处理的图片文件，支持 JPG、PNG、WebP 格式，最多10张
                </span>
              </div>
              
              <ImageUpload 
                onUpload={handleImageUpload}
                maxCount={10}
                disabled={!settings?.doubaoApiKey}
              />
            </div>
          </div>

          {/* 图片列表区域 */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="mb-0">已上传的图片 ({uploadedFiles.length})</Title>
                <button 
                  className="text-red-500 hover:text-red-700 text-sm"
                  onClick={handleClearAll}
                >
                  清空所有
                </button>
              </div>
              
              <ImageList 
                files={uploadedFiles}
                onRemove={handleImageRemove}
                showRemoveButton={true}
              />
            </div>
          )}

          {/* 使用提示 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Title level={5} className="text-blue-800 mb-2">💡 使用提示</Title>
            <div className="text-blue-700 text-sm space-y-1">
              <div>• 上传的图片将作为参考图片用于图片融合</div>
              <div>• 支持多种生成模式：文生图、图文生图、多图融合、组图生成</div>
              <div>• 建议图片清晰度高，主体明确，以获得更好的融合效果</div>
              <div>• 上传完成后可切换到"图片融合"标签开始创作</div>
            </div>
          </div>
        </div>
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