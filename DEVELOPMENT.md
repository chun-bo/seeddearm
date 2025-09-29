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
- `src/pages/` - 页面组件
- `src/services/` - API服务
- `src/stores/` - 状态管理
- `src/utils/` - 工具函数
- `src/types/` - TypeScript类型定义
- `src/hooks/` - 自定义Hooks

## 当前进度

✅ 阶段一：本地环境搭建 ***已完成***
- [x] 初始化 React + TypeScript 项目
- [x] 配置开发工具链
- [x] 搭建基础路由和页面结构
- [x] 集成 Ant Design 和 Tailwind CSS
- [x] 创建 Mock API 服务

✅ 阶段二：用户系统开发 ***已完成***
- [x] 用户认证系统（登录/注册）
- [x] 用户状态管理（Zustand）
- [x] 个人中心页面
- [x] 用户设置系统
  - [x] 主题切换（明暗模式）
  - [x] API密钥管理
  - [x] 设置持久化存储
  - [x] 模块化组件设计

🔄 下一步：阶段三 - 核心功能开发
