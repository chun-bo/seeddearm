import React from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'

const { Title, Text } = Typography

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password)
      message.success('登录成功！')
      navigate('/workspace')
    } catch (error) {
      message.error('登录失败，请检查邮箱和密码')
    }
  }

  return (
    <Card className="w-full">
      <div className="text-center mb-8">
        <Title level={2}>登录账户</Title>
        <Text type="secondary">欢迎回到 Doubao-Seedream 平台</Text>
      </div>

      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="请输入邮箱"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入密码"
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full"
            loading={isLoading}
          >
            登录
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center">
        <Text type="secondary">
          还没有账户？{' '}
          <Link to="/auth/register" className="text-blue-600 hover:text-blue-500">
            立即注册
          </Link>
        </Text>
      </div>
    </Card>
  )
}

export default Login