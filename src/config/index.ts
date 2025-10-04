export const config = {
  // API配置
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 30000,
  },
  
  // Doubao API配置
  doubao: {
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-seedream-4.0',
  },
  
  // 文件上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 5,
  },
  
  // 应用配置
  app: {
    name: 'Doubao-Seedream 图片融合平台',
    version: '1.0.0',
    description: '专业的AI图片融合平台',
  },
  
  // 环境配置
  env: {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  },
  
  // 监控配置
  monitoring: {
    enableErrorReporting: import.meta.env.PROD,
    enablePerformanceMonitoring: import.meta.env.PROD,
    logLevel: import.meta.env.PROD ? 'error' : 'debug',
  },
  
  // 性能配置
  performance: {
    enableLazyLoading: true,
    imageOptimization: true,
    cacheTimeout: 5 * 60 * 1000, // 5分钟
  }
}

// 导出环境检查函数
export const isProduction = () => config.env.isProduction;
export const isDevelopment = () => config.env.isDevelopment;

// 导出日志函数
export const log = {
  debug: (...args: any[]) => {
    if (config.monitoring.logLevel === 'debug') {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  }
};