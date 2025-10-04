import type { 
  SeedreamRequest, 
  SeedreamResponse, 
  SeedreamError,
  FusionTask,
  CreateFusionTaskRequest 
} from '@/types'

/**
 * Doubao-Seedream API 服务类
 * 负责与 Doubao-Seedream API 的所有交互
 */
export class SeedreamAPI {
  private apiKey: string
  private baseUrl = '/api/proxy' // 修改：使用Vercel代理端点
  private defaultModel = 'doubao-seedream-4-0-250828'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 验证 API Key 是否有效
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // 发送一个简单的测试请求
      await this.generateImage({
        model: this.defaultModel,
        prompt: 'test',
        size: '1K'
      })
      return true
    } catch (error) {
      console.error('API Key validation failed:', error)
      return false
    }
  }

  /**
   * 生成图片的核心方法
   */
  async generateImage(request: SeedreamRequest): Promise<SeedreamResponse> {
    if (!this.apiKey) {
      throw new Error('API Key 未设置')
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.defaultModel,
        response_format: 'url',
        watermark: true,
        ...request
      })
    })

    if (!response.ok) {
      const error: SeedreamError = await response.json()
      throw new Error(`API Error: ${error.error.code} - ${error.error.message}`)
    }

    return await response.json()
  }

  /**
   * 文生图 - 纯文本生成图片
   */
  async textToImage(
    prompt: string, 
    options?: Partial<SeedreamRequest>
  ): Promise<SeedreamResponse> {
    return this.generateImage({
      model: this.defaultModel,
      prompt,
      size: '2K',
      sequential_image_generation: 'disabled',
      ...options
    })
  }

  /**
   * 图文生图 - 基于单张图片和文字生成
   */
  async imageToImage(
    prompt: string, 
    imageUrl: string, 
    options?: Partial<SeedreamRequest>
  ): Promise<SeedreamResponse> {
    return this.generateImage({
      model: this.defaultModel,
      prompt,
      image: imageUrl,
      size: '2K',
      sequential_image_generation: 'disabled',
      ...options
    })
  }

  /**
   * 多图融合 - 融合多张图片的特征
   */
  async fuseImages(
    prompt: string, 
    imageUrls: string[], 
    options?: Partial<SeedreamRequest>
  ): Promise<SeedreamResponse> {
    if (imageUrls.length === 0) {
      throw new Error('至少需要一张参考图片')
    }
    if (imageUrls.length > 10) {
      throw new Error('最多支持10张参考图片')
    }

    return this.generateImage({
      model: this.defaultModel,
      prompt,
      image: imageUrls,
      size: '2K',
      sequential_image_generation: 'disabled',
      ...options
    })
  }

  /**
   * 组图生成 - 生成一组相关图片
   */
  async generateImageSet(
    prompt: string, 
    maxImages: number = 4,
    referenceImages?: string[],
    options?: Partial<SeedreamRequest>
  ): Promise<SeedreamResponse> {
    if (maxImages < 1 || maxImages > 15) {
      throw new Error('图片数量必须在1-15之间')
    }

    return this.generateImage({
      model: this.defaultModel,
      prompt,
      image: referenceImages,
      size: '2K',
      sequential_image_generation: 'auto',
      sequential_image_generation_options: { max_images: maxImages },
      ...options
    })
  }

  /**
   * 流式生成 - 支持实时返回结果
   */
  async generateWithStream(
    request: SeedreamRequest,
    onProgress?: (data: any) => void
  ): Promise<SeedreamResponse> {
    if (!this.apiKey) {
      throw new Error('API Key 未设置')
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.defaultModel,
        stream: true,
        response_format: 'url',
        watermark: true,
        ...request
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API 请求失败:', errorText)
      try {
        const errorJson: SeedreamError = JSON.parse(errorText)
        throw new Error(`API Error: ${errorJson.error.code} - ${errorJson.error.message}`)
      } catch (e) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText} - ${errorText}`)
      }
    }

    // 处理流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    
    // 用于累积结果的状态变量
    const imageDataArray: { url: string; size: string; }[] = [];
    let usage: any = null;
    let finalModel: string | undefined;
    let finalCreated: number | undefined;
    let finalError: any = null;

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6).trim()
            if (content === '[DONE]') {
              console.log('收到流结束标志 [DONE]')
              continue
            }
            try {
              const data = JSON.parse(content)
              if (onProgress) {
                onProgress(data)
              }
              
              // 累积数据而不是覆盖
              if (data.url) {
                imageDataArray.push({
                    url: data.url,
                    size: data.size || ''
                });
              }
              if (data.usage) {
                usage = data.usage;
              }
              if (data.model) {
                finalModel = data.model;
              }
              if (data.created) {
                finalCreated = data.created;
              }
              if (data.error) {
                finalError = data.error;
              }

            } catch (e) {
              console.warn('解析流JSON数据失败:', content)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    // 最终检查和组装
    if (imageDataArray.length > 0 && usage) {
      const assembledResponse: SeedreamResponse = {
        model: finalModel || this.defaultModel,
        created: finalCreated || Math.floor(Date.now() / 1000),
        usage: usage,
        data: imageDataArray,
      };
      console.log(`成功组装最终结果，包含 ${imageDataArray.length} 张图片:`, assembledResponse);
      return assembledResponse;
    }

    // 错误处理
    console.error('流处理完成，但未生成有效结果或用量信息缺失。', { imageDataArray, usage });
    if (finalError) {
      throw new Error(`API 返回明确错误: ${finalError.message} (代码: ${finalError.code})`);
    }
    throw new Error('未收到有效的生成结果，图片URL或用量信息缺失。');
  }

  /**
   * 将 File 对象转换为 Base64 字符串
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * 批量将 File 对象转换为 Base64
   */
  async filesToBase64(files: File[]): Promise<string[]> {
    return Promise.all(files.map(file => this.fileToBase64(file)))
  }

  /**
   * 下载生成的图片
   */
  async downloadImage(url: string, filename?: string): Promise<void> {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || `seedream_${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('下载图片失败:', error)
      throw new Error('下载图片失败')
    }
  }

  /**
   * 批量下载图片
   */
  async downloadImages(urls: string[], prefix?: string): Promise<void> {
    for (let i = 0; i < urls.length; i++) {
      const filename = `${prefix || 'seedream'}_${i + 1}_${Date.now()}.jpg`
      await this.downloadImage(urls[i], filename)
      // 添加延迟避免浏览器限制
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }
}

/**
 * 创建 SeedreamAPI 实例的工厂函数
 */
export function createSeedreamAPI(apiKey: string): SeedreamAPI {
  return new SeedreamAPI(apiKey)
}

/**
 * 默认的 API 配置
 */
export const DEFAULT_SEEDREAM_CONFIG: Partial<SeedreamRequest> = {
  model: 'doubao-seedream-4-0-250828',
  size: '2K',
  response_format: 'url',
  watermark: true,
  sequential_image_generation: 'disabled'
}