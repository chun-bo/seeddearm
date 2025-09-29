import React from 'react'
import { Typography, Row, Col } from 'antd'
import { 
  UserInfoCard, 
  BasicInfoCard, 
  ApiSettingsCard 
} from '@/components/profile'

const { Title } = Typography

const Profile: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Title level={2}>个人中心</Title>
      
      <Row gutter={[24, 24]}>
        {/* 左侧：用户信息卡片 */}
        <Col xs={24} lg={8}>
          <UserInfoCard />
        </Col>
        
        {/* 右侧：详细信息和设置 */}
        <Col xs={24} lg={16}>
          <div className="space-y-6">
            <BasicInfoCard />
            <ApiSettingsCard />
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Profile