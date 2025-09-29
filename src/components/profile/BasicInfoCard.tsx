import React from 'react'
import { Card, Descriptions } from 'antd'
import { useAuthStore } from '@/stores/authStore'

const BasicInfoCard: React.FC = () => {
  const { user } = useAuthStore()

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // 获取显示的用户名：优先使用username，否则使用邮箱@前面的部分
  const getDisplayUsername = () => {
    if (user?.username) {
      return user.username
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return '未设置'
  }

  return (
    <Card title="基本信息" className="hover-card">
      <Descriptions column={1} bordered>
        <Descriptions.Item label="用户名">
          {getDisplayUsername()}
        </Descriptions.Item>
        <Descriptions.Item label="邮箱">
          {user?.email || '未设置'}
        </Descriptions.Item>
        <Descriptions.Item label="注册时间">
          {user?.createdAt ? formatDate(user.createdAt) : '未知'}
        </Descriptions.Item>
        <Descriptions.Item label="最后更新">
          {user?.updatedAt ? formatDate(user.updatedAt) : '未知'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}

export default BasicInfoCard