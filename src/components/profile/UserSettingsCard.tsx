import React, { useEffect } from 'react'
import { Card, Switch, Typography, Spin, message } from 'antd'
import { SettingOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { useSettingsStore } from '@/stores/settingsStore'

const { Text } = Typography

const UserSettingsCard: React.FC = () => {
  const { 
    settings, 
    loading, 
    error, 
    loadSettings, 
    updateTheme,
    clearError 
  } = useSettingsStore()

  // 初始化设置
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // 清除错误信息
  useEffect(() => {
    if (error) {
      message.error(error)
      clearError()
    }
  }, [error, clearError])

  // 主题切换处理
  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    updateTheme(newTheme)
    message.success(`已切换到${newTheme === 'dark' ? '深色' : '浅色'}模式`)
  }

  return (
    <Card 
      title={
        <span>
          <SettingOutlined className="mr-2" />
          界面设置
        </span>
      }
    >
      {loading && !settings ? (
        <div className="text-center py-4">
          <Spin />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <Text strong>主题模式</Text>
            <div className="text-gray-500 text-sm">
              选择浅色或深色主题
            </div>
          </div>
          <Switch
            checked={settings?.theme === 'dark'}
            onChange={handleThemeChange}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </div>
      )}
    </Card>
  )
}

export default UserSettingsCard