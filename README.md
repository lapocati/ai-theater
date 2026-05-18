# AI 沉浸式剧场 - 甄嬛传滴血验亲场景

> 基于 React + TypeScript 的沉浸式互动体验项目

## 🎯 项目概述

这是一个《甄嬛传》滴血验亲名场面的沉浸式剧场网页应用。通过视频播放与角色对话系统的结合，让用户身临其境感受经典剧情，体验与剧中人物实时互动的乐趣。

### 核心功能

- 🎬 **视频播放器**：支持全屏播放，进度条拖拽控制
- 🎭 **双频道系统**：【入戏】角色对话 / 【出戏】甄学家解说
- 👥 **三角色心理同步**：甄嬛、皇上、安陵容实时情绪变化
- ⏱️ **时间轴驱动**：视频进度触发角色心理独白
- 🔗 **关键词跨频道联动**：点击关键词跳转到甄学家解读

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.x | 构建工具 |
| Tailwind CSS | 3.x | 样式框架 |
| Lucide React | 0.454.x | 图标库 |

## 📁 项目结构

```
ai-theater/
├── src/
│   ├── App.tsx              # 主应用组件（角色配置、状态管理）
│   ├── main.tsx             # React 入口文件
│   └── index.css            # 全局样式
├── public/
│   ├── vite.svg             # Vite 图标
│   └── zhenhuan.mp4         # 视频文件
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions 部署配置
├── index.html               # HTML 模板
├── package.json             # 项目配置
├── tailwind.config.js       # Tailwind 配置
├── vite.config.ts           # Vite 配置
└── tsconfig.json            # TypeScript 配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 一键启动（Windows）

```bash
start.bat
```

## 🎮 使用说明

### 界面布局

- **左侧/上方**：视频播放区域（占 72% 宽度）
- **右侧/下方**：交互面板（占 28% 宽度）

### 操作指南

1. **播放视频**：点击播放按钮开始观看
2. **拖拽进度条**：跳转到任意时间点
3. **切换频道**：选择【入戏】或【出戏】模式
4. **选择角色**：在入戏模式下选择甄嬛、皇上或安陵容
5. **发送消息**：在输入框中输入消息与角色对话
6. **快捷提问**：点击快捷问题按钮快速发起对话
7. **关键词跳转**：点击消息中的高亮关键词查看甄学家解读

### 剧情阶段

| 阶段 | 时间 | 描述 |
|------|------|------|
| 情感对峙 | 0-15秒 | 双方激烈对峙，气氛紧张 |
| 血融惊变 | 15-45秒 | 滴血验亲，血相融引发轩然大波 |
| 反击时刻 | 45秒+ | 甄嬛冷静反击，揭露阴谋 |

## 🎨 角色主题色

| 角色 | 主色 | 代表含义 |
|------|------|----------|
| 甄嬛 | 深红 (#8B0000) | 智慧与坚韧 |
| 皇上 | 棕色 (#8B4513) | 帝王威严 |
| 安陵容 | 紫色 (#6B5B95) | 神秘与自卑 |

## 🔧 配置说明

### 添加新角色

在 `App.tsx` 中添加角色配置：

```typescript
const characters: Character[] = [
  {
    id: 'characterId',
    name: '角色名',
    title: '角色封号',
    theme: {
      primary: '#主色',
      secondary: '#副色',
      accent: '#强调色',
      glow: 'rgba(光晕色)',
    },
    personality: '性格描述',
    avatar: '👤',
  },
];
```

### 添加心理节点

```typescript
const psychologyTimeline: PsychologyNode[] = [
  {
    time: 5,                    // 触发时间（秒）
    characterId: 'zhenhuan',    // 角色ID
    type: 'intro',              // intro/climax/twist
    content: '心理独白内容',
  },
];
```

## 📦 部署

### GitHub Pages 部署

```bash
npm run deploy
```

### Vercel 部署

1. 导入 GitHub 仓库
2. 选择 Vite 框架
3. 自动部署

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

> 📌 详细技术文档请参考 [AI_THEATER_DOCUMENTATION.md](file:///d:/jiajiao/trae/ai-theater/AI_THEATER_DOCUMENTATION.md)