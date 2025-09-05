# TigShop UniApp 移动端

## 📱 项目介绍

TigShop UniApp 是基于 uni-app 框架开发的跨平台移动端商城应用，支持编译到iOS、Android、H5、以及各种小程序平台。采用 Vue 3 + TypeScript + Vite 的现代化技术栈，为用户提供流畅的购物体验。

### ✨ 特性

- 🚀 **跨平台支持**: 一套代码，多端运行
- 💎 **现代技术栈**: Vue 3 + TypeScript + Vite + Pinia
- 🎨 **UI组件库**: 集成 uView Plus 组件库
- 🌍 **国际化**: 支持多语言切换
- 📦 **状态管理**: 使用 Pinia 进行状态管理
- 🔧 **代码规范**: ESLint + Prettier 代码格式化
- 📱 **响应式设计**: 适配各种屏幕尺寸

### 🎯 支持平台

- **App**: iOS、Android
- **H5**: 移动端网页
- **小程序**: 微信、支付宝、百度、字节跳动、QQ、快手、小红书等
- **快应用**: 华为、联盟等

## 🛠️ 技术栈

- **框架**: [uni-app](https://uniapp.dcloud.net.cn/) 3.x
- **前端**: Vue 3.4.21 + TypeScript 4.9.4
- **构建工具**: Vite 5.2.8
- **状态管理**: Pinia 2.2.0
- **UI组件**: uView Plus 3.4.20
- **国际化**: Vue I18n 9.14.5
- **样式**: Sass + uni.scss
- **工具库**:
  - dayjs (日期处理)
  - crypto-js (加密)
  - clipboard (剪贴板)
  - uqrcodejs (二维码)

## 📦 安装与使用

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
# H5开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# App开发
npm run dev:app

# 支付宝小程序开发
npm run dev:mp-alipay

# 百度小程序开发
npm run dev:mp-baidu

# 字节跳动小程序开发
npm run dev:mp-toutiao

# QQ小程序开发
npm run dev:mp-qq

# 快手小程序开发
npm run dev:mp-kuaishou

# 小红书小程序开发
npm run dev:mp-xhs
```

### 生产构建

```bash
# H5构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin

# App构建
npm run build:app

# 其他平台构建
npm run build:mp-[platform]
```

## ⚙️ 配置说明

### 环境配置

项目支持多环境配置，请在项目根目录创建对应的环境文件：

- `.env.development` - 开发环境
- `.env.production` - 生产环境

#### 配置示例

```bash
# API接口地址
VITE_API_URL=https://your.api.url

# 应用标题
VITE_APP_TITLE=TigShop商城

# 其他配置...
```

### 应用配置

主要配置文件位于 `src/manifest.json`，包含：

- 应用基本信息（名称、版本、描述等）
- 各平台特定配置
- 权限配置
- 图标配置

## 📁 项目结构

```
src/
├── api/                    # API接口
├── components/             # 公共组件
├── hooks/                  # 组合式函数
├── i18n/                   # 国际化配置
├── locale/                 # 语言包
├── pages/                  # 页面文件
├── static/                 # 静态资源
├── store/                  # 状态管理
├── types/                  # TypeScript类型定义
├── utils/                  # 工具函数
├── App.vue                 # 应用入口
├── main.ts                 # 主入口文件
├── manifest.json           # 应用配置
├── pages.json              # 页面路由配置
└── uni.scss               # 全局样式
```

## 🔧 开发指南

### 代码规范

项目使用 ESLint + Prettier 进行代码规范检查：

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix

# 代码格式化
npm run format

# TypeScript类型检查
npm run type-check
```

### 组件开发

推荐使用 Vue 3 Composition API + TypeScript：

```vue
<template>
  <view class="component">
    <!-- 组件内容 -->
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 组件逻辑
const count = ref(0)
const state = reactive({
  // 状态
})
</script>

<style lang="scss" scoped>
.component {
  // 样式
}
</style>
```

### 状态管理

使用 Pinia 进行状态管理：

```typescript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null
  }),
  actions: {
    setUserInfo(info: any) {
      this.userInfo = info
    }
  }
})
```

## 📱 平台特性

### 小程序配置

各小程序平台的特定配置在 `manifest.json` 中：

- **微信小程序**: `mp-weixin`
- **支付宝小程序**: `mp-alipay`
- **百度小程序**: `mp-baidu`
- **字节跳动小程序**: `mp-toutiao`
- **QQ小程序**: `mp-qq`
- **小红书小程序**: `mp-xhs`

### App配置

App相关配置包括：
- 权限配置
- 图标配置
- 启动页配置
- 原生插件配置

## 🚀 部署

### H5部署

1. 构建项目：
```bash
npm run build:h5
```

2. 构建完成后，静态文件位于 `dist/build/h5/` 目录

3. 将该目录部署到Web服务器即可

### 小程序部署

1. 构建对应平台：
```bash
npm run build:mp-weixin  # 微信小程序
```

2. 使用对应平台的开发者工具打开 `dist/build/mp-weixin` 目录

3. 上传发布

### App部署

1. 构建App：
```bash
npm run build:app
```

2. 使用 HBuilderX 打开项目进行云打包或本地打包

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用开源许可证，详情请查看 [LICENSE](LICENSE) 文件。

## 🔗 相关链接

- [TigShop API 后端](https://github.com/tigshop/tigshop-api)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [uView Plus 组件库](https://uviewui.com/)

## 📞 技术支持

如有问题，请通过以下方式联系：

- 提交 [Issue](https://github.com/tigshop/tigshop-api/issues)
- 查看 [文档](https://github.com/tigshop/tigshop-api)

---

**TigShop** - 让电商开发更简单 🛍️
