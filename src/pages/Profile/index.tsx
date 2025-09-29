import React from 'react'
import { Typography, Card, Row, Col, Avatar, Button, Descriptions, Divider } from 'antd'
import { UserOutlined, EditOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'

const { Title } = Typography

const Profile: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Title level={2}>个人中心</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div className="text-center">
              <Avatar size={80} icon={<UserOutlined />} className="mb-4" />
              <Title level={4}>{user?.username || '用户'}</Title>
              <p className="text-gray-500">{user?.email || 'user@example.com'}</p>
              <Button type="primary" icon={<EditOutlined />} className="mt-4">
                编辑资料
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card title="基本信息">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="用户名">
                {user?.username || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {user?.email || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {user?.createdAt || '2024-01-01'}
              </Descriptions.Item>
              <Descriptions.Item label="最后登录">
                {user?.lastLoginAt || '刚刚'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Title level={4}>API 设置</Title>
            <p className="text-gray-600 mb-4">
              配置您的 API 密钥以使用 AI 换装功能
            </p>
            <Button type="default">
              配置 API 密钥
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile