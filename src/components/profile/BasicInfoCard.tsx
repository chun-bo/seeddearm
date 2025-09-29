import React from 'react'
import { Card, Descriptions } from 'antd'
import type { User } from '@/types'

interface BasicInfoCardProps {
  user: User | null
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ user }) => {
  return (
    <Card title="基本信息">
      <Descriptions column={1} bordered>
        <Descriptions.Item label="用户名">
          {user?.username || '13254165'}
        </Descriptions.Item>
        <Descriptions.Item label="邮箱">
          {user?.email || '13254165@qq.com'}
        </Descriptions.Item>
        <Descriptions.Item label="注册时间">
          {user?.createdAt || '2025-09-29T07:36:32.695Z'}
        </Descriptions.Item>
        <Descriptions.Item label="最后登录">
          {user?.lastLoginAt || '刚刚'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}

export default BasicInfoCard