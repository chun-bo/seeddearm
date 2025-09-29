import React from 'react'
import { Typography, Card } from 'antd'

const { Title } = Typography

const Workspace: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Title level={2}>工作台</Title>
      <Card>
        <p>工作台页面正在开发中...</p>
        <p>这里将包含图片上传、融合功能等核心功能。</p>
      </Card>
    </div>
  )
}

export default Workspace