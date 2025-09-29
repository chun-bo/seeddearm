import React from 'react'
import { Card, Avatar, Button, Typography } from 'antd'
import { UserOutlined, EditOutlined } from '@ant-design/icons'
import type { User } from '@/types'

const { Title } = Typography

interface UserInfoCardProps {
  user: User | null
  onEditProfile?: () => void
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, onEditProfile }) => {
  return (
    <Card>
      <div className="text-center">
        <Avatar size={80} icon={<UserOutlined />} className="mb-4" />
        <Title level={4}>{user?.username || '13254165'}</Title>
        <p className="text-gray-500">{user?.email || '13254165@qq.com'}</p>
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          className="mt-4"
          onClick={onEditProfile}
        >
          编辑资料
        </Button>
      </div>
    </Card>
  )
}

export default UserInfoCard