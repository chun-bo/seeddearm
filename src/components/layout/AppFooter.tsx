import React from 'react'
import { Layout } from 'antd'

const { Footer } = Layout

const AppFooter: React.FC = () => {
  return (
    <Footer className="bg-gray-50 border-t border-gray-200 text-center py-6">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-gray-600 mb-2">
          © 2024 Doubao-Seedream 图片融合平台. 让AI图片融合变得简单有趣.
        </p>
        <p className="text-sm text-gray-500">
          基于 Doubao-Seedream-4.0 API 构建 | 用户使用自己的API密钥
        </p>
      </div>
    </Footer>
  )
}

export default AppFooter