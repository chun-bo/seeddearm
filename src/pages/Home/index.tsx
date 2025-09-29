import React from 'react'
import { Button, Typography, Card, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import { 
  RocketOutlined, 
  SafetyOutlined, 
  ThunderboltOutlined,
  StarOutlined 
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

const Home: React.FC = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <RocketOutlined className="text-2xl text-blue-500" />,
      title: '简单易用',
      description: '只需上传图片和输入提示词，即可生成专业的融合图片',
    },
    {
      icon: <SafetyOutlined className="text-2xl text-green-500" />,
      title: '安全可靠',
      description: '使用您自己的API密钥，数据安全有保障',
    },
    {
      icon: <ThunderboltOutlined className="text-2xl text-yellow-500" />,
      title: '高效处理',
      description: '基于Doubao-Seedream-4.0，处理速度快，效果出色',
    },
    {
      icon: <StarOutlined className="text-2xl text-purple-500" />,
      title: '专业品质',
      description: 'AI智能融合技术，生成高质量的专业图片',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="text-center">
          <Title level={1} className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI图片融合平台
            </span>
          </Title>
          <Paragraph className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            基于 Doubao-Seedream-4.0 的专业图片融合服务，让您轻松创建令人惊艳的AI融合图片。
            使用您自己的API密钥，享受安全、高效的图片处理体验。
          </Paragraph>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              type="primary" 
              size="large" 
              className="h-12 px-8 text-lg"
              onClick={() => navigate('/workspace')}
            >
              开始创作
            </Button>
            <Button 
              size="large" 
              className="h-12 px-8 text-lg"
              onClick={() => navigate('/auth/register')}
            >
              免费注册
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Title level={2} className="text-3xl font-bold mb-4">
            为什么选择我们？
          </Title>
          <Paragraph className="text-lg text-gray-600">
            专业的技术，简单的操作，让AI图片融合触手可及
          </Paragraph>
        </div>
        
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                className="h-full text-center hover:shadow-lg transition-shadow duration-300"
                bordered={false}
              >
                <div className="mb-4">{feature.icon}</div>
                <Title level={4} className="mb-3">
                  {feature.title}
                </Title>
                <Paragraph className="text-gray-600">
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Title level={2} className="text-white mb-4">
            准备开始您的AI创作之旅？
          </Title>
          <Paragraph className="text-blue-100 text-lg mb-8">
            立即注册，获取您的专属工作台，开始创作令人惊艳的AI融合图片
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            className="h-12 px-8 text-lg bg-white text-blue-600 border-white hover:bg-gray-100"
            onClick={() => navigate('/auth/register')}
          >
            立即开始
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Home