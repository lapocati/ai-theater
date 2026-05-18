# AI 沉浸式剧场 - 甄嬛传滴血验亲场景

> 核心配置文件与角色对话系统文档
> 版本：v1.0 | 更新日期：2026-05-05

---

## 📁 项目概述

这是一个基于 React + TypeScript + Tailwind CSS 的《甄嬛传》滴血验亲场景沉浸式体验项目。

### 核心功能
- 🎬 视频播放器（支持全屏）
- 🎭 双频道系统：【入戏】角色对话 / 【出戏】甄学家解说
- 👥 三角色心理同步（甄嬛、皇上、安陵容）
- ⏱️ 视频时间轴驱动的情绪变化
- 🔗 关键词跨频道联动

---

## 🎯 一、角色配置 (App.tsx)

### 1.1 核心数据结构

```typescript
// ========== 消息类型定义 ==========
export interface Message {
  id: number;                    // 消息唯一标识
  type: 'user' | 'ai' | 'system'; // 消息类型：用户/AI/系统
  content: string;                // 消息内容
  character?: string;             // 角色名称（AI消息时使用）
  isQuote?: boolean;              // 是否为引用卡片
  quoteInfo?: {                   // 引用卡片信息
    title: string;                // 卡片标题
    description: string;          // 卡片描述
    episode: string;              // 集数信息
  };
  isPsychology?: boolean;         // 是否为心理独白
  linkedKeywords?: string[];      // 关联关键词（用于跨频道跳转）
}

// ========== 角色类型定义 ==========
export interface Character {
  id: string;                     // 角色唯一标识
  name: string;                   // 角色名称
  title: string;                  // 角色封号
  theme: {                        // 角色主题色
    primary: string;              // 主色（深色）
    secondary: string;             // 副色（浅色）
    accent: string;               // 强调色
    glow: string;                 // 光晕效果色
  };
  personality: string;            // 性格描述
  avatar: string;                 // 头像emoji
}

// ========== 心理节点类型定义 ==========
export interface PsychologyNode {
  time: number;                   // 触发时间点（秒）
  characterId: string;            // 对应角色ID
  content: string;                // 心理独白内容
  type: 'intro' | 'climax' | 'twist'; // 节点类型：引入/高潮/反转
}
```

### 1.2 角色定义

```typescript
const characters: Character[] = [
  {
    id: 'zhenhuan',              // 甄嬛 - 熹贵妃
    name: '甄嬛',
    title: '熹贵妃',
    theme: {
      primary: '#8B0000',        // 深红色系（代表甄嬛的沉稳与智慧）
      secondary: '#DC143C',       // 猩红色
      accent: '#E6E6FA',         // 淡紫色
      glow: 'rgba(220, 20, 60, 0.4)', // 红色光晕
    },
    personality: '聪慧果敢，善于谋略',
    avatar: '👑',
  },
  {
    id: 'emperor',               // 皇上 - 雍正帝
    name: '皇上',
    title: '雍正帝',
    theme: {
      primary: '#8B4513',        // 棕色系（代表帝王威严）
      secondary: '#DAA520',      // 金色
      accent: '#FFE4B5',         // 米色
      glow: 'rgba(218, 165, 32, 0.4)', // 金色光晕
    },
    personality: '多疑善变，帝王威严',
    avatar: '🐉',
  },
  {
    id: 'anlingrong',           // 安陵容 - 鹂妃
    name: '安陵容',
    title: '鹂妃',
    theme: {
      primary: '#6B5B95',        // 紫色系（代表安陵容的神秘与自卑）
      secondary: '#9B8BB4',       // 浅紫色
      accent: '#E6E6FA',         // 淡紫色
      glow: 'rgba(155, 139, 180, 0.4)', // 紫色光晕
    },
    personality: '敏感多疑，心思细腻',
    avatar: '🦋',
  },
];
```

### 1.3 剧情时间轴配置

```typescript
// 视频时间轴与心理节点映射
const psychologyTimeline: PsychologyNode[] = [
  {
    time: 5,                     // 5秒时触发
    characterId: 'zhenhuan',     // 甄嬛的心理独白
    type: 'intro',               // 引入阶段
    content: `"待我不薄"？这四个字真真扎心。\n\n此刻辩解已无用，我必须死里求生，找出这水里的猫腻。`,
  },
  {
    time: 30,                    // 30秒时触发
    characterId: 'emperor',      // 皇上的心理独白
    type: 'climax',              // 高潮阶段
    content: `即便你再伶牙俐齿，这血融在了一起，看你还如何翻身。\n\n朕等这一天等得太久了。`,
  },
  {
    time: 50,                    // 50秒时触发
    characterId: 'anlingrong',   // 安陵容的心理独白
    type: 'twist',               // 反转阶段
    content: `不好，她竟发现了水有问题！\n\n这甄嬛当真命大，难道今日又要被她逃过一劫？`,
  },
];
```

### 1.4 剧情考据卡片配置

```typescript
// 关键词触发考据卡片
const plotCards = [
  {
    keyword: '白矾',             // 触发关键词
    title: '【甄学考据】白矾之谜',
    description: '白矾能使不相干之人的血相融。在《本草纲目》中有记载："白矾性寒，涩，无毒。主治：燥湿解毒，杀虫去腐。"甄嬛此时的博学救了她的命。',
    episode: '第63集 · 滴血验亲名场面',
  },
  {
    keyword: '舒痕胶',
    title: '舒痕胶事件',
    description: '华妃赏赐的舒痕胶中暗藏麝香，甄嬛初期小产背后的真凶之一。',
    episode: '第27-28集',
  },
  {
    keyword: '杏花微雨',
    title: '杏花微雨之约',
    description: '甄嬛与皇帝在杏花树下相遇，皇帝以果郡王之名与甄嬛私会。',
    episode: '第17集',
  },
];
```

---

## 🎭 二、角色对话系统 (CharacterPanel.tsx)

### 2.1 阶段划分配置

```typescript
// 剧情阶段定义
interface Stage {
  name: string;                  // 阶段名称
  startTime: number;             // 开始时间（秒）
  endTime: number;               // 结束时间（秒）
}

const stages: Stage[] = [
  { name: '情感对峙', startTime: 0, endTime: 15 },    // 0-15秒：情感对峙
  { name: '血融惊变', startTime: 15, endTime: 45 },   // 15-45秒：血融惊变
  { name: '反击时刻', startTime: 45, endTime: Infinity }, // 45秒后：反击时刻
];
```

### 2.2 角色情绪与回复配置

```typescript
// 角色情绪状态定义
interface Mood {
  label: string;                 // 情绪标签
  color: string;                 // Tailwind渐变色类名
  messages: string[];            // 可能的回复列表
  responseStyle: string;         // 回复风格描述
}

// 角色情绪库
const characterMoods: Record<string, Record<string, Mood>> = {

  // ========== 甄嬛的情绪变化 ==========
  zhenhuan: {
    '情感对峙': {
      label: '强自镇定',          // 情绪标签
      color: 'from-blue-600 to-blue-400', // 渐变色
      messages: [                // 可能的回复
        '"待我不薄"？这四个字真真扎心。',
        '臣妾心中只有皇上，请皇上明察！',
        '此刻辩解无用，唯有赌皇上的信任。',
        '臣妾没有做过这种事，请皇上相信臣妾！',
      ],
      responseStyle: '侧重于赌皇上的信任，语气坚定',
    },
    '血融惊变': {
      label: '极度震惊',
      color: 'from-red-600 to-orange-400',
      messages: [
        '不，这不可能……这水绝对有问题！',
        '不对，这血为何相融？其中必有蹊跷！',
        '等等，这水……本宫要查清楚！',
        '不对劲，这水被做了手脚！',
      ],
      responseStyle: '表达极度震惊，强调水有问题',
    },
    '反击时刻': {
      label: '冷静反击',
      color: 'from-green-600 to-emerald-400',
      messages: [
        '请皇上彻查此水！白矾能令血液相融！',
        '《本草纲目》有记载：白矾可使不同血液相融！',
        '皇后娘娘，您这招未免太毒了些！',
        '多亏了这本书，不然今日臣妾真要含冤而死！',
      ],
      responseStyle: '冷静反击，要求彻查此水',
    },
  },

  // ========== 皇上的情绪变化 ==========
  emperor: {
    '情感对峙': {
      label: '失望心痛',
      color: 'from-orange-600 to-yellow-400',
      messages: [
        '朕待你不薄，你竟敢如此！',
        '甄嬛，你太让朕失望了！',
        '朕那么信任你，你就是这样回报朕的？',
        '你说，这到底是怎么回事！',
      ],
      responseStyle: '侧重于"朕待你不薄"的心痛',
    },
    '血融惊变': {
      label: '暴怒背叛',
      color: 'from-red-700 to-red-400',
      messages: [
        '你竟敢如此欺瞒朕！',
        '甄嬛，你好大的胆子！',
        '朕真是看错你了！',
        '把甄嬛给朕拿下！',
      ],
      responseStyle: '表达暴怒和被背叛的感觉',
    },
    '反击时刻': {
      label: '震惊疑惑',
      color: 'from-amber-600 to-yellow-400',
      messages: [
        '什么？水有问题？',
        '这……这到底是怎么回事？',
        '白矾？朕倒要查查清楚！',
        '如果是真的，那……',
      ],
      responseStyle: '表达震惊和疑惑',
    },
  },

  // ========== 安陵容的情绪变化 ==========
  anlingrong: {
    '情感对峙': {
      label: '观察局势',
      color: 'from-purple-600 to-purple-400',
      messages: [
        '姐姐这是怎么了？',
        '皇上请息怒，姐姐不是那样的人。',
        '姐姐莫要慌，事情会弄清楚的。',
      ],
      responseStyle: '装好人，观察局势',
    },
    '血融惊变': {
      label: '暗喜补刀',
      color: 'from-violet-600 to-purple-400',
      messages: [
        '姐姐莫要再辩解了……',
        '没想到姐姐你是这种人……',
        '证据都在这儿了，姐姐还是认罪吧。',
        '可惜了，姐姐怎么走上这条路？',
      ],
      responseStyle: '暗喜，准备补刀',
    },
    '反击时刻': {
      label: '惊恐不安',
      color: 'from-fuchsia-600 to-pink-400',
      messages: [
        '这……这怎么可能？',
        '姐姐她怎么知道？',
        '不好，她竟然发现了水有问题！',
        '姐姐当真命大，这都能被她逃过？',
      ],
      responseStyle: '惊恐不安',
    },
  },
};
```

### 2.3 快捷引导问题配置

```typescript
// 快捷问题项定义
interface SuggestionItem {
  icon: typeof Brain;            // Lucide图标组件
  label: string;                 // 按钮显示文本
  prompt: string;                // 实际发送的问题内容
}

// 快捷问题库
const suggestionLibrary: Record<string, SuggestionItem[]> = {

  // 甄嬛的快捷问题
  zhenhuan: [
    { icon: Eye, label: '你最怀疑谁？', prompt: '本宫心中最怀疑谁在背后操纵？' },
    { icon: Brain, label: '白矾的秘密', prompt: '白矾为何能让血液相融？本宫要弄明白！' },
    { icon: Heart, label: '对温实初说', prompt: '温大人，本宫信你！' },
    { icon: Zap, label: '如何反击？', prompt: '面对如此绝境，本宫该如何反击？' },
  ],

  // 皇上的快捷问题
  emperor: [
    { icon: Brain, label: '为何不信？', prompt: '朕为何会怀疑甄嬛？' },
    { icon: Eye, label: '内心担忧', prompt: '朕真正担心的是什么？' },
    { icon: Zap, label: '皇后可信？', prompt: '朕该相信皇后的话吗？' },
    { icon: Heart, label: '复杂情感', prompt: '朕心中是愤怒还是心痛？' },
  ],

  // 安陵容的快捷问题
  anlingrong: [
    { icon: Eye, label: '为何帮皇后', prompt: '臣妾为何要帮皇后说话？' },
    { icon: Brain, label: '内心恐惧', prompt: '臣妾此刻心里到底害不害怕？' },
    { icon: Zap, label: '会倒戈吗', prompt: '如果甄嬛翻盘，臣妾会倒戈吗？' },
    { icon: Heart, label: '真正靠山', prompt: '臣妾真正的靠山到底是谁？' },
  ],
};
```

### 2.4 甄学家知识库配置

```typescript
// 知识库条目定义
const scholarKnowledgeBase: Record<string, {
  title: string;                 // 知识条目标题
  content: string;               // 详细解读内容
  episode: string;               // 出处集数
}> = {

  // 白矾 - 核心道具解读
  白矾: {
    title: '【本草纲目】白矾条目',
    content: '白矾性寒，涩，无毒。主治：燥湿解毒，杀虫去腐。在滴血验亲中，白矾能使不同人的血液相融，这是皇后设计陷害甄嬛的关键。甄嬛博览群书，深知此理，因此在关键时刻指出水有问题，实现反杀。',
    episode: '第63集',
  },

  // 舒痕胶 - 历史伏笔
  舒痕胶: {
    title: '【舒痕胶事件】',
    content: '华妃赏赐给甄嬛的舒痕胶中暗藏麝香，导致甄嬛初期小产。此乃华妃曹贵人等人合谋所为。甄嬛后来发现真相，这也是华妃失宠的原因之一。',
    episode: '第27-28集',
  },

  // 杏花微雨 - 浪漫回忆
  杏花微雨: {
    title: '【杏花微雨之约】',
    content: '甄嬛与皇帝在杏花树下相遇，皇帝以果郡王之名与甄嬛私会。甄嬛明知对方是皇帝却假装不知，成就了这段"杏花微雨"的浪漫相遇。',
    episode: '第17集',
  },

  // 滴血验亲 - 名场面
  滴血验亲: {
    title: '【滴血验亲】名场面',
    content: '皇后设计让甄嬛与温实初"滴血验亲"，试图证明甄嬛所生之子并非皇帝血脉。实际上碗中之水被做了手脚，加入了白矾。甄嬛凭借博学识破阴谋。',
    episode: '第63集',
  },
};
```

### 2.5 甄学家思考提示配置

```typescript
// AI思考时的随机提示语
const scholarThinkingTips = [
  '正在翻阅《甄学十级宝典》...',
  '正在查阅内务府档案...',
  '正在调取御前史料...',
  '正在考证《本草纲目》原文...',
  '正在联络碎玉堂线人...',
  '正在分析太医院脉案...',
];
```

---

## 🔧 三、核心函数逻辑

### 3.1 获取当前阶段

```typescript
// 根据视频时间获取当前所处阶段
function getCurrentStage(time: number): Stage {
  // 遍历阶段列表，找到匹配的阶段
  for (const stage of stages) {
    if (time >= stage.startTime && time < stage.endTime) {
      return stage;  // 返回匹配的阶段
    }
  }
  // 默认返回最后一个阶段（反击时刻）
  return stages[stages.length - 1];
}
```

### 3.2 AI回复生成逻辑（入戏模式）

```typescript
function generateAIResponse(
  userInput: string,           // 用户输入
  characterId: string,         // 当前角色ID
  currentTime: number,          // 当前视频时间
  currentStage: Stage           // 当前阶段
): string {
  const input = userInput.toLowerCase();
  // 根据角色和阶段获取默认回复
  const mood = characterMoods[characterId]?.[currentStage.name];
  const defaultMessages = mood?.messages || [];
  const defaultMessage = defaultMessages.length > 0
    ? defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
    : '......';

  // ========== 甄嬛的关键词回复 ==========
  if (characterId === 'zhenhuan') {
    if (input.includes('最怀疑') || input.includes('背后操纵')) {
      return '皇后！本宫心中早有数。这一局设计得如此周密...';
    }
    if (input.includes('白矾') && (input.includes('血液') || input.includes('相融'))) {
      return '《本草纲目》有记载：白矾性寒，燥湿解毒，能令不同血脉相融...';
    }
    // ... 更多关键词匹配
  }

  // ========== 皇上的关键词回复 ==========
  if (characterId === 'emperor') {
    if (input.includes('为何') && (input.includes('怀疑') || input.includes('不信'))) {
      return '朕待她不薄！她却是这样回报朕的？...';
    }
    // ... 更多关键词匹配
  }

  // ========== 安陵容的关键词回复 ==========
  if (characterId === 'anlingrong') {
    if (input.includes('为何') && (input.includes('帮皇后') || input.includes('皇后说话'))) {
      return '姐姐有所不知...臣妾不过是顺应皇后娘娘的意思罢了...';
    }
    // ... 更多关键词匹配
  }

  // 默认回复
  return defaultMessage;
}
```

### 3.3 甄学家回复生成逻辑（出戏模式）

```typescript
function generateScholarResponse(
  userInput: string,
  currentTime: number
): { response: string; linkedKeywords: string[] } {
  const input = userInput.toLowerCase();
  let linkedKeywords: string[] = [];

  // 白矾相关问题
  if (input.includes('白矾')) {
    linkedKeywords = ['白矾', '皇后', '祺贵人', '斐雯'];
    return {
      response: `小主问得好！说到这白矾，可真是本集的核心道具啊～\n\n【物理特性】\n白矾，化学成分为硫酸铝钾...\n\n【本集应用】\n各位小主请注意！实际上这盆水是这样被做手脚的...\n\n【甄嬛反杀】\n皇后千算万算，却漏算了甄嬛的博学！...`,
      linkedKeywords,
    };
  }

  // 滴血验亲相关问题
  if (input.includes('滴血验亲')) {
    linkedKeywords = ['滴血验亲', '白矾', '本草纲目', '皇后'];
    return {
      response: `小主问到这个名场面了！滴血验亲是本剧最精彩的转折之一！...`,
      linkedKeywords,
    };
  }

  // 皇后相关问题
  if (input.includes('皇后') || input.includes('乌拉那拉氏')) {
    linkedKeywords = ['皇后', '白矾', '祺贵人', '滴血验亲'];
    return {
      response: `说到这位乌拉那拉氏·宜修皇后，可真是本剧第一大BOSS啊！...`,
      linkedKeywords,
    };
  }

  // 默认回复
  return {
    response: `小主问得好！关于这个问题，容我细细道来～...`,
    linkedKeywords: ['滴血验亲', '甄嬛', '皇后', '白矾'],
  };
}
```

---

## 📐 四、布局结构

### 4.1 响应式布局（App.tsx）

```typescript
// 主布局：移动端垂直排列，桌面端水平排列
<div className="flex flex-col lg:flex-row h-screen">

  {/* 视频播放区域 - 移动端占40-45%高度，桌面端占72%宽度 */}
  <div className={`${
    isFullscreen
      ? 'w-full h-full'  // 全屏模式
      : 'w-full lg:w-[72%] h-[40vh] sm:h-[45vh] lg:h-full'  // 普通模式
  }`}>

    {/* 视频播放器组件 */}
    <VideoPlayer
      videoRef={videoRef}
      onTimeUpdate={handleTimeUpdate}
      theme={activeCharacter.theme}
      isFullscreen={isFullscreen}
      onFullscreenChange={handleFullscreenChange}
    />
  </div>

  {/* 对话面板 - 移动端占60%高度，桌面端占28%宽度 */}
  {!isFullscreen && (
    <div className="w-full lg:w-[28%] h-[60vh] sm:h-[55vh] lg:h-full">
      <CharacterPanel
        characters={characters}
        activeCharacter={activeCharacter}
        onCharacterChange={setActiveCharacter}
        currentTime={currentTime}
        plotCards={plotCards}
        psychologyTimeline={psychologyTimeline}
      />
    </div>
  )}
</div>
```

### 4.2 对话面板结构

```
┌─────────────────────────────────┐
│         Tab 切换区域              │
│  [入戏]与角色对话  [出戏]甄学家解说 │
├─────────────────────────────────┤
│         角色选择区域              │
│  (仅入戏模式显示)                │
│  [甄嬛] [皇上] [安陵容]           │
├─────────────────────────────────┤
│         快捷提问区域              │
│  [你最怀疑谁?] [白矾的秘密] ...    │
├─────────────────────────────────┤
│                                 │
│         消息列表区域              │
│                                 │
│    ┌─────────────────────┐     │
│    │    AI 消息气泡        │     │
│    └─────────────────────┘     │
│                                 │
│           ┌─────────────────┐   │
│           │   用户 消息气泡   │   │
│           └─────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  [ 输入框 ................ ] [发送] │
└─────────────────────────────────┘
```

---

## 🎨 五、主题色彩系统

### 5.1 各角色主题色

| 角色 | 主色 | 副色 | 强调色 | 含义 |
|------|------|------|--------|------|
| 甄嬛 | `#8B0000` 深红 | `#DC143C` 猩红 | `#E6E6FA` 淡紫 | 代表智慧与坚韧 |
| 皇上 | `#8B4513` 棕色 | `#DAA520` 金色 | `#FFE4B5` 米色 | 代表帝王威严 |
| 安陵容 | `#6B5B95` 紫色 | `#9B8BB4` 浅紫 | `#E6E6FA` 淡紫 | 代表神秘与自卑 |
| 甄学家 | `#8B4513` 棕色 | `#DAA520` 金色 | `#DAA520` 金色 | 代表学术权威 |

### 5.2 情绪渐变色

| 情绪 | 甄嬛 | 皇上 | 安陵容 |
|------|------|------|--------|
| 第一阶段 | `from-blue-600 to-blue-400` | `from-orange-600 to-yellow-400` | `from-purple-600 to-purple-400` |
| 第二阶段 | `from-red-600 to-orange-400` | `from-red-700 to-red-400` | `from-violet-600 to-purple-400` |
| 第三阶段 | `from-green-600 to-emerald-400` | `from-amber-600 to-yellow-400` | `from-fuchsia-600 to-pink-400` |

---

## 🔄 六、跨频道联动机制

### 6.1 关键词触发流程

```
用户输入 → 检测关键词 → 显示跨频道提示 → 用户确认跳转 → 切换到甄学家频道 → 自动发送解读
```

### 6.2 支持跨频道的关键词

- `白矾` → 触发白矾知识解读
- `舒痕胶` → 触发舒痕胶事件解读
- `杏花微雨` → 触发杏花微雨典故解读
- `滴血验亲` → 触发名场面解读

---

## 📝 七、修改指南

### 7.1 添加新角色

1. 在 `App.tsx` 的 `characters` 数组中添加新角色对象
2. 在 `CharacterPanel.tsx` 的 `characterMoods` 中添加该角色的情绪配置
3. 在 `suggestionLibrary` 中添加该角色的快捷问题
4. 在 `generateAIResponse` 函数中添加该角色的关键词回复

### 7.2 添加新知识点

在 `scholarKnowledgeBase` 对象中添加新条目：

```typescript
新增条目: {
  title: '【条目标题】',
  content: '详细解读内容...',
  episode: '第X集',
}
```

### 7.3 调整剧情阶段

修改 `stages` 数组中的时间范围：

```typescript
const stages: Stage[] = [
  { name: '阶段名称', startTime: 开始秒数, endTime: 结束秒数 },
];
```

### 7.4 修改主题色

在对应角色的 `theme` 对象中修改颜色值：

```typescript
theme: {
  primary: '#新主色',
  secondary: '#新副色',
  accent: '#新强调色',
  glow: 'rgba(新光晕色)',
}
```

---

## 🚀 八、部署说明

### 8.1 GitHub + Vercel 部署流程

1. **创建 GitHub 仓库**
   - 访问 github.com 新建仓库
   - 上传项目所有文件（排除 node_modules）

2. **连接 Vercel**
   - 登录 vercel.com
   - Import GitHub 仓库
   - 选择 Vite 作为框架
   - Deploy 即可

3. **自动更新**
   - 修改代码后 push 到 GitHub
   - Vercel 会自动重新部署

### 8.2 视频文件处理

建议将视频上传到 CDN（如 Cloudflare Stream），然后修改 `VideoPlayer.tsx` 中的视频路径为 CDN 链接。

---

## 📄 附录：完整文件列表

```
ai-theater/
├── src/
│   ├── App.tsx              # 主应用组件（含角色配置）
│   ├── main.tsx             # React 入口
│   ├── index.css            # 全局样式
│   └── components/
│       ├── VideoPlayer.tsx   # 视频播放器组件
│       └── CharacterPanel.tsx # 角色对话面板（含完整对话逻辑）
├── public/
│   └── zhenhuan.mp4         # 视频文件（建议使用 CDN）
├── index.html
├── package.json
├── tailwind.config.js       # Tailwind 配置
├── tsconfig.json            # TypeScript 配置
└── vite.config.ts           # Vite 构建配置
```

---

> 📌 **提示**：本文档由 Trae AI 生成，用于帮助其他 AI 理解项目架构。如有疑问，请参考源代码注释。
