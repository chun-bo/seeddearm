import React from 'react'
import { Typography, Card } from 'antd'

const { Title } = Typography

const History: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Title level={2}>历史记录</Title>
      <Card>
        <p>历史记录页面正在开发中...</p>
        <p>这里将显示用户的所有项目历史。</p>
      </Card>
    </div>
  )
}

export default History