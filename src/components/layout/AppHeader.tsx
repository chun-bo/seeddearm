import React from 'react'
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'

const { Header } = Layout

const AppHeader: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  const menuItems = [
    {
      key: '/',
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/workspace',
      label: <Link to="/workspace">工作台</Link>,
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ]

  return (
    <Header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-8">
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DS</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Doubao-Seedream
            </span>
          </Link>
        </div>

        {/* 导航菜单 */}
        <div className="flex-1 flex justify-center">
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-none bg-transparent"
          />
        </div>

        {/* 用户区域 */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <Avatar
                  size="small"
                  src={user?.avatar}
                  icon={<UserOutlined />}
                />
                <span className="text-gray-700 hidden sm:block">
                  {user?.username || user?.email}
                </span>
              </div>
            </Dropdown>
          ) : (
            <div className="flex items-center space-x-2">
              <Button type="text" onClick={() => navigate('/auth/login')}>
                登录
              </Button>
              <Button type="primary" onClick={() => navigate('/auth/register')}>
                注册
              </Button>
            </div>
          )}
        </div>
      </div>
    </Header>
  )
}

export default AppHeader