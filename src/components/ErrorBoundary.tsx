import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('应用错误:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // 生产环境中记录错误
    if (import.meta.env.PROD) {
      console.error('生产环境错误:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Result
            status="500"
            title="页面出现错误"
            subTitle="抱歉，页面遇到了一些问题。请尝试刷新页面或返回首页。"
            extra={[
              <Button type="primary" onClick={this.handleReload} key="reload">
                刷新页面
              </Button>,
              <Button onClick={this.handleGoHome} key="home">
                返回首页
              </Button>
            ]}
          />
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '800px' }}>
              <summary>错误详情 (仅开发环境显示)</summary>
              <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;