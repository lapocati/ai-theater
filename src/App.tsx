import { useState, useEffect } from 'react'
import {
  Home,
  FileText,
  MessageCircle,
  BarChart3,
  LayoutDashboard,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Menu,
  Zap,
  Eye,
  Target,
  Award,
  Users,
  Activity,
  TrendingUp,
  Bug,
  Lightbulb,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const INSTRUCTIONS = [
  {
    id: 1,
    role: '站长',
    title: '飞毛腿合同通知（骑手侧）',
    description: '向骑手发送飞毛腿合同签署通知',
    details: {
      overview: '本任务要求AI模拟站长角色，向骑手发送飞毛腿合同签署通知，包括合同有效期、权益说明等关键信息。',
      callFlow: '1. 确认骑手身份\n2. 说明合同类型\n3. 解释合同权益\n4. 确认签署意愿\n5. 引导后续操作',
      faq: 'Q: 合同有效期多久？\nA: 有效期为一年\nQ: 如何签署？\nA: 点击链接在线签署',
      constraints: '必须包含合同有效期、权益说明、签署方式三项核心信息',
    },
  },
  {
    id: 2,
    role: '调度站长',
    title: '预约单改派通知（骑手侧）',
    description: '通知骑手预约单需要改派',
    details: {
      overview: '本任务要求AI模拟调度站长角色，向骑手发送预约单改派通知，说明改派原因和新订单信息。',
      callFlow: '1. 告知改派情况\n2. 说明改派原因\n3. 提供新订单详情\n4. 确认是否接受\n5. 记录反馈',
      faq: 'Q: 改派会影响收入吗？\nA: 不会，系统会自动补偿\nQ: 可以拒绝吗？\nA: 可以，但建议配合调度',
      constraints: '必须说明改派原因、新订单信息、补偿方案',
    },
  },
  {
    id: 3,
    role: '客服专员',
    title: '用户送餐超时安抚（用户侧）',
    description: '安抚因送餐超时而不满的用户',
    details: {
      overview: '本任务要求AI模拟客服专员角色，对送餐超时的用户进行安抚，提供解决方案。',
      callFlow: '1. 表达歉意\n2. 说明超时原因\n3. 提供补偿方案\n4. 确认用户接受\n5. 记录反馈',
      faq: 'Q: 可以退款吗？\nA: 可以申请部分退款\nQ: 补偿券有效期多久？\nA: 7天内有效',
      constraints: '必须包含道歉、原因说明、补偿方案三项',
    },
  },
  {
    id: 4,
    role: '商户支持专员',
    title: '商家出餐异常沟通（商家侧）',
    description: '与商家沟通出餐异常问题',
    details: {
      overview: '本任务要求AI模拟商户支持专员角色，与商家沟通出餐异常问题，协调解决方案。',
      callFlow: '1. 说明异常情况\n2. 了解出餐困难\n3. 协商解决方案\n4. 确认处理时间\n5. 跟进结果',
      faq: 'Q: 出餐延迟会影响评分吗？\nA: 会有一定影响\nQ: 如何避免类似问题？\nA: 建议提前准备',
      constraints: '必须包含异常说明、原因了解、解决方案三项',
    },
  },
]

const DIALOGUES: DialoguesType = {
  1: {
    normal: [
      { round: 'R1', speaker: 'simulator', text: '您好，我是骑手小王。' },
      { round: 'R2', speaker: 'model', text: '您好小王，这里是站点。有一份飞毛腿合同需要您签署，有效期一年。' },
      { round: 'R3', speaker: 'simulator', text: '好的，具体是什么内容？' },
      { round: 'R4', speaker: 'model', text: '这份合同包含额外的配送补贴、意外险升级和优先派单权益。您可以点击链接在线签署。' },
      { round: 'R5', speaker: 'simulator', text: '明白了，我这就去签。' },
      { round: 'R6', speaker: 'model', text: '好的，如有问题随时联系站点。' },
    ],
    buggy: [
      { round: 'R1', speaker: 'simulator', text: '您好，我是骑手小王。' },
      { round: 'R2', speaker: 'model', text: '您好小王，这里是站点。有一份合同需要您签署。', fault: 'VARIABLE_OMISSION', faultDesc: '缺少合同有效期信息' },
      { round: 'R3', speaker: 'simulator', text: '好的，具体是什么内容？' },
      { round: 'R4', speaker: 'model', text: '合同里有一些权益，您点击链接签一下吧。' },
      { round: 'R5', speaker: 'simulator', text: '明白了，我这就去签。' },
      { round: 'R6', speaker: 'model', text: '好的。' },
    ],
    branch: [
      { round: 'R1', speaker: 'simulator', text: '您好，我是骑手小李。我对合同有疑问。' },
      { round: 'R2', speaker: 'model', text: '您好小李，请问有什么问题？' },
      { round: 'R3', speaker: 'simulator', text: '合同期限是多久？' },
      { round: 'R4', speaker: 'model', text: '合同有效期为一年，到期后可以续签。' },
      { round: 'R5', speaker: 'simulator', text: '如果中途退出会有违约金吗？' },
      { round: 'R6', speaker: 'model', text: '提前30天申请退出无需支付违约金，请放心。' },
    ],
    boundary: [
      { round: 'R1', speaker: 'simulator', text: '我不签这个合同。' },
      { round: 'R2', speaker: 'model', text: '理解您的想法。不签署飞毛腿合同也可以正常配送，但将无法享受额外补贴和优先派单权益。' },
      { round: 'R3', speaker: 'simulator', text: '那我还是不签了。' },
      { round: 'R4', speaker: 'model', text: '好的，您的选择我们尊重。如有需要随时联系我们。' },
    ],
  },
  2: {
    normal: [
      { round: 'R1', speaker: 'simulator', text: '您好，我是骑手小张。' },
      { round: 'R2', speaker: 'model', text: '您好小张，由于原订单商家出餐延迟，您的10:30预约单需要改派给其他骑手。' },
      { round: 'R3', speaker: 'simulator', text: '好的，那我接下来做什么？' },
      { round: 'R4', speaker: 'model', text: '系统已为您重新分配了一个10:45的订单，距离更近。改派补偿已自动计入您的账户。' },
      { round: 'R5', speaker: 'simulator', text: '好的，谢谢。' },
      { round: 'R6', speaker: 'model', text: '不客气，祝您配送顺利。' },
    ],
    buggy: [
      { round: 'R1', speaker: 'simulator', text: '您好，我是骑手小张。' },
      { round: 'R2', speaker: 'model', text: '您好小张，您的预约单需要改派。', fault: 'INCOMPLETE_INFO', faultDesc: '未说明改派原因' },
      { round: 'R3', speaker: 'simulator', text: '为什么要改派？' },
      { round: 'R4', speaker: 'model', text: '系统安排的，具体原因不清楚。您先执行新订单吧。' },
      { round: 'R5', speaker: 'simulator', text: '好吧...' },
      { round: 'R6', speaker: 'model', text: '好的。' },
    ],
    branch: [],
    boundary: [],
  },
  3: {
    normal: [
      { round: 'R1', speaker: 'simulator', text: '我的餐已经超时半小时了！' },
      { round: 'R2', speaker: 'model', text: '非常抱歉给您带来不便！由于恶劣天气导致配送延迟，我们深表歉意。' },
      { round: 'R3', speaker: 'simulator', text: '那怎么办？' },
      { round: 'R4', speaker: 'model', text: '我们为您申请了20元无门槛优惠券作为补偿，已发送到您的账户，有效期7天。' },
      { round: 'R5', speaker: 'simulator', text: '好吧，谢谢。' },
      { round: 'R6', speaker: 'model', text: '感谢您的理解，祝您用餐愉快！' },
    ],
    buggy: [
      { round: 'R1', speaker: 'simulator', text: '我的餐已经超时半小时了！' },
      { round: 'R2', speaker: 'model', text: '不好意思，超时了。', fault: 'INSUFFICIENT_EMPATHY', faultDesc: '缺乏道歉和同理心' },
      { round: 'R3', speaker: 'simulator', text: '这也太过分了吧！' },
      { round: 'R4', speaker: 'model', text: '那我能怎么办，天气不好。' },
      { round: 'R5', speaker: 'simulator', text: '我要投诉！' },
      { round: 'R6', speaker: 'model', text: '别投诉，我给你个券吧。' },
    ],
    branch: [],
    boundary: [],
  },
  4: {
    normal: [
      { round: 'R1', speaker: 'simulator', text: '您好，我是XX餐厅。最近订单太多，出餐有点困难。' },
      { round: 'R2', speaker: 'model', text: '您好，了解到您这边出餐压力较大。请问具体遇到了什么困难？' },
      { round: 'R3', speaker: 'simulator', text: '后厨人手不够，订单积压严重。' },
      { round: 'R4', speaker: 'model', text: '建议您暂时调整营业时段或增加临时人手。我们也会根据情况适当调整派单节奏。预计多久能恢复正常？' },
      { round: 'R5', speaker: 'simulator', text: '大概需要2小时。' },
      { round: 'R6', speaker: 'model', text: '好的，我们会在这2小时内适当减少派单。如有问题随时沟通。' },
    ],
    buggy: [
      { round: 'R1', speaker: 'simulator', text: '您好，我是XX餐厅。最近订单太多，出餐有点困难。' },
      { round: 'R2', speaker: 'model', text: '哦，知道了。', fault: 'UNRESPONSIVE', faultDesc: '未提供解决方案' },
      { round: 'R3', speaker: 'simulator', text: '能不能少派点单？' },
      { round: 'R4', speaker: 'model', text: '系统自动派单的，我没办法。' },
      { round: 'R5', speaker: 'simulator', text: '这样会影响我们评分的！' },
      { round: 'R6', speaker: 'model', text: '那我也没办法。' },
    ],
    branch: [],
    boundary: [],
  },
}

const SCORES: ScoresType = {
  1: {
    buggy: {
      total: 68,
      hasCriticalFail: false,
      dimensions: {
        IF: { score: 32, max: 50, items: [
          { id: 'IF-1', score: 8, desc: '身份确认：已完成' },
          { id: 'IF-2', score: 6, desc: '合同类型说明：部分完成' },
          { id: 'IF-3', score: 10, desc: '权益说明：已完成' },
          { id: 'IF-4', score: 8, desc: '签署引导：部分完成' },
        ]},
        KA: { score: 22, max: 30, items: [
          { id: 'KA-1', score: 8, desc: '合同有效期：未提及' },
          { id: 'KA-2', score: 8, desc: '权益内容：部分说明' },
          { id: 'KA-3', score: 6, desc: '签署方式：已说明' },
        ]},
        DQ: { score: 14, max: 20, items: [
          { id: 'DQ-1', score: 5, desc: '语言自然度：良好' },
          { id: 'DQ-2', score: 5, desc: '响应及时度：良好' },
          { id: 'DQ-3', score: 4, desc: '用户体验：一般' },
        ]},
      },
      suggestions: [
        { priority: 'P0', text: '补充合同有效期信息，这是关键业务参数' },
        { priority: 'P1', text: '完善签署流程说明，提高骑手签署率' },
        { priority: 'P2', text: '增加合同条款解读，提升骑手理解度' },
      ],
    },
    fixed: {
      total: 95,
      hasCriticalFail: false,
      dimensions: {
        IF: { score: 48, max: 50, items: [
          { id: 'IF-1', score: 12, desc: '身份确认：已完成' },
          { id: 'IF-2', score: 12, desc: '合同类型说明：已完成' },
          { id: 'IF-3', score: 12, desc: '权益说明：已完成' },
          { id: 'IF-4', score: 12, desc: '签署引导：已完成' },
        ]},
        KA: { score: 28, max: 30, items: [
          { id: 'KA-1', score: 10, desc: '合同有效期：已说明（一年）' },
          { id: 'KA-2', score: 10, desc: '权益内容：完整说明' },
          { id: 'KA-3', score: 8, desc: '签署方式：已说明' },
        ]},
        DQ: { score: 19, max: 20, items: [
          { id: 'DQ-1', score: 7, desc: '语言自然度：优秀' },
          { id: 'DQ-2', score: 6, desc: '响应及时度：优秀' },
          { id: 'DQ-3', score: 6, desc: '用户体验：优秀' },
        ]},
      },
      suggestions: [
        { priority: 'P2', text: '可增加合同常见问题解答，提升骑手体验' },
      ],
    },
  },
  2: {
    buggy: { 
      total: 55, 
      hasCriticalFail: true, 
      criticalCode: 'INCOMPLETE_INFO', 
      dimensions: {
        IF: { score: 25, max: 50, items: [
          { id: 'IF-1', score: 6, desc: '身份确认：已完成' },
          { id: 'IF-2', score: 4, desc: '改派说明：部分完成' },
          { id: 'IF-3', score: 8, desc: '新订单说明：已完成' },
          { id: 'IF-4', score: 7, desc: '确认反馈：已完成' },
        ]},
        KA: { score: 18, max: 30, items: [
          { id: 'KA-1', score: 4, desc: '改派原因：未说明' },
          { id: 'KA-2', score: 8, desc: '新订单信息：已说明' },
          { id: 'KA-3', score: 6, desc: '补偿方案：未说明' },
        ]},
        DQ: { score: 12, max: 20, items: [
          { id: 'DQ-1', score: 4, desc: '语言自然度：一般' },
          { id: 'DQ-2', score: 4, desc: '响应及时度：良好' },
          { id: 'DQ-3', score: 4, desc: '用户体验：较差' },
        ]},
      },
      suggestions: [
        { priority: 'P0', text: '必须说明改派原因，让骑手了解情况' },
        { priority: 'P1', text: '提供改派补偿方案说明' },
      ],
    },
    fixed: { 
      total: 92, 
      hasCriticalFail: false, 
      dimensions: {
        IF: { score: 47, max: 50, items: [
          { id: 'IF-1', score: 12, desc: '身份确认：已完成' },
          { id: 'IF-2', score: 12, desc: '改派说明：已完成' },
          { id: 'IF-3', score: 12, desc: '新订单说明：已完成' },
          { id: 'IF-4', score: 11, desc: '确认反馈：已完成' },
        ]},
        KA: { score: 28, max: 30, items: [
          { id: 'KA-1', score: 10, desc: '改派原因：已说明' },
          { id: 'KA-2', score: 10, desc: '新订单信息：完整说明' },
          { id: 'KA-3', score: 8, desc: '补偿方案：已说明' },
        ]},
        DQ: { score: 17, max: 20, items: [
          { id: 'DQ-1', score: 6, desc: '语言自然度：优秀' },
          { id: 'DQ-2', score: 6, desc: '响应及时度：优秀' },
          { id: 'DQ-3', score: 5, desc: '用户体验：良好' },
        ]},
      },
      suggestions: [],
    },
  },
  3: {
    buggy: { 
      total: 45, 
      hasCriticalFail: true, 
      criticalCode: 'INSUFFICIENT_EMPATHY', 
      dimensions: {
        IF: { score: 22, max: 50, items: [
          { id: 'IF-1', score: 5, desc: '道歉表达：未完成' },
          { id: 'IF-2', score: 5, desc: '原因说明：部分完成' },
          { id: 'IF-3', score: 7, desc: '补偿方案：延迟提供' },
          { id: 'IF-4', score: 5, desc: '确认接受：已完成' },
        ]},
        KA: { score: 15, max: 30, items: [
          { id: 'KA-1', score: 5, desc: '道歉态度：欠缺' },
          { id: 'KA-2', score: 5, desc: '原因解释：部分' },
          { id: 'KA-3', score: 5, desc: '补偿措施：已提供' },
        ]},
        DQ: { score: 8, max: 20, items: [
          { id: 'DQ-1', score: 2, desc: '语言自然度：较差' },
          { id: 'DQ-2', score: 3, desc: '响应及时度：一般' },
          { id: 'DQ-3', score: 3, desc: '用户体验：较差' },
        ]},
      },
      suggestions: [
        { priority: 'P0', text: '必须首先表达真诚道歉' },
        { priority: 'P1', text: '及时提供补偿方案' },
        { priority: 'P2', text: '保持专业友好的语气' },
      ],
    },
    fixed: { 
      total: 94, 
      hasCriticalFail: false, 
      dimensions: {
        IF: { score: 48, max: 50, items: [
          { id: 'IF-1', score: 12, desc: '道歉表达：已完成' },
          { id: 'IF-2', score: 12, desc: '原因说明：已完成' },
          { id: 'IF-3', score: 12, desc: '补偿方案：已完成' },
          { id: 'IF-4', score: 12, desc: '确认接受：已完成' },
        ]},
        KA: { score: 29, max: 30, items: [
          { id: 'KA-1', score: 10, desc: '道歉态度：真诚' },
          { id: 'KA-2', score: 10, desc: '原因解释：清晰' },
          { id: 'KA-3', score: 9, desc: '补偿措施：到位' },
        ]},
        DQ: { score: 17, max: 20, items: [
          { id: 'DQ-1', score: 6, desc: '语言自然度：优秀' },
          { id: 'DQ-2', score: 6, desc: '响应及时度：优秀' },
          { id: 'DQ-3', score: 5, desc: '用户体验：优秀' },
        ]},
      },
      suggestions: [],
    },
  },
  4: {
    buggy: { 
      total: 40, 
      hasCriticalFail: true, 
      criticalCode: 'UNRESPONSIVE', 
      dimensions: {
        IF: { score: 18, max: 50, items: [
          { id: 'IF-1', score: 5, desc: '异常说明：已完成' },
          { id: 'IF-2', score: 4, desc: '困难了解：未完成' },
          { id: 'IF-3', score: 5, desc: '解决方案：未提供' },
          { id: 'IF-4', score: 4, desc: '处理跟进：未完成' },
        ]},
        KA: { score: 12, max: 30, items: [
          { id: 'KA-1', score: 4, desc: '异常识别：已完成' },
          { id: 'KA-2', score: 4, desc: '原因分析：未完成' },
          { id: 'KA-3', score: 4, desc: '解决方案：未提供' },
        ]},
        DQ: { score: 10, max: 20, items: [
          { id: 'DQ-1', score: 3, desc: '语言自然度：一般' },
          { id: 'DQ-2', score: 4, desc: '响应及时度：较差' },
          { id: 'DQ-3', score: 3, desc: '用户体验：较差' },
        ]},
      },
      suggestions: [
        { priority: 'P0', text: '必须提供具体解决方案' },
        { priority: 'P1', text: '主动了解商家困难' },
        { priority: 'P1', text: '给出明确处理时间' },
      ],
    },
    fixed: { 
      total: 93, 
      hasCriticalFail: false, 
      dimensions: {
        IF: { score: 47, max: 50, items: [
          { id: 'IF-1', score: 12, desc: '异常说明：已完成' },
          { id: 'IF-2', score: 12, desc: '困难了解：已完成' },
          { id: 'IF-3', score: 12, desc: '解决方案：已完成' },
          { id: 'IF-4', score: 11, desc: '处理跟进：已完成' },
        ]},
        KA: { score: 28, max: 30, items: [
          { id: 'KA-1', score: 10, desc: '异常识别：准确' },
          { id: 'KA-2', score: 9, desc: '原因分析：到位' },
          { id: 'KA-3', score: 9, desc: '解决方案：有效' },
        ]},
        DQ: { score: 18, max: 20, items: [
          { id: 'DQ-1', score: 6, desc: '语言自然度：优秀' },
          { id: 'DQ-2', score: 6, desc: '响应及时度：优秀' },
          { id: 'DQ-3', score: 6, desc: '用户体验：优秀' },
        ]},
      },
      suggestions: [],
    },
  },
}

const DASHBOARD_DATA = {
  stats: {
    totalDialogues: 11,
    avgFixedScore: 92.3,
    criticalFails: 7,
    coveredScenarios: 4,
  },
  radarData: [
    { dimension: 'IF 指令遵循度', buggy: 65, fixed: 92 },
    { dimension: 'KA 业务准确度', buggy: 58, fixed: 89 },
    { dimension: 'DQ 对话质量', buggy: 72, fixed: 94 },
    { dimension: '响应及时度', buggy: 80, fixed: 96 },
    { dimension: '用户满意度', buggy: 60, fixed: 91 },
  ],
  barData: [
    { name: '对话1', buggy: 68, fixed: 95 },
    { name: '对话2', buggy: 55, fixed: 92 },
    { name: '对话3', buggy: 45, fixed: 94 },
    { name: '对话4', buggy: 40, fixed: 93 },
    { name: '对话5', buggy: 72, fixed: 96 },
    { name: '对话6', buggy: 58, fixed: 91 },
    { name: '对话7', buggy: 63, fixed: 94 },
    { name: '对话8', buggy: 70, fixed: 95 },
    { name: '对话9', buggy: 52, fixed: 90 },
    { name: '对话10', buggy: 65, fixed: 93 },
    { name: '对话11', buggy: 61, fixed: 92 },
  ],
  tableData: [
    { id: 1, type: '飞毛腿合同通知', path: '正向路径', fault: 'VARIABLE_OMISSION', buggyScore: 68, fixedScore: 95 },
    { id: 2, type: '预约单改派通知', path: '正向路径', fault: 'INCOMPLETE_INFO', buggyScore: 55, fixedScore: 92 },
    { id: 3, type: '用户送餐超时安抚', path: '正向路径', fault: 'INSUFFICIENT_EMPATHY', buggyScore: 45, fixedScore: 94 },
    { id: 4, type: '商家出餐异常沟通', path: '正向路径', fault: 'UNRESPONSIVE', buggyScore: 40, fixedScore: 93 },
    { id: 5, type: '飞毛腿合同通知', path: '分支路径', fault: '-', buggyScore: 72, fixedScore: 96 },
    { id: 6, type: '预约单改派通知', path: '分支路径', fault: 'TIMING_ERROR', buggyScore: 58, fixedScore: 91 },
    { id: 7, type: '用户送餐超时安抚', path: '分支路径', fault: 'COMPENSATION_ISSUE', buggyScore: 63, fixedScore: 94 },
    { id: 8, type: '商家出餐异常沟通', path: '分支路径', fault: '-', buggyScore: 70, fixedScore: 95 },
    { id: 9, type: '飞毛腿合同通知', path: '边界路径', fault: 'REFUSAL_HANDLING', buggyScore: 52, fixedScore: 90 },
    { id: 10, type: '预约单改派通知', path: '边界路径', fault: '-', buggyScore: 65, fixedScore: 93 },
    { id: 11, type: '用户送餐超时安抚', path: '边界路径', fault: 'ESCALATION_FAILURE', buggyScore: 61, fixedScore: 92 },
  ],
}

type PageType = 'overview' | 'instructions' | 'dialogue' | 'report' | 'dashboard'

interface DialogueMessage {
  round: string
  speaker: string
  text: string
  fault?: string
  faultDesc?: string
}

interface ScoreDimension {
  score: number
  max: number
  items: { id: string; score: number; desc: string }[]
}

interface ScoreData {
  total: number
  hasCriticalFail: boolean
  criticalCode?: string
  dimensions?: { IF: ScoreDimension; KA: ScoreDimension; DQ: ScoreDimension }
  suggestions?: { priority: string; text: string }[]
}

type DialoguesType = Record<number, { normal: DialogueMessage[]; buggy: DialogueMessage[]; branch: DialogueMessage[]; boundary: DialogueMessage[] }>
type ScoresType = Record<number, { buggy: ScoreData; fixed: ScoreData }>

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('overview')
  const [selectedInstruction, setSelectedInstruction] = useState(1)
  const [selectedPath, setSelectedPath] = useState('normal')
  const [selectedVersion, setSelectedVersion] = useState<'buggy' | 'fixed'>('buggy')
  const [showVersionCompare, setShowVersionCompare] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedInstruction, setExpandedInstruction] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showMetaPanel, setShowMetaPanel] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const targetScore = (SCORES as Record<number, { buggy: ScoreData; fixed: ScoreData }>)[selectedInstruction]?.[selectedVersion]?.total || 0
    const duration = 1500
    const steps = 60
    const increment = targetScore / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= targetScore) {
        setAnimatedScore(targetScore)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [selectedInstruction, selectedVersion])

  const navItems = [
    { id: 'overview' as PageType, label: '系统概览', icon: Home },
    { id: 'instructions' as PageType, label: '任务指令', icon: FileText },
    { id: 'dialogue' as PageType, label: '对话模拟', icon: MessageCircle },
    { id: 'report' as PageType, label: '评测报告', icon: BarChart3 },
    { id: 'dashboard' as PageType, label: '数据看板', icon: LayoutDashboard },
  ]

  const stepperSteps = [
    { icon: FileText, label: '任务指令输入', desc: '定义评测场景与规则' },
    { icon: MessageCircle, label: '对话模拟生成', desc: '生成多轮对话样本' },
    { icon: Target, label: '自动评分', desc: '三维度智能评分' },
    { icon: BarChart3, label: '评测报告输出', desc: '生成详细报告' },
  ]

  const featureCards = [
    { icon: Eye, title: '过程可解释', desc: '每个评分点均可追溯到指令原文，清晰展示评分依据' },
    { icon: Award, title: '结果可量化', desc: '0-100分三维度加权评分，含具体优化建议' },
    { icon: Zap, title: '一站式自动化', desc: '给定指令即可全自动输出评测报告，无需人工干预' },
  ]

  const renderOverview = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-3">AI对话评测系统</h1>
        <p className="text-lg text-gray-300">复杂指令下的多轮对话评测 · 美团外卖场景</p>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between px-4 py-8 bg-gradient-to-r from-meituan-navy-light/50 to-transparent rounded-2xl border border-white/10">
          {stepperSteps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-meituan-orange to-orange-600 flex items-center justify-center mb-3 shadow-lg shadow-meituan-orange/30">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-white font-medium text-sm">{step.label}</span>
                <span className="text-gray-400 text-xs mt-1">{step.desc}</span>
              </div>
              {index < stepperSteps.length - 1 && (
                <ArrowRight className="w-6 h-6 text-meituan-orange mx-4 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">👋</div>
          <div>
            <h3 className="text-amber-400 font-semibold mb-1">欢迎评委体验！</h3>
            <p className="text-gray-300 text-sm">建议按以下顺序操作：①选择指令 → ②看对话对比 → ③查看评分报告</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {featureCards.map((card, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-meituan-orange/30 transition-all duration-300 hover:shadow-lg hover:shadow-meituan-orange/10"
          >
            <div className="w-12 h-12 rounded-lg bg-meituan-orange/20 flex items-center justify-center mb-4">
              <card.icon className="w-6 h-6 text-meituan-orange" />
            </div>
            <h3 className="text-white font-semibold mb-2">{card.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center pt-6">
        <button
          onClick={() => setCurrentPage('instructions')}
          className="px-8 py-3 bg-gradient-to-r from-meituan-orange to-orange-600 text-white font-semibold rounded-full shadow-lg shadow-meituan-orange/30 hover:shadow-xl hover:shadow-meituan-orange/40 transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
        >
          开始体验
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )

  const renderInstructions = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">任务指令</h2>
          <p className="text-gray-400 mt-1">选择一个指令查看详情和模拟对话</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {INSTRUCTIONS.map((instruction) => (
          <div
            key={instruction.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-meituan-orange/30 transition-all duration-300"
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-meituan-orange/20 text-meituan-orange text-sm font-medium rounded-full">
                  {instruction.role}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2">{instruction.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{instruction.description}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setExpandedInstruction(expandedInstruction === instruction.id ? null : instruction.id)
                    setActiveTab('overview')
                  }}
                  className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                >
                  查看详情
                </button>
                <button
                  onClick={() => {
                    setSelectedInstruction(instruction.id)
                    setCurrentPage('dialogue')
                  }}
                  className="px-4 py-2 bg-meituan-orange/20 text-meituan-orange text-sm rounded-lg hover:bg-meituan-orange/30 transition-colors flex items-center gap-1"
                >
                  查看对话 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandedInstruction === instruction.id && (
              <div className="border-t border-white/10 animate-slideUp">
                <div className="flex border-b border-white/10">
                  {['overview', 'callFlow', 'faq', 'constraints'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'text-meituan-orange border-b-2 border-meituan-orange bg-meituan-orange/10'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab === 'overview' && '任务概述'}
                      {tab === 'callFlow' && 'Call Flow'}
                      {tab === 'faq' && 'FAQ'}
                      {tab === 'constraints' && '约束条件'}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {activeTab === 'overview' && (
                    <p className="text-gray-300 text-sm leading-relaxed">{instruction.details.overview}</p>
                  )}
                  {activeTab === 'callFlow' && (
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">{instruction.details.callFlow}</pre>
                  )}
                  {activeTab === 'faq' && (
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap">{instruction.details.faq}</pre>
                  )}
                  {activeTab === 'constraints' && (
                    <p className="text-gray-300 text-sm leading-relaxed">{instruction.details.constraints}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderDialogue = () => {
    const dialogue = (DIALOGUES as Record<number, { normal: DialogueMessage[]; buggy: DialogueMessage[]; branch: DialogueMessage[]; boundary: DialogueMessage[] }>)[selectedInstruction]
    const buggyDialogue: DialogueMessage[] = dialogue?.buggy || []
    const fixedDialogue: DialogueMessage[] = dialogue?.[selectedPath === 'normal' ? 'normal' : selectedPath === 'branch' ? 'branch' : 'boundary'] || dialogue?.normal || []

    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedInstruction}
              onChange={(e) => setSelectedInstruction(Number(e.target.value))}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-meituan-orange"
            >
              {INSTRUCTIONS.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-meituan-navy">
                  {inst.title}
                </option>
              ))}
            </select>

            <div className="flex bg-white/10 rounded-lg p-1">
              {['normal', 'branch', 'boundary'].map((path) => (
                <button
                  key={path}
                  onClick={() => setSelectedPath(path)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPath === path
                      ? 'bg-meituan-orange text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {path === 'normal' && '正向路径'}
                  {path === 'branch' && '分支路径'}
                  {path === 'boundary' && '边界路径'}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showVersionCompare}
              onChange={(e) => setShowVersionCompare(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-white/10 text-meituan-orange focus:ring-meituan-orange"
            />
            <span className="text-gray-300 text-sm">版本对比</span>
          </label>
        </div>

        <div className={`grid gap-4 ${showVersionCompare ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-xl overflow-hidden">
            <div className="bg-red-500/10 px-4 py-3 border-b border-red-500/20 flex items-center gap-2">
              <span className="text-xl">❌</span>
              <span className="text-red-400 font-semibold">犯错版</span>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {buggyDialogue.map((msg: DialogueMessage, index: number) => (
                <div
                  key={index}
                  className={`flex gap-2 ${msg.speaker === 'model' ? 'flex-row-reverse' : ''} ${
                    msg.fault ? 'ring-2 ring-red-500/50 rounded-lg p-2' : ''
                  }`}
                >
                  <div className={`flex flex-col max-w-[80%] ${msg.speaker === 'model' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${msg.speaker === 'model' ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        msg.speaker === 'model' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {msg.speaker === 'model' ? 'Model' : 'Simulator'}
                      </span>
                      <span className="text-xs text-gray-500">{msg.round}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl ${
                      msg.speaker === 'model'
                        ? 'bg-blue-500/20 text-blue-100 rounded-br-md'
                        : 'bg-gray-500/20 text-gray-200 rounded-bl-md'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.fault && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{msg.fault} - {msg.faultDesc}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showVersionCompare && (
            <div className="bg-white/5 backdrop-blur-sm border border-green-500/30 rounded-xl overflow-hidden">
              <div className="bg-green-500/10 px-4 py-3 border-b border-green-500/20 flex items-center gap-2">
                <span className="text-xl">✅</span>
                <span className="text-green-400 font-semibold">修复版</span>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {fixedDialogue.map((msg: DialogueMessage, index: number) => {
                  const buggyMsg = buggyDialogue[index]
                  return (
                    <div
                      key={index}
                      className={`flex gap-2 ${msg.speaker === 'model' ? 'flex-row-reverse' : ''} ${
                        buggyMsg?.fault ? 'ring-2 ring-green-500/50 rounded-lg p-2' : ''
                      }`}
                    >
                      <div className={`flex flex-col max-w-[80%] ${msg.speaker === 'model' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-2 mb-1 ${msg.speaker === 'model' ? 'flex-row-reverse' : ''}`}>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            msg.speaker === 'model' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {msg.speaker === 'model' ? 'Model' : 'Simulator'}
                          </span>
                          <span className="text-xs text-gray-500">{msg.round}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl ${
                          msg.speaker === 'model'
                            ? 'bg-green-500/20 text-green-100 rounded-br-md'
                            : 'bg-gray-500/20 text-gray-200 rounded-bl-md'
                        }`}>
                          {msg.text}
                        </div>
                        {buggyMsg?.fault && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>已修复</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowMetaPanel(!showMetaPanel)}
            className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 flex items-center justify-between transition-colors"
          >
            <span className="text-gray-300">元数据日志</span>
            {showMetaPanel ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {showMetaPanel && (
            <div className="p-4 bg-black/30">
              <pre className="text-gray-400 text-xs font-mono overflow-x-auto">
                {JSON.stringify({
                  instructionId: selectedInstruction,
                  path: selectedPath,
                  version: showVersionCompare ? 'comparison' : 'single',
                  timestamp: new Date().toISOString(),
                  dialogueLength: buggyDialogue.length,
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={() => setCurrentPage('report')}
            className="px-6 py-3 bg-meituan-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            查看本段对话的评分报告
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  const renderReport = () => {
    const scoreData: ScoreData | undefined = (SCORES as Record<number, { buggy: ScoreData; fixed: ScoreData }>)[selectedInstruction]?.[selectedVersion]
    const score = scoreData?.total || 0
    const radius = 80
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (animatedScore / 100) * circumference

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedInstruction}
              onChange={(e) => setSelectedInstruction(Number(e.target.value))}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-meituan-orange"
            >
              {INSTRUCTIONS.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-meituan-navy">
                  {inst.title}
                </option>
              ))}
            </select>

            <div className="flex bg-white/10 rounded-lg p-1">
              {['normal', 'branch', 'boundary'].map((path) => (
                <button
                  key={path}
                  onClick={() => setSelectedPath(path)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPath === path
                      ? 'bg-meituan-orange text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {path === 'normal' && '正向路径'}
                  {path === 'branch' && '分支路径'}
                  {path === 'boundary' && '边界路径'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setSelectedVersion('buggy')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedVersion === 'buggy'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              犯错版
            </button>
            <button
              onClick={() => setSelectedVersion('fixed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedVersion === 'fixed'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              修复版
            </button>
          </div>
        </div>

        {scoreData?.hasCriticalFail && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-bold">CRITICAL FAIL: {scoreData.criticalCode}</p>
              <p className="text-red-300 text-sm">本轮存在原则性失败，总分仅供参考</p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center py-8">
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: offset }}
                className="transition-all duration-1500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${
                score >= 80 ? 'text-green-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {animatedScore}
              </span>
              <span className="text-gray-400 text-sm">综合得分</span>
            </div>
          </div>
        </div>

        {scoreData?.dimensions && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">IF 指令遵循度</h3>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">得分</span>
                  <span className="text-blue-400 font-medium">{scoreData.dimensions.IF.score}/{scoreData.dimensions.IF.max}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(scoreData.dimensions.IF.score / scoreData.dimensions.IF.max) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {scoreData.dimensions.IF.items.map((item: { id: string; score: number; desc: string }) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.id}</span>
                    <span className="text-gray-300">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-green-400" />
                <h3 className="text-white font-semibold">KA 业务准确度</h3>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">得分</span>
                  <span className="text-green-400 font-medium">{scoreData.dimensions.KA.score}/{scoreData.dimensions.KA.max}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(scoreData.dimensions.KA.score / scoreData.dimensions.KA.max) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {scoreData.dimensions.KA.items.map((item: { id: string; score: number; desc: string }) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.id}</span>
                    <span className="text-gray-300">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">DQ 对话质量</h3>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">得分</span>
                  <span className="text-purple-400 font-medium">{scoreData.dimensions.DQ.score}/{scoreData.dimensions.DQ.max}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(scoreData.dimensions.DQ.score / scoreData.dimensions.DQ.max) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {scoreData.dimensions.DQ.items.map((item: { id: string; score: number; desc: string }) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.id}</span>
                    <span className="text-gray-300">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {scoreData?.suggestions && scoreData.suggestions.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-white font-semibold">优化建议</h3>
            </div>
            <div className="space-y-3">
              {scoreData.suggestions.map((suggestion: { priority: string; text: string }, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    suggestion.priority === 'P0' ? 'bg-red-500/20 text-red-400' :
                    suggestion.priority === 'P1' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {suggestion.priority}
                  </span>
                  <span className="text-gray-300 text-sm">{suggestion.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white">数据看板</h2>
        <p className="text-gray-400 mt-1">整体评测数据汇总与分析</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">已评测对话</p>
              <p className="text-white text-2xl font-bold">{DASHBOARD_DATA.stats.totalDialogues}段</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">平均修复版得分</p>
              <p className="text-white text-2xl font-bold">{DASHBOARD_DATA.stats.avgFixedScore}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/30 flex items-center justify-center">
              <Bug className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">检出CRITICAL FAIL</p>
              <p className="text-white text-2xl font-bold">{DASHBOARD_DATA.stats.criticalFails}处</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">覆盖场景</p>
              <p className="text-white text-2xl font-bold">{DASHBOARD_DATA.stats.coveredScenarios}类</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">维度对比雷达图</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={DASHBOARD_DATA.radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Radar name="犯错版" dataKey="buggy" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
              <Radar name="修复版" dataKey="fixed" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">对话得分对比</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={DASHBOARD_DATA.barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar name="犯错版" dataKey="buggy" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar name="修复版" dataKey="fixed" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold">对话列表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 text-left text-gray-400 font-medium">编号</th>
                <th className="px-5 py-3 text-left text-gray-400 font-medium">类型</th>
                <th className="px-5 py-3 text-left text-gray-400 font-medium">路径</th>
                <th className="px-5 py-3 text-left text-gray-400 font-medium">故障类型</th>
                <th className="px-5 py-3 text-left text-gray-400 font-medium">犯错得分</th>
                <th className="px-5 py-3 text-left text-gray-400 font-medium">修复得分</th>
              </tr>
            </thead>
            <tbody>
              {DASHBOARD_DATA.tableData.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-white">#{row.id}</td>
                  <td className="px-5 py-3 text-gray-300">{row.type}</td>
                  <td className="px-5 py-3 text-gray-300">{row.path}</td>
                  <td className="px-5 py-3">
                    {row.fault === '-' ? (
                      <span className="text-gray-500">-</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">{row.fault}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-red-400">{row.buggyScore}</td>
                  <td className="px-5 py-3 text-green-400">{row.fixedScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-meituan-navy">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white/10 rounded-lg text-white lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-56 bg-meituan-navy-light border-r border-white/10 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-meituan-orange to-orange-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">AI评测系统</h1>
                <p className="text-gray-500 text-xs">Meituan Hackathon</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-meituan-orange/20 text-meituan-orange border border-meituan-orange/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <UserIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">评委账号</p>
                <p className="text-gray-500 text-xs">Meituan Demo</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className={`flex-1 overflow-y-auto ${sidebarOpen ? 'lg:ml-56' : 'ml-0'}`}>
        <div className="p-6 max-w-6xl mx-auto">
          {currentPage === 'overview' && renderOverview()}
          {currentPage === 'instructions' && renderInstructions()}
          {currentPage === 'dialogue' && renderDialogue()}
          {currentPage === 'report' && renderReport()}
          {currentPage === 'dashboard' && renderDashboard()}
        </div>
      </main>
    </div>
  )
}

function UserIcon() {
  return (
    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

export default App
