# Doubao-Seedream 4.0 API 完整开发指南

## 📋 目录

1. [API 概述](#api-概述)
2. [认证与配置](#认证与配置)
3. [请求参数详解](#请求参数详解)
4. [响应格式说明](#响应格式说明)
5. [功能模式详解](#功能模式详解)
6. [TypeScript 类型定义](#typescript-类型定义)
7. [实际应用示例](#实际应用示例)
8. [错误处理](#错误处理)
9. [最佳实践](#最佳实践)
10. [开发注意事项](#开发注意事项)

---

## API 概述

### 基本信息
- **API 端点**: `https://ark.cn-beijing.volces.com/api/v3/images/generations`
- **请求方法**: POST
- **认证方式**: Bearer Token
- **模型名称**: `doubao-seedream-4-0-250828`
- **版本**: 250828
- **限流**: 500 张/分钟

### 核心能力
- **多参考图生成**: 融合多张图片的风格、元素等特征
- **组图生成**: 基于文字和图片生成一组内容关联的图像
- **单图生成**: 基于文字描述生成单张图片
- **图文生成**: 结合已有图片和文字提示进行图像编辑

---

## 认证与配置

### API Key 获取
1. 获取 ARK_API_KEY
2. 开通模型服务
3. 在模型列表获取所需 Model ID

### 请求头配置
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ARK_API_KEY}`
}
```

---

## 请求参数详解

### 必需参数

#### model (string, 必需)
- **值**: `doubao-seedream-4-0-250828`
- **说明**: 使用的模型ID

#### prompt (string, 必需)
- **说明**: 用于生成图像的提示词，支持中英文
- **限制**: 建议不超过300个汉字或600个英文单词
- **注意**: 字数过多信息容易分散，模型可能因此忽略细节

### 可选参数

#### image (string/array, 可选)
- **格式**: URL 或 Base64 编码
- **支持**: doubao-seedream-4.0 支持单图或多图输入
- **数量限制**: 最多10张参考图
- **要求**:
  - 图片格式: jpeg, png
  - 宽高比: [1/3, 3]
  - 最大尺寸: 6000x6000 px
  - 文件大小: ≤ 10MB

**Base64 格式示例**:
data:image/<图片格式>;base64,<Base64编码>

#### size (string, 可选)
支持两种指定方式：

**方式1 - 预设尺寸**:
- `1K`, `2K`, `4K`

**方式2 - 具体像素值**:
- 默认值: `2048x2048`
- 总像素取值范围: `[1280x720, 4096x4096]`
- 宽高比取值范围: `[1/16, 16]`

**推荐宽高像素值**:
| 宽高比 | 像素值 |
|--------|--------|
| 1:1 | 2048x2048 |
| 4:3 | 2304x1728 |
| 3:4 | 1728x2304 |
| 16:9 | 2560x1440 |
| 9:16 | 1440x2560 |
| 3:2 | 2496x1664 |
| 2:3 | 1664x2496 |
| 21:9 | 3024x1296 |

#### seed (integer, 可选)
- **说明**: 随机数种子，用于控制模型生成内容的随机性
- **取值范围**: [-1, 2147483647]
- **注意**: 仅 doubao-seedream-3.0-t2i, doubao-seededit-3.0-i2i 支持
- **Seedream 4.0**: 可以传入，但不生效

#### sequential_image_generation (string, 可选)
- **默认值**: `disabled`
- **说明**: 控制是否关闭组图功能
- **取值**:
  - `auto`: 自动判断模式，模型会根据用户提供的提示词自主判断是否返回组图以及组图包含的图片数量
  - `disabled`: 关闭组图功能，模型只会生成一张图

#### sequential_image_generation_options (object, 可选)
- **说明**: 组图功能的配置，仅当 `sequential_image_generation` 为 `auto` 时生效
- **属性**:
  - `max_images` (integer): 指定本次请求最多可生成的图片数量，取值范围 [1, 15]，默认值 15

#### stream (boolean, 可选)
- **默认值**: `false`
- **说明**: 控制是否开启流式输出模式
- **取值**:
  - `false`: 非流式输出模式，等待所有图片全部生成完毕后一次性返回所有信息
  - `true`: 流式输出模式，即时返回每张图片输出的结果

#### guidance_scale (float, 可选)
- **说明**: 模型输出结果与prompt的一致程度
- **取值范围**: [1, 10]
- **默认值**:
  - doubao-seedream-3.0-t2i: 2.5
  - doubao-seededit-3.0-i2i: 5.5
  - doubao-seedream-4.0: 不支持

#### response_format (string, 可选)
- **默认值**: `url`
- **说明**: 指定生成图像的返回格式
- **取值**:
  - `url`: 返回图片下载链接，链接在图片生成后24小时内有效
  - `b64_json`: 以 Base64 编码字符串的 JSON 格式返回图像数据

#### watermark (boolean, 可选)
- **默认值**: `true`
- **说明**: 是否在生成的图片中添加水印
- **取值**:
  - `false`: 不添加水印
  - `true`: 在图片右下角添加"AI生成"字样的水印标识

---

## 响应格式说明

### 成功响应结构
```typescript
interface SeedreamResponse {
  model: string;           // 使用的模型ID
  created: number;         // Unix时间戳（秒）
  data: Array<{           // 生成的图片信息数组
    url?: string;         // 图片URL (response_format为url时)
    b64_json?: string;    // Base64编码 (response_format为b64_json时)
    size: string;         // 图片尺寸 "宽x高" 格式
  }>;
  usage: {                // 使用统计信息
    generated_images: number;    // 成功生成的图片数量
    output_tokens: number;       // 输出token数量
    total_tokens: number;        // 总token数量
  };
}
```

### 错误响应结构
```typescript
interface SeedreamError {
  error: {
    code: string;         // 错误码
    message: string;      // 错误提示信息
  };
}
```

### 重要说明
- **图片URL有效期**: 24小时内失效，需要及时下载保存
- **组图生成失败处理**: 如果某张图片生成失败，会继续生成其他图片
- **Token计算**: 计算逻辑为 `sum(图片长*图片宽)/256`，然后取整

---

## 功能模式详解

### 1. 文生图 (纯文本输入单图输出)
通过文字描述来生成对应图像。

**请求示例**:
```json
{
  "model": "doubao-seedream-4-0-250828",
  "prompt": "星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车，抢视觉冲击力，电影大片，末日既视感，动感，对比色，oc渲染，光线追踪，动态模糊，景深，超现实主义，深蓝",
  "size": "2K"
}
```

### 2. 图文生图 (单图输入单图输出)
基于已有图片，结合文字提示进行图像编辑，包括图像元素增删、风格转化、材质替换、色调迁移、改变背景视角/尺寸等。

**请求示例**:
```json
{
  "model": "doubao-seedream-4-0-250828",
  "prompt": "生成狗狗躺在草地上的近景画面",
  "image": "https://ark-project.tos-cn-beijing.volces.com/doc_image/seedream4_imageToimage_1.png",
  "size": "2K"
}
```

### 3. 多图融合 (多图输入单图输出)
根据您输入的文本描述和多张参考图片，融合它们的风格、元素等特征来生成新图像。如衣服鞋与模特图融合成穿搭图，人物与风景融合为人物风景图等。

**关键设置**:
- 不指定 `sequential_image_generation`，或配置为 `disabled`

**请求示例**:
```json
{
  "model": "doubao-seedream-4-0-250828",
  "prompt": "将图1的服装换为图2的服装",
  "image": [
    "https://ark-project.tos-cn-beijing.volces.com/doc_image/seedream4_imagesToimage_1.png",
    "https://ark-project.tos-cn-beijing.volces.com/doc_image/seedream4_imagesToimage_2.png"
  ],
  "sequential_image_generation": "disabled",
  "size": "2K"
}
```

### 4. 组图输出 (多图输出)
支持通过一张或者多张图片和文字信息，生成漫画分镜、品牌视觉等一组内容关联的图片。

**请求示例**:
```json
{
  "model": "doubao-seedream-4-0-250828",
  "prompt": "生成一组共4张连贯画面，移心为同一座院一角的四季变迁，以统一风格展现四季独特色彩、元素与氛围",
  "size": "2K",
  "sequential_image_generation": "auto",
  "sequential_image_generation_options": {
    "max_images": 4
  }
}
```

### 5. 单张图生组图
**请求示例**:
```json
{
  "model": "doubao-seedream-4-0-250828",
  "prompt": "参考这个LOGO，做一套户外运动品牌视觉设计，品牌名称为GREEN，包括包装袋、帽子、纸盒、手环、挂绳等，绿色视觉主色调",
  "image": "https://ark-project.tos-cn-beijing.volces.com/doc_image/seedream4_imageToImages.png",
  "sequential_image_generation": "auto",
  "sequential_image_generation_options": {
    "max_images": 5
  }
}
```

### 6. 多参考图生组图
**请求示例**:
```json
{
  "model": "doubao-seedream-4-0-250828",
  "prompt": "生成3张女孩和狗狗在游乐园的图片，温馨早晨、中午、晚上",
  "image": [
    "https://ark-project.tos-cn-beijing.volces.com/doc_image/seedream4_imagesToImages_1.png",
    "https://ark-project.tos-cn-beijing.volces.com/doc_image/seedream4_imagesToImages_2.png"
  ],
  "sequential_image_generation": "auto",
  "sequential_image_generation_options": {
    "max_images": 3
  },
  "size": "2K"
}
```

### 7. 流式输出
通过参数 `stream` 开启流式输出模式，模型生成任一图片即返回结果，让您能更快地观察到生成的图像，改善等待体验。

**请求示例**:
```json
{
  "model": "doubao-seedream-4-0-250828",
  "prompt": "参考这个LOGO，做一套户外运动品牌视觉设计，品牌名称为GREEN，包括包装袋、帽子、纸盒、手环、挂绳等，绿色视觉主色调",
  "image": "https://ark-project.tos-cn-beijing.volces.com/doc_image/seedream4_imageToImages.png",
  "sequential_image_generation": "auto",
  "sequential_image_generation_options": {
    "max_images": 3
  },
  "size": "2K",
  "stream": true
}
```

---

## TypeScript 类型定义

### 请求类型
```typescript
interface SeedreamRequest {
  model: string;
  prompt: string;
  image?: string | string[];
  size?: string;
  seed?: number;
  sequential_image_generation?: 'auto' | 'disabled';
  sequential_image_generation_options?: {
    max_images?: number;
  };
  stream?: boolean;
  guidance_scale?: number;
  response_format?: 'url' | 'b64_json';
  watermark?: boolean;
}
```

### 响应类型
```typescript
interface SeedreamResponse {
  model: string;
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    size: string;
  }>;
  usage: {
    generated_images: number;
    output_tokens: number;
    total_tokens: number;
  };
}

interface SeedreamError {
  error: {
    code: string;
    message: string;
  };
}
```

### 任务状态类型
```typescript
interface GenerationTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  images: string[];
  result?: SeedreamResponse;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 实际应用示例

### JavaScript/TypeScript 实现
```typescript
class SeedreamAPI {
  private apiKey: string;
  private baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: SeedreamRequest): Promise<SeedreamResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error: SeedreamError = await response.json();
      throw new Error(`API Error: ${error.error.code} - ${error.error.message}`);
    }

    return await response.json();
  }

  // 多图融合
  async fuseImages(prompt: string, images: string[], options?: Partial<SeedreamRequest>) {
    return this.generateImage({
      model: 'doubao-seedream-4-0-250828',
      prompt,
      image: images,
      sequential_image_generation: 'disabled',
      size: '2K',
      response_format: 'url',
      watermark: true,
      ...options
    });
  }

  // 组图生成
  async generateImageSet(prompt: string, maxImages: number = 4, referenceImages?: string[]) {
    return this.generateImage({
      model: 'doubao-seedream-4-0-250828',
      prompt,
      image: referenceImages,
      sequential_image_generation: 'auto',
      sequential_image_generation_options: { max_images: maxImages },
      size: '2K',
      response_format: 'url',
      watermark: true
    });
  }

  // 文生图
  async textToImage(prompt: string, options?: Partial<SeedreamRequest>) {
    return this.generateImage({
      model: 'doubao-seedream-4-0-250828',
      prompt,
      size: '2K',
      response_format: 'url',
      watermark: true,
      ...options
    });
  }
}
```

### 使用示例
```typescript
const api = new SeedreamAPI('your-api-key');

// 文生图
const textResult = await api.textToImage('一只可爱的小猫在花园里玩耍');

// 多图融合
const fuseResult = await api.fuseImages(
  '将第一张图的人物穿上第二张图的服装',
  ['image1_url', 'image2_url']
);

// 组图生成
const setResult = await api.generateImageSet(
  '生成一组展现四季变化的风景图',
  4
);
```

---

## 错误处理

### 常见错误类型
1. **认证错误**: API Key 无效或过期
2. **参数错误**: 请求参数不符合要求
3. **图片格式错误**: 上传的图片格式不支持
4. **配额限制**: 超出使用限制
5. **服务器错误**: 内部服务器错误

### 错误处理最佳实践
```typescript
async function handleSeedreamRequest(request: SeedreamRequest) {
  try {
    const result = await api.generateImage(request);
    return { success: true, data: result };
  } catch (error) {
    console.error('Seedream API Error:', error);
    
    if (error.message.includes('401')) {
      return { success: false, error: 'API Key 无效，请检查配置' };
    } else if (error.message.includes('400')) {
      return { success: false, error: '请求参数错误，请检查输入' };
    } else if (error.message.includes('429')) {
      return { success: false, error: '请求过于频繁，请稍后重试' };
    } else {
      return { success: false, error: '服务暂时不可用，请稍后重试' };
    }
  }
}
```

---

## 最佳实践

### 1. 提示词优化
- **具体明确**: 避免模糊的描述，提供具体的细节
- **结构化**: 使用逗号分隔不同的描述要素
- **风格指定**: 明确指定艺术风格、色彩偏好等
- **长度控制**: 保持在300字以内，避免信息过载

### 2. 图片处理
- **格式转换**: 确保图片为 JPEG 或 PNG 格式
- **尺寸优化**: 控制图片大小在10MB以内
- **Base64编码**: 对于小图片可以使用Base64编码直接传输

### 3. 性能优化
- **批量处理**: 合理使用组图功能减少API调用次数
- **缓存策略**: 缓存生成结果，避免重复请求
- **异步处理**: 使用异步方式处理长时间的生成任务

### 4. 用户体验
- **进度反馈**: 显示生成进度和状态
- **错误提示**: 提供友好的错误信息
- **结果预览**: 及时展示生成结果

---

## 开发注意事项

### 1. API 限制
- **频率限制**: 500张/分钟
- **图片数量**: 最多10张参考图
- **文件大小**: 单张图片最大10MB
- **URL有效期**: 生成的图片URL 24小时内有效

### 2. 兼容性说明
- **Seedream 4.0 不支持**: `seed` 参数（可传入但不生效）
- **Seedream 4.0 不支持**: `guidance_scale` 参数（传入被忽略）

### 3. 安全考虑
- **API Key 保护**: 不要在客户端暴露API Key
- **输入验证**: 验证用户输入的提示词和图片
- **内容审核**: 对生成的内容进行适当的审核

### 4. 成本控制
- **Token 计算**: 了解Token计算方式，合理控制成本
- **使用统计**: 记录API使用情况，监控成本
- **优化策略**: 根据使用情况优化请求参数

---

## 总结

本文档涵盖了 Doubao-Seedream 4.0 API 的完整使用指南，包括：

- ✅ 完整的API参数说明
- ✅ 详细的功能模式介绍
- ✅ TypeScript类型定义
- ✅ 实际代码示例
- ✅ 错误处理方案
- ✅ 最佳实践建议

通过本文档，开发者可以快速上手并高效地集成 Doubao-Seedream API 到自己的应用中。

---

*文档版本: v1.0*  