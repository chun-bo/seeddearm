import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Spin } from 'antd'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

/**
 * 路由守卫组件
 * 用于保护需要登录才能访问的页面
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // 如果正在加载认证状态，显示加载器
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  // 如果需要认证但用户未登录，重定向到登录页
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // 如果用户已登录但访问认证页面，重定向到工作台
  if (!requireAuth && isAuthenticated && location.pathname.startsWith('/auth')) {
    return <Navigate to="/workspace" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute