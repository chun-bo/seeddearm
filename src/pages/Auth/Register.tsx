import React from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'

const { Title, Text } = Typography

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()

  const onFinish = async (values: { email: string; password: string; username: string }) => {
    try {
      await register(values.email, values.password, values.username)
      message.success('注册成功！')
      navigate('/workspace')
    } catch (error) {
      message.error('注册失败，请稍后重试')
    }
  }

  return (
    <Card className="w-full">
      <div className="text-center mb-8">
        <Title level={2}>创建账户</Title>
        <Text type="secondary">加入 Doubao-Seedream 平台，开始您的AI创作之旅</Text>
      </div>

      <Form
        name="register"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 2, message: '用户名至少2个字符' },
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="请输入用户名"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="请输入邮箱"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入密码"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认密码"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请再次输入密码"
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full"
            loading={isLoading}
          >
            注册
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center">
        <Text type="secondary">
          已有账户？{' '}
          <Link to="/auth/login" className="text-blue-600 hover:text-blue-500">
            立即登录
          </Link>
        </Text>
      </div>
    </Card>
  )
}

export default Register