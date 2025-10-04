import React, { useState, useEffect } from 'react'
import { Card, Alert, Form, Input, Button, Space, message } from 'antd'
import { KeyOutlined, SaveOutlined } from '@ant-design/icons'
import { useSettingsStore } from '@/stores/settingsStore'

interface ApiSettingsFormData {
  api_key: string
}

const ApiSettingsCard: React.FC = () => {
  const { 
    settings, 
    loading, 
    updateSettings,
  } = useSettingsStore()
  
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  // 当设置加载完成后，更新表单值
  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        api_key: settings.api_key || ''
      })
    }
  }, [settings, form])

  // 保存API设置
  const handleSaveApiSettings = async (values: ApiSettingsFormData) => {
    setSaving(true)
    try {
      await updateSettings(values)
      message.success('API设置保存成功！')
    } catch (error) {
      message.error('保存API设置失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="API 设置">
      <Alert
        message="API 密钥安全提示"
        description="您的API密钥将被加密存储，仅用于AI换装功能。请妥善保管您的密钥。"
        type="info"
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveApiSettings}
      >
        <Form.Item
          label={
            <span>
              <KeyOutlined className="mr-1" />
              Doubao API 密钥
            </span>
          }
          name="api_key"
          extra="输入您的Doubao API密钥以启用AI换装功能"
          rules={[
            {
              pattern: /^[a-zA-Z0-9\-_]*$/,
              message: '请输入有效的API密钥格式'
            }
          ]}
        >
          <Input.Password
            placeholder="请输入您的Doubao API密钥"
            visibilityToggle
          />
        </Form.Item>

        <div className="flex justify-between items-start">
          <div className="text-sm text-gray-500 flex-1">
            <p className="mb-2">如何获取API密钥：</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>访问 Doubao 开发者平台</li>
              <li>创建应用并获取API密钥</li>
              <li>将密钥粘贴到上方输入框</li>
            </ol>
          </div>
          
          <div className="ml-4">
            <Space>
              <Button onClick={() => form.resetFields()}>
                重置
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving || loading}
                icon={<SaveOutlined />}
              >
                保存设置
              </Button>
            </Space>
          </div>
        </div>
      </Form>
    </Card>
  )
}

export default ApiSettingsCard