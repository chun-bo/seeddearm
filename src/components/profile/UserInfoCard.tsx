import React from 'react'
import { Card, Avatar, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'

const { Title } = Typography

const UserInfoCard: React.FC = () => {
  const { user } = useAuthStore()

  // 获取用户名：优先使用username，否则使用邮箱@前面的部分
  const getDisplayUsername = () => {
    if (user?.username) {
      return user.username
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return '用户'
  }

  return (
    <Card>
      <div className="text-center">
        <Avatar size={80} icon={<UserOutlined />} className="mb-4" />
        <Title level={4}>{getDisplayUsername()}</Title>
        <p className="text-gray-500">{user?.email || '未设置邮箱'}</p>
      </div>
    </Card>
  )
}

export default UserInfoCard