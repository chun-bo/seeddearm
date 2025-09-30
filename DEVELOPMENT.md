# 开发指南

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 构建项目
```bash
npm run build
```

### 4. 预览构建结果
```bash
npm run preview
```

## 开发规范

### 代码格式化
```bash
npm run format
```

### 代码检查
```bash
npm run lint
npm run lint:fix
```

## 项目结构

- `src/components/` - 组件库
  - `auth/` - 认证相关组件
  - `image/` - 图片处理组件
  - `fusion/` - 图片融合组件 ⭐ 新增
  - `layout/` - 布局组件
  - `profile/` - 个人中心组件
- `src/pages/` - 页面组件
- `src/services/` - API服务
  - `mockApi.ts` - Mock API 服务
  - `seedreamApi.ts` - Doubao-Seedream API 服务 ⭐ 新增
  - `fusionTaskService.ts` - 任务管理服务 ⭐ 新增
- `src/stores/` - 状态管理
- `src/utils/` - 工具函数
- `src/types/` - TypeScript类型定义
- `src/styles/` - 样式文件
- `docs/` - 项目文档
  - `SEEDREAM_API_GUIDE.md` - API 使用指南 ⭐ 新增

## 当前进度

✅ **阶段一：本地环境搭建** ***已完成***
- [x] 初始化 React + TypeScript 项目
- [x] 配置开发工具链
- [x] 搭建基础路由和页面结构
- [x] 集成 Ant Design 和 Tailwind CSS
- [x] 创建 Mock API 服务

✅ **阶段二：用户系统开发** ***已完成***
- [x] 用户认证系统（登录/注册）
- [x] 用户状态管理（Zustand）
- [x] 个人中心页面
- [x] 用户设置系统
  - [x] 主题切换（明暗模式）
  - [x] API密钥管理
  - [x] 设置持久化存储
  - [x] 模块化组件设计

✅ **阶段三：图片上传与管理** ***已完成***
- [x] 基础图片上传与预览功能
- [x] ImageUpload, ImagePreview, ImageList 组件开发
- [x] Workspace 页面集成
- [x] 图片列表管理（增/删）
- [x] 修复图片删除按钮样式问题

✅ **阶段四：图片融合功能** ***已完成***
- [x] 设计 API 代理服务架构
- [x] 实现 Doubao-Seedream API 集成
- [x] 创建提示词输入组件
- [x] 实现任务提交和状态查询
- [x] 结果图片展示和下载
- [x] 完整的工作流程界面

### 阶段四详细功能

#### 🔧 **核心服务层**
- [x] **SeedreamAPI 类** - 完整的 API 封装
  - [x] 文生图、图文生图、多图融合、组图生成
  - [x] 流式输出支持
  - [x] 文件处理和下载功能
  - [x] 错误处理和重试机制

- [x] **FusionTaskService 类** - 任务管理服务
  - [x] 任务创建、提交、状态跟踪
  - [x] 流式任务处理和进度回调
  - [x] 任务历史和结果管理

#### 🎨 **用户界面组件**
- [x] **PromptInput** - 智能提示词输入
  - [x] 分类提示词建议（风格转换、场景变换、服装换装、艺术创作）
  - [x] 最近使用历史
  - [x] 字数统计和验证

- [x] **TaskConfig** - 任务配置
  - [x] 智能模式选择和推荐
  - [x] 完整参数配置（尺寸、格式、水印等）
  - [x] 配置验证和提示

- [x] **TaskStatus** - 任务状态监控
  - [x] 实时进度显示
  - [x] 详细时间线
  - [x] 重试和取消操作

- [x] **ResultDisplay** - 结果展示
  - [x] 多图展示和查看器
  - [x] 下载功能（单张/批量）
  - [x] 分享和复制链接

- [x] **FusionWorkspace** - 主工作区
  - [x] 步骤式引导界面
  - [x] 完整工作流程管理
  - [x] 错误处理和用户反馈

#### 📱 **页面集成**
- [x] **Workspace 页面重构**
  - [x] 标签页式界面设计
  - [x] 图片融合主功能
  - [x] 图片管理功能
  - [x] 历史记录展示
  - [x] API Key 状态检查

#### 🎯 **类型定义**
- [x] **完整的 TypeScript 类型**
  - [x] SeedreamRequest/Response 接口
  - [x] FusionTask 任务类型
  - [x] 融合模式枚举
  - [x] 预设尺寸配置

#### 📚 **文档和指南**
- [x] **完整的 API 开发文档**
  - [x] 参数说明和示例
  - [x] 功能模式详解
  - [x] 最佳实践指南
  - [x] 错误处理方案

### 验收标准检查

✅ **可以使用用户的 API 密钥调用服务**
- API Key 配置和验证
- 安全的密钥存储和使用

✅ **图片生成功能正常工作**
- 支持所有生成模式（文生图、图文生图、多图融合、组图生成）
- 完整的参数配置和验证
- 错误处理和重试机制

✅ **任务状态实时更新**
- 实时进度显示
- 流式输出支持
- 详细的状态跟踪

## 🔄 下一步：阶段五 - 历史记录和项目管理

准备开始阶段五的开发工作：
- [ ] 设计项目数据结构
- [ ] 实现历史记录列表
- [ ] 项目详情页面
- [ ] 搜索和筛选功能
- [ ] 批量操作功能

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **UI库**: Ant Design 5.x + Tailwind CSS
- **状态管理**: Zustand
- **API服务**: Doubao-Seedream 4.0
- **样式**: CSS Modules + Tailwind CSS
