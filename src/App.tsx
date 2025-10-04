import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import ErrorBoundary from './components/ErrorBoundary'
import AppHeader from './components/layout/AppHeader'
import AppFooter from './components/layout/AppFooter'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Workspace from './pages/Workspace'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

const { Content } = Layout

function App() {
  return (
    <ErrorBoundary>
      <Layout className="min-h-screen">
        <AppHeader />
        <Content className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/*" element={<Auth />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Content>
        <AppFooter />
      </Layout>
    </ErrorBoundary>
  )
}

export default App
