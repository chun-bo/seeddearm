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
}