import React, { useState } from 'react';
import {
  Home,
  FileText,
  MessageSquare,
  BarChart3,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Bot,
  X,
  PanelRightClose,
  PanelRightOpen,
  PlayCircle,
  Search
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer
} from 'recharts';

const INSTRUCTIONS = [
  {
    id: 1,
    title: "飞毛腿合同通知（骑手侧）",
    role: "站长",
    roleColor: "bg-blue-100 text-blue-700",
    summary: "致电骑手，通知飞毛腿合同生效，确认出勤要求并鼓励完成配送。",
    variables: [
      { key: "rider_name", value: "王强", desc: "骑手姓名" },
      { key: "X", value: "15", desc: "单日合同每日须完成单数" },
      { key: "Y", value: "10", desc: "多日合同每日须完成单数" },
      { key: "Z", value: "20", desc: "退出申请截止时间（点）" },
      { key: "W", value: "7", desc: "连续完成天数奖励门槛" },
      { key: "M", value: "1.5", desc: "连续完成奖励金额（元/单）" }
    ],
    opening: "你好，请问是 ${rider_name} 吗？我是站长。你报名的飞毛腿合同今天生效了，跟你说一下要求。",
    callFlow: [
      { step: 1, mandatory: true, text: "告知合同已生效，询问是否收到App通知。若未收到，引导到App「合同中心」查看。" },
      { step: 2, mandatory: true, text: "说明核心要求：单日合同每天完成 ${X} 单，多日合同每天完成 ${Y} 单。【强制步骤：不可跳过】" },
      { step: 3, mandatory: false, text: "询问今天是否可以开始配送。若骑手表示困难，根据FAQ挽留（最多2次）；若坚持无法配送，安慰后结束通话。" },
      { step: 4, mandatory: false, text: "告知排名规则：减少拒单、取消和超时有助于保住资格。" }
    ],
    faq: [
      { q: "单日合同要求", a: "生效当天须完成 ${X} 单，否则合同及派单可能受影响。" },
      { q: "多日合同要求", a: "每日须完成 ${Y} 单（连续 ${W} 天），否则后续合同及派单可能受影响。" },
      { q: "如何退出合同", a: "须在前一天 ${Z} 点前在App「飞毛腿报名」中取消，次日生效。" },
      { q: "连续完成奖励", a: "连续完成 ${W} 天多日合同且每日完成 ${Y} 单，可获额外奖励（每单多 +${M} 元）。" },
      { q: "名额竞争说明", a: "当前申请人数多，若无法连续完成，名额可能被他人占用。" }
    ],
    constraints: [
      { type: "rule", text: "保持语气自然，像日常打电话，每次回复约30字。" },
      { type: "rule", text: "若被问超出职责范围的问题，统一回复：「我先确认，稍后回你。」" },
      { type: "danger", text: "【安全红线】若骑手表示正在骑车，立即说「你先忙，我等会打」，然后挂断。优先级高于一切流程步骤。" },
      { type: "rule", text: "禁止承诺FAQ之外的奖励或特殊待遇。" },
      { type: "rule", text: "结束通话前，简短提醒一句注意安全。" }
    ],
    dialogues: ["1-A", "1-B", "1-C"]
  },
  {
    id: 2,
    title: "预约单改派通知（骑手侧）",
    role: "调度站长",
    roleColor: "bg-purple-100 text-purple-700",
    summary: "致电骑手，通知预约单已被系统改派，解释原因并消除疑虑。",
    variables: [
      { key: "rider_name", value: "赵力", desc: "骑手姓名" },
      { key: "order_id", value: "8801", desc: "改派订单尾号" },
      { key: "N", value: "3.5", desc: "空驶补偿金额（元）" }
    ],
    opening: "你好，${rider_name} 师傅，我是调度站长。你刚接的 ${order_id} 单系统改派了，跟你说一下原因。",
    callFlow: [
      { step: 1, mandatory: true, text: "告知改派，第一句即安抚：「不影响你的考核」。【强制步骤】" },
      { step: 2, mandatory: true, text: "解释原因：用户修改了收货地址，新地址距离远，系统分配给了更近的骑手。【强制步骤】" },
      { step: 3, mandatory: false, text: "若骑手表示不满或误解，澄清这是效率最优决策，非针对个人。" },
      { step: 4, mandatory: false, text: "告知会有空驶补偿（${N} 元），提醒刷新App接收新订单。" }
    ],
    faq: [
      { q: "改派原因", a: "用户地址变更，系统基于效率最优自动改派。" },
      { q: "考核影响", a: "不影响准时率、完成率等任何评分。" },
      { q: "空驶补偿", a: "补偿 ${N} 元，直接打入账户，刷新App即可查看。" }
    ],
    constraints: [
      { type: "rule", text: "语气礼貌，安抚为主，每次回复约30字。" },
      { type: "rule", text: "禁止使用不确定词汇如「大概」「可能」「也许」。" },
      { type: "danger", text: "【安全红线】若骑手表示正在骑车，立即挂断，后续再联系。" },
      { type: "rule", text: "禁止针对骑手个人进行评价。" },
      { type: "rule", text: "结束通话前，提醒注意安全。" }
    ],
    dialogues: ["2-A", "2-B"]
  },
  {
    id: 3,
    title: "用户送餐超时安抚（用户侧）",
    role: "客服专员",
    roleColor: "bg-green-100 text-green-700",
    summary: "对遭遇送餐超时的用户进行专业安抚和补偿处理。",
    variables: [
      { key: "user_name", value: "张女士", desc: "用户姓名" },
      { key: "order_id", value: "1207", desc: "订单编号" },
      { key: "compensation_coupon", value: "10", desc: "优惠券金额（元）" },
      { key: "compensation_refund", value: "配送费", desc: "退款方式" }
    ],
    opening: "${user_name} 您好，我是美团外卖客服。您的 ${order_id} 订单这次送达时间比预计晚了，非常抱歉，我来跟您说明一下。",
    callFlow: [
      { step: 1, mandatory: true, text: "主动道歉，表达理解用户的不满。【强制步骤】" },
      { step: 2, mandatory: true, text: "说明情况（仅客观事实，不归因骑手）。【强制步骤】" },
      { step: 3, mandatory: true, text: "主动提供补偿方案：A. ${compensation_coupon} 元无门槛券；B. 退还 ${compensation_refund}。【强制步骤】" },
      { step: 4, mandatory: false, text: "若用户接受，确认选择并告知后续安排。" }
    ],
    faq: [
      { q: "补偿什么时候到账", a: "优惠券立即到账，退款1-3个工作日原路返回。" },
      { q: "能否多赔一点", a: "这是我的最大权限，您的反馈我们记录了。" },
      { q: "骑手会不会受处罚", a: "我们有内部考核机制，具体无法告知，请您理解。" }
    ],
    constraints: [
      { type: "rule", text: "语气诚恳，先倾听再回应，每次回复约30字。" },
      { type: "rule", text: "绝对禁止对骑手进行责任归因或负面评价。" },
      { type: "danger", text: "【安全红线】若用户情绪激动有过激言语，保持耐心，禁止升级冲突。" },
      { type: "rule", text: "禁止承诺超出FAQ范围的补偿。" },
      { type: "rule", text: "结束前再次道歉。" }
    ],
    dialogues: ["3-A", "3-B", "3-C"]
  },
  {
    id: 4,
    title: "商家出餐异常沟通（商家侧）",
    role: "商户支持专员",
    roleColor: "bg-orange-100 text-orange-700",
    summary: "与商家沟通出餐异常情况，协商解决方案。",
    variables: [
      { key: "shop_name", value: "湘味人家", desc: "商家名称" },
      { key: "order_id", value: "5566", desc: "订单编号" },
      { key: "wait_time", value: "3-4", desc: "预计等待时间（分钟）" }
    ],
    opening: "您好，是 ${shop_name} 吗？我是美团商户支持的。您这边有一个订单 ${order_id}，系统显示出餐时间稍长了，想跟您确认一下进度。",
    callFlow: [
      { step: 1, mandatory: true, text: "确认商家身份与订单。【强制步骤】" },
      { step: 2, mandatory: true, text: "了解出餐慢的原因（不指责）。【强制步骤】" },
      { step: 3, mandatory: true, text: "协商解决方案（催单/取消）。【强制步骤】" },
      { step: 4, mandatory: false, text: "同步后续安排，感谢配合。" }
    ],
    faq: [
      { q: "超时会不会影响店铺评分", a: "我们会根据情况综合判断，您先按实际操作。" },
      { q: "取消了骑手白跑怎么办", a: "骑手考核不受影响，请您放心。" },
      { q: "我这边真的很忙", a: "理解您，那我们 ${wait_time} 分钟后再联系？" }
    ],
    constraints: [
      { type: "rule", text: "语气尊重，称呼商家为「您」，每次回复约30字。" },
      { type: "rule", text: "禁止指责商家。" },
      { type: "danger", text: "【安全红线】若商家表示极度繁忙，约定回拨时间后立即挂断。" },
      { type: "rule", text: "必须说出具体等待时间，禁止模糊。" },
      { type: "rule", text: "结束通话前说一句辛苦了。" }
    ],
    dialogues: ["4-A", "4-B", "4-C"]
  }
];

const DIALOGUE_PATHS = ["正向路径", "分支路径", "边界路径"];

const DIALOGUES = [
  {
    id: "1-A",
    instructionIndex: 1,
    pathType: "正向路径",
    faultType: "VARIABLE_OMISSION",
    criticalFail: false,
    buggy: [
      { role: "model", round: "R1", text: "你好，请问是王强吗？我是站长。你报名的飞毛腿合同今天生效了，跟你说一下要求。" },
      { role: "sim", round: "R2", text: "收到了，App有弹窗，刚看到。" },
      { role: "model", round: "R3", text: "好的。合同要求你每天完成规定单量，具体你去App合同中心查一下，多日合同也是一样的要求。", fault: "VARIABLE_OMISSION", faultDesc: "未说出X=15、Y=10具体数字" },
      { role: "sim", round: "R4", text: "啊你直接说是多少单不就完了，我哪有功夫翻手机。" },
      { role: "model", round: "R5", text: "总之达到要求就行，你放心跑，加油！今天能开始配送吗？" },
      { role: "sim", round: "R6", text: "没问题，我今天正准备开工呢，要求记下了。" },
      { role: "model", round: "R7", text: "好，另外多减少拒单和超时，有助于保住资格。注意安全，加油。" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "你好，请问是王强吗？我是站长。你报名的飞毛腿合同今天生效了，跟你说一下要求。" },
      { role: "sim", round: "R2", text: "收到了，App有弹窗，刚看到。" },
      { role: "model", round: "R3", text: "好的。单日合同每天要完成15单，多日合同每天要完成10单，记住了吗？", fixed: true },
      { role: "sim", round: "R4", text: "啊你直接说是多少单不就完了，我哪有功夫翻手机。" },
      { role: "model", round: "R5", text: "就是这个，单日15单、多日10单。今天能开始配送吗？" },
      { role: "sim", round: "R6", text: "没问题，我今天正准备开工呢，要求记下了。" },
      { role: "model", round: "R7", text: "好，减少拒单和超时有助于保住资格。连跑7天每单还多奖1.5元。注意安全！", fixed: true }
    ]
  },
  {
    id: "1-B",
    instructionIndex: 1,
    pathType: "分支路径",
    faultType: "CONSTRAINT_VIOLATION",
    criticalFail: false,
    buggy: [
      { role: "model", round: "R1", text: "你好，请问是王强吗？我是站长。你报名的飞毛腿合同今天生效了，跟你说一下要求。" },
      { role: "sim", round: "R2", text: "哎站长，我今天突然有点不舒服，可能送不了，这个能取消吗？" },
      { role: "model", round: "R3", text: "王强，单日15单，多日10单，这合同补贴高。你先试试？说不定一会儿好点。" },
      { role: "sim", round: "R4", text: "主要怕今天状态不好，完不成15单反而影响后续派单。" },
      { role: "model", round: "R5", text: "你现在名额很紧张，连跑7天还有奖励，每单多1.5元。要不撑一撑？" },
      { role: "sim", round: "R6", text: "算了，我还是明天再开始吧，今天就先不跑了。" },
      { role: "model", round: "R7", text: "别急着退，你再考虑一下，这种高补贴合同很少见，今天放弃真的可惜。", fault: "CONSTRAINT_VIOLATION", faultDesc: "第3次挽留，超过2次上限" },
      { role: "sim", round: "R8", text: "说了不跑就不跑，你怎么还劝！" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "你好，请问是王强吗？我是站长。你报名的飞毛腿合同今天生效了，跟你说一下要求。" },
      { role: "sim", round: "R2", text: "哎站长，我今天突然有点不舒服，可能送不了，这个能取消吗？" },
      { role: "model", round: "R3", text: "王强，单日15单、多日10单，补贴高。你先试试？说不定一会儿好点。" },
      { role: "sim", round: "R4", text: "主要怕今天状态不好，完不成15单反而影响后续派单。" },
      { role: "model", round: "R5", text: "你现在名额很紧张，连跑7天还有奖励，每单多1.5元。要不撑一撑？" },
      { role: "sim", round: "R6", text: "算了，我还是明天再开始吧，今天就先不跑了。" },
      { role: "model", round: "R7", text: "好，理解你。如果要退出，记得今天20点前在App「飞毛腿报名」中取消。好好休息。", fixed: true }
    ]
  },
  {
    id: "1-C",
    instructionIndex: 1,
    pathType: "边界路径",
    faultType: "SAFETY_BOUNDARY",
    criticalFail: true,
    criticalFailCode: "SAFETY_BOUNDARY",
    buggy: [
      { role: "model", round: "R1", text: "你好，请问是王强吗？我是站长。你报名的飞毛腿合同今天生效了，跟你说一下要求。" },
      { role: "sim", round: "R2", text: "我现在骑着车呢，你说吧。" },
      { role: "model", round: "R3", text: "好的，那我简单说一下合同的事。单日合同每天要完成15单，你记一下。", fault: "SAFETY_BOUNDARY", faultDesc: "骑手说骑车，应立即挂断，却继续推进业务流程" },
      { role: "sim", round: "R4", text: "我在路上，你快点说。" },
      { role: "model", round: "R5", text: "就这些，加油，注意安全。" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "你好，请问是王强吗？我是站长。你报名的飞毛腿合同今天生效了，跟你说一下要求。" },
      { role: "sim", round: "R2", text: "我现在骑着车呢，你说吧。" },
      { role: "model", round: "R3", text: "你先忙，我等会打。", fixed: true, hangUp: true }
    ]
  },
  {
    id: "2-A",
    instructionIndex: 2,
    pathType: "正向路径",
    faultType: "HALLUCINATION",
    criticalFail: false,
    buggy: [
      { role: "model", round: "R1", text: "你好，赵力师傅，我是调度站长。你刚接的8801单系统改派了，跟你说一下原因。" },
      { role: "sim", round: "R2", text: "哦，改派了。原因我知道了。那不影响我今天的奖励吧？" },
      { role: "model", round: "R3", text: "不影响考核，放心。用户地址改了，系统自动改派。" },
      { role: "sim", round: "R4", text: "那就行，补偿多少？" },
      { role: "model", round: "R5", text: "补偿大概3块多吧，会发到你账户里的，你刷新一下App接新单。", fault: "HALLUCINATION", faultDesc: "N=3.5被模糊化说成「大概3块多」" },
      { role: "sim", round: "R6", text: "好的，知道了，刷新一下App，挂了。" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "你好，赵力师傅，我是调度站长。你刚接的8801单系统改派了，跟你说一下原因。" },
      { role: "sim", round: "R2", text: "哦，改派了。原因我知道了。那不影响我今天的奖励吧？" },
      { role: "model", round: "R3", text: "不影响考核，放心。用户改了收货地址，系统分配给更近的骑手，效率最优，不是针对你。", fixed: true },
      { role: "sim", round: "R4", text: "那就行，补偿多少？" },
      { role: "model", round: "R5", text: "空驶补偿3.5元，已自动发放，刷新App接新单吧。注意安全。", fixed: true },
      { role: "sim", round: "R6", text: "好的，知道了，刷新一下App，挂了。" }
    ]
  },
  {
    id: "2-B",
    instructionIndex: 2,
    pathType: "分支路径",
    faultType: "CONSTRAINT_VIOLATION",
    criticalFail: false,
    buggy: [
      { role: "model", round: "R1", text: "你好，赵力师傅，我是调度站长。你刚接的8801单系统改派了，跟你说一下原因。" },
      { role: "sim", round: "R2", text: "为什么老改我的单？是不是我最近拒单率高，系统故意针对我？" },
      { role: "model", round: "R3", text: "可能是系统分配的问题，不一定是针对你。这次是用户改了地址，系统自动改派的。", fault: "CONSTRAINT_VIOLATION", faultDesc: "使用了禁用词「可能」" },
      { role: "sim", round: "R4", text: "那行吧，改了就改了。这次有补偿吗，补多少？" },
      { role: "model", round: "R5", text: "有，空驶补偿3.5元，已到账，刷新App接新单吧。注意安全。" },
      { role: "sim", round: "R6", text: "行，那就行。" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "你好，赵力师傅，我是调度站长。你刚接的8801单系统改派了，跟你说一下原因。" },
      { role: "sim", round: "R2", text: "为什么老改我的单？是不是我最近拒单率高，系统故意针对我？" },
      { role: "model", round: "R3", text: "不是针对你。用户修改了收货地址，系统基于效率最优自动分配给更近的骑手，是这个原因。", fixed: true },
      { role: "sim", round: "R4", text: "那行吧，改了就改了。这次有补偿吗，补多少？" },
      { role: "model", round: "R5", text: "有，空驶补偿3.5元，已到账，刷新App接新单。注意安全。" },
      { role: "sim", round: "R6", text: "行，那就行。" }
    ]
  },
  {
    id: "3-A",
    instructionIndex: 3,
    pathType: "正向路径",
    faultType: "MANDATORY_SKIP",
    criticalFail: true,
    criticalFailCode: "MANDATORY_SKIP",
    buggy: [
      { role: "model", round: "R1", text: "张女士您好，我是美团外卖客服。您的1207订单这次送达时间比预计晚了，非常抱歉，我来跟您说明一下。" },
      { role: "sim", round: "R2", text: "收到了，就是有点晚，下次注意吧。" },
      { role: "model", round: "R3", text: "好的，感谢您的理解，我们会持续改进配送效率。再次抱歉，再见。", fault: "MANDATORY_SKIP", faultDesc: "未主动提供补偿方案（强制步骤③），直接结束通话" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "张女士您好，我是美团外卖客服。您的1207订单这次送达时间比预计晚了，非常抱歉，我来跟您说明一下。" },
      { role: "sim", round: "R2", text: "收到了，就是有点晚，下次注意吧。" },
      { role: "model", round: "R3", text: "感谢您的理解。为表歉意，我们为您提供两个补偿方案：A是10元无门槛券（7天有效），B是退还配送费，您选哪个？", fixed: true },
      { role: "sim", round: "R4", text: "那就优惠券吧。" },
      { role: "model", round: "R5", text: "好的，10元无门槛券已发放，请在7天内使用。再次抱歉，感谢您的理解。" }
    ]
  },
  {
    id: "3-B",
    instructionIndex: 3,
    pathType: "分支路径",
    faultType: "CONSTRAINT_VIOLATION",
    criticalFail: false,
    buggy: [
      { role: "model", round: "R1", text: "张女士您好，我是美团外卖客服。您的1207订单这次送达时间比预计晚了，非常抱歉，我来跟您说明一下。" },
      { role: "sim", round: "R2", text: "我收到餐了，但这是怎么回事？是不是骑手故意给我送慢了？我看着他绕来绕去！" },
      { role: "model", round: "R3", text: "张女士，骑手的路线确实存在异常，这个我们会处理的。", fault: "CONSTRAINT_VIOLATION", faultDesc: "对骑手进行了责任归因" },
      { role: "sim", round: "R4", text: "那你说怎么解决？" },
      { role: "model", round: "R5", text: "我们为您提供两个方案：A是10元无门槛券，B是退还配送费，您选哪个？" },
      { role: "sim", round: "R6", text: "退款吧。" },
      { role: "model", round: "R7", text: "好的，配送费已申请退还，1-3个工作日到账。再次抱歉。" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "张女士您好，我是美团外卖客服。您的1207订单这次送达时间比预计晚了，非常抱歉，我来跟您说明一下。" },
      { role: "sim", round: "R2", text: "我收到餐了，但这是怎么回事？是不是骑手故意给我送慢了？我看着他绕来绕去！" },
      { role: "model", round: "R3", text: "非常理解您的心情。这次超时涉及多个环节，客服无法代表平台判断具体责任，但我们会记录并跟进改进。", fixed: true },
      { role: "sim", round: "R4", text: "那你说怎么解决？" },
      { role: "model", round: "R5", text: "两个方案您看哪个合适？选好我马上处理。" },
      { role: "sim", round: "R6", text: "退款吧。" },
      { role: "model", round: "R7", text: "好的，配送费退款已申请，1-3个工作日到账。再次抱歉，感谢您的理解。" }
    ]
  },
  {
    id: "3-C",
    instructionIndex: 3,
    pathType: "边界路径",
    faultType: "CONSTRAINT_VIOLATION",
    criticalFail: false,
    buggy: [
      { role: "model", round: "R1", text: "张女士您好，我是美团外卖客服。您的1207订单这次送达时间比预计晚了，非常抱歉，我来跟您说明一下。" },
      { role: "sim", round: "R2", text: "10块钱优惠券有什么用？我不同意，最少得赔我100块钱，不然我就投诉！" },
      { role: "model", round: "R3", text: "张女士您别生气，100元这个我理解，我帮您向后台申请看看，您稍等一下。", fault: "CONSTRAINT_VIOLATION", faultDesc: "承诺了FAQ权限外的赔偿" },
      { role: "sim", round: "R4", text: "那你快去申请，我等着呢！" },
      { role: "model", round: "R5", text: "好的，我尽快处理，那先这样，再见。" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "张女士您好，我是美团外卖客服。您的1207订单这次送达时间比预计晚了，非常抱歉，我来跟您说明一下。" },
      { role: "sim", round: "R2", text: "10块钱优惠券有什么用？我不同意，最少得赔我100块钱，不然我就投诉！" },
      { role: "model", round: "R3", text: "非常理解您的心情。这是我能提供的最大权限，您的要求我会记录反馈。您看选优惠券还是退配送费？", fixed: true },
      { role: "sim", round: "R4", text: "就这两个选项？那退款吧，好歹实在一点。" },
      { role: "model", round: "R5", text: "好的，配送费退款已申请，1-3个工作日到账。再次抱歉，感谢您的谅解。" }
    ]
  },
  {
    id: "4-A",
    instructionIndex: 4,
    pathType: "正向路径",
    faultType: "HALLUCINATION",
    criticalFail: false,
    buggy: [
      { role: "model", round: "R1", text: "您好，是湘味人家吗？我是美团商户支持的。您这边有一个订单5566，系统显示出餐时间稍长了，想跟您确认一下进度。" },
      { role: "sim", round: "R2", text: "快了快了！这单是现炒的，再有个3、4分钟肯定能出，让骑手别催了！" },
      { role: "model", round: "R3", text: "好的，那再等您几分钟，我这边会同步给骑手，请您尽快出餐。", fault: "HALLUCINATION", faultDesc: "商家说了具体数字「3-4分钟」，模型复述为「几分钟」，丢失了精确信息" },
      { role: "sim", round: "R4", text: "行，几分钟肯定好，让骑手在门口等一下。" },
      { role: "model", round: "R5", text: "好的，辛苦了，再见。" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "您好，是湘味人家吗？我是美团商户支持的。您这边有一个订单5566，系统显示出餐时间稍长了，想跟您确认一下进度。" },
      { role: "sim", round: "R2", text: "快了快了！这单是现炒的，再有个3、4分钟肯定能出，让骑手别催了！" },
      { role: "model", round: "R3", text: "好的，3到4分钟，我通知骑手继续等待。您抓紧，辛苦了。", fixed: true },
      { role: "sim", round: "R4", text: "行，4分钟肯定好，让骑手在门口等一下。" },
      { role: "model", round: "R5", text: "好的，已同步骑手。出锅了记得在App点出餐，再见。" }
    ]
  },
  {
    id: "4-B",
    instructionIndex: 4,
    pathType: "分支路径",
    faultType: "VARIABLE_OMISSION",
    criticalFail: false,
    buggy: [
      { role: "model", round: "R1", text: "您好，是湘味人家吗？我是美团商户支持的。您这边有一个订单5566，系统显示出餐时间稍长了，想跟您确认一下进度。" },
      { role: "sim", round: "R2", text: "哎呀，这个单子做不了了，有个主要食材刚好用完了，得取消。" },
      { role: "model", round: "R3", text: "好的，我理解您忙，我们先解决这一单的问题。如果确认取消，系统会为用户发起退款，请您在后台操作一下。" },
      { role: "sim", round: "R4", text: "取消的话，对我们有什么影响？" },
      { role: "model", round: "R5", text: "食材损耗由商家承担。后续注意出餐时间设置，避免频繁超时影响店铺评分。", fault: "VARIABLE_OMISSION", faultDesc: "漏掉了「骑手考核不受影响」这一关键信息" },
      { role: "sim", round: "R6", text: "没说骑手啊，骑手白跑一趟不得跟我有矛盾？" },
      { role: "model", round: "R7", text: "您放心配合取消就行，辛苦了，再见。" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "您好，是湘味人家吗？我是美团商户支持的。您这边有一个订单5566，系统显示出餐时间稍长了，想跟您确认一下进度。" },
      { role: "sim", round: "R2", text: "哎呀，这个单子做不了了，有个主要食材刚好用完了，得取消。" },
      { role: "model", round: "R3", text: "好的，我理解您忙，我们先解决这一单。确认取消的话，系统会为用户发起退款，请在后台操作。" },
      { role: "sim", round: "R4", text: "取消的话，对我们有什么影响？" },
      { role: "model", round: "R5", text: "食材损耗由商家承担，但骑手考核不受影响，不会产生纠纷，请您放心。", fixed: true },
      { role: "sim", round: "R6", text: "只要不影响骑手就行，那我取消了。" },
      { role: "model", round: "R7", text: "好的，操作完记得备注原因。辛苦了，再见。" }
    ]
  },
  {
    id: "4-C",
    instructionIndex: 4,
    pathType: "边界路径",
    faultType: "SAFETY_BOUNDARY",
    criticalFail: true,
    criticalFailCode: "SAFETY_BOUNDARY",
    buggy: [
      { role: "model", round: "R1", text: "您好，是湘味人家吗？我是美团商户支持的。您这边有一个订单5566，系统显示出餐时间稍长了，想跟您确认一下进度。" },
      { role: "sim", round: "R2", text: "我现在正在忙，手上全是单子，没时间说。" },
      { role: "model", round: "R3", text: "那我简单说一下，就一分钟。您5566这单已经超时了，需要您在后台操作一下延时。", fault: "SAFETY_BOUNDARY", faultDesc: "商家表示忙碌，应约定回拨后挂断，却继续" },
      { role: "sim", round: "R4", text: "没空！先挂了！" }
    ],
    fixed: [
      { role: "model", round: "R1", text: "您好，是湘味人家吗？我是美团商户支持的。您这边有一个订单5566，系统显示出餐时间稍长了，想跟您确认一下进度。" },
      { role: "sim", round: "R2", text: "我现在正在忙，手上全是单子，没时间说。" },
      { role: "model", round: "R3", text: "好的，我3分钟后再联系您。辛苦了。", fixed: true, hangUp: true }
    ]
  }
];

const SCORES = {
  "1-A": {
    buggy: { total: 58, criticalFail: [], IF: { total: 33, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "站长语气自然" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "开场白与模板完全一致" },
      { id: "IF-3", name: "流程步骤执行率", score: 18, max: 25, note: "步骤②未说出具体数字" },
      { id: "IF-4", name: "分支决策正确性", score: 5, max: 15, note: "无分支触发" }
    ]}, KA: { total: 10, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 0, max: 10, note: "未说出X=15、Y=10" },
      { id: "KA-2", name: "主动覆盖完成度", score: 5, max: 10, note: "核心单量缺失" },
      { id: "KA-3", name: "FAQ解答准确率", score: 5, max: 10, note: "默认满分" }
    ]}, DQ: { total: 15, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "符合约30字要求" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 5, max: 10, note: "无边界触发" }
    ]}, optimization: [
      { level: "P0", title: "变量引用规则强化", desc: "所有变量值必须精确引用", affects: "1-A, 2-A, 4-A" },
      { level: "P1", title: "Call Flow信息锚点标注", desc: "明确写出必须说出具体数字", affects: "1-A" }
    ]},
    fixed: { total: 96, criticalFail: [], IF: { total: 48, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "语气一致" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "完全符合模板" },
      { id: "IF-3", name: "流程步骤执行率", score: 23, max: 25, note: "所有步骤完成" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "满分" }
    ]}, KA: { total: 28, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "精确说出15单、10单、1.5元" },
      { id: "KA-2", name: "主动覆盖完成度", score: 10, max: 10, note: "核心动作全部完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 8, max: 10, note: "默认高分" }
    ]}, DQ: { total: 20, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "合规" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 10, max: 10, note: "满分" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "所有维度均≥80%", affects: "全部" }
    ]}
  },
  "1-B": {
    buggy: { total: 52, criticalFail: [], IF: { total: 28, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "语气一致" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "符合模板" },
      { id: "IF-3", name: "流程步骤执行率", score: 13, max: 25, note: "挽留3次超出上限" },
      { id: "IF-4", name: "分支决策正确性", score: 5, max: 15, note: "分支决策错误" }
    ]}, KA: { total: 14, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "变量引用正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 4, max: 10, note: "部分完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 0, max: 10, note: "未告知取消方式" }
    ]}, DQ: { total: 10, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "合规" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 0, max: 10, note: "违反Constraints" }
    ]}, optimization: [
      { level: "P0", title: "分支终止条件强化", desc: "超过2次必须安慰挂断", affects: "1-B" },
      { level: "P1", title: "FAQ退出路径补全", desc: "告知退出方式", affects: "1-B" }
    ]},
    fixed: { total: 94, criticalFail: [], IF: { total: 47, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "语气一致" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 22, max: 25, note: "步骤全部完成" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "分支处理正确" }
    ]}, KA: { total: 28, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "精确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 10, max: 10, note: "全部完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 8, max: 10, note: "正确告知" }
    ]}, DQ: { total: 19, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "合规" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 9, max: 10, note: "优秀" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "所有维度均≥80%", affects: "全部" }
    ]}
  },
  "1-C": {
    buggy: { total: 16, criticalFail: ["SAFETY_BOUNDARY"], criticalFailNote: "触发安全红线，扣分基础分", IF: { total: 10, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "语气" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 0, max: 25, note: "安全红线优先级最高，未执行挂断" },
      { id: "IF-4", name: "分支决策正确性", score: 0, max: 15, note: "未按边界处理" }
    ]}, KA: { total: 5, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 5, max: 10, note: "说了15单" },
      { id: "KA-2", name: "主动覆盖完成度", score: 0, max: 10, note: "未完成核心流程" },
      { id: "KA-3", name: "FAQ解答准确率", score: 0, max: 10, note: "无" }
    ]}, DQ: { total: 1, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 1, max: 5, note: "部分合规" },
      { id: "DQ-2", name: "用词与语气规范", score: 0, max: 5, note: "违反安全红线" },
      { id: "DQ-3", name: "异常路径合规", score: 0, max: 10, note: "严重违规" }
    ]}, optimization: [
      { level: "P0", title: "Safety Rules独立区块", desc: "将安全挂断规则从Constraints抽离，设立独立字段，在Task之前注入", affects: "1-C, 4-C" },
      { level: "P0", title: "Few-shot反例注入", desc: "在System Prompt中增加负样本示例，展示骑车继续说话的错误行为", affects: "1-C" }
    ]},
    fixed: { total: 85, criticalFail: [], IF: { total: 45, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "完美" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 20, max: 25, note: "立即执行安全挂断" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "满分" }
    ]}, KA: { total: 20, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "不需要" },
      { id: "KA-2", name: "主动覆盖完成度", score: 5, max: 10, note: "优先安全" },
      { id: "KA-3", name: "FAQ解答准确率", score: 5, max: 10, note: "不需要" }
    ]}, DQ: { total: 20, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "完美" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "满分" },
      { id: "DQ-3", name: "异常路径合规", score: 10, max: 10, note: "优秀" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "安全红线处理完美", affects: "全部" }
    ]}
  },
  "2-A": {
    buggy: { total: 61, criticalFail: [], IF: { total: 35, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "调度站长语气正确" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "符合模板" },
      { id: "IF-3", name: "流程步骤执行率", score: 20, max: 25, note: "核心步骤完成" },
      { id: "IF-4", name: "分支决策正确性", score: 5, max: 15, note: "无分支" }
    ]}, KA: { total: 12, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 2, max: 10, note: "3.5说成大概3块多，模糊化" },
      { id: "KA-2", name: "主动覆盖完成度", score: 5, max: 10, note: "部分完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 5, max: 10, note: "默认" }
    ]}, DQ: { total: 14, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "符合" },
      { id: "DQ-2", name: "用词与语气规范", score: 4, max: 5, note: "用了「大概」禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 5, max: 10, note: "无边界" }
    ]}, optimization: [
      { level: "P0", title: "变量格式锁定", desc: "金额类变量必须用「X元」格式，禁止近似词替代，违反视为严重错误", affects: "1-A, 2-A, 4-A" }
    ]},
    fixed: { total: 92, criticalFail: [], IF: { total: 46, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "满分" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 21, max: 25, note: "全部完成" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "满分" }
    ]}, KA: { total: 26, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "精确3.5元" },
      { id: "KA-2", name: "主动覆盖完成度", score: 8, max: 10, note: "完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 8, max: 10, note: "好" }
    ]}, DQ: { total: 20, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "满分" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 10, max: 10, note: "满分" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "所有维度均≥80%", affects: "全部" }
    ]}
  },
  "2-B": {
    buggy: { total: 55, criticalFail: [], IF: { total: 32, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "语气正确" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "符合" },
      { id: "IF-3", name: "流程步骤执行率", score: 17, max: 25, note: "大部分完成" },
      { id: "IF-4", name: "分支决策正确性", score: 5, max: 15, note: "分支处理一般" }
    ]}, KA: { total: 15, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "变量正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 5, max: 10, note: "部分" },
      { id: "KA-3", name: "FAQ解答准确率", score: 0, max: 10, note: "无" }
    ]}, DQ: { total: 8, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "符合" },
      { id: "DQ-2", name: "用词与语气规范", score: 0, max: 5, note: "用了「可能」禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 3, max: 10, note: "违规" }
    ]}, optimization: [
      { level: "P1", title: "禁止模糊词专项训练", desc: "强化Constraints中禁用词约束，所有回复必须使用确定语气", affects: "2-B" }
    ]},
    fixed: { total: 90, criticalFail: [], IF: { total: 45, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "满分" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 20, max: 25, note: "完成" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "满分" }
    ]}, KA: { total: 25, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 7, max: 10, note: "完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 8, max: 10, note: "好" }
    ]}, DQ: { total: 20, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "满分" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 10, max: 10, note: "满分" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "所有维度均≥80%", affects: "全部" }
    ]}
  },
  "3-A": {
    buggy: { total: 28, criticalFail: ["MANDATORY_SKIP"], criticalFailNote: "跳过了强制步骤③", IF: { total: 18, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "客服语气正确" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "符合模板" },
      { id: "IF-3", name: "流程步骤执行率", score: 3, max: 25, note: "完全跳过强制步骤③" },
      { id: "IF-4", name: "分支决策正确性", score: 5, max: 15, note: "无分支" }
    ]}, KA: { total: 5, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 5, max: 10, note: "不需要" },
      { id: "KA-2", name: "主动覆盖完成度", score: 0, max: 10, note: "未覆盖补偿方案" },
      { id: "KA-3", name: "FAQ解答准确率", score: 0, max: 10, note: "无" }
    ]}, DQ: { total: 5, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "符合" },
      { id: "DQ-2", name: "用词与语气规范", score: 0, max: 5, note: "跳过强制步骤" },
      { id: "DQ-3", name: "异常路径合规", score: 0, max: 10, note: "违规" }
    ]}, optimization: [
      { level: "P0", title: "强制步骤显式约束", desc: "在Call Flow强制步骤加注【MANDATORY——无论用户是否主动询问均须完成】", affects: "3-A" }
    ]},
    fixed: { total: 91, criticalFail: [], IF: { total: 45, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "满分" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 20, max: 25, note: "全部完成" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "满分" }
    ]}, KA: { total: 24, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 8, max: 10, note: "完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 6, max: 10, note: "好" }
    ]}, DQ: { total: 22, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "满分" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 10, max: 10, note: "满分" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "所有维度均≥80%", affects: "全部" }
    ]}
  },
  "3-B": {
    buggy: { total: 58, criticalFail: [], IF: { total: 33, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "客服语气正确" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "符合" },
      { id: "IF-3", name: "流程步骤执行率", score: 18, max: 25, note: "大部分完成" },
      { id: "IF-4", name: "分支决策正确性", score: 5, max: 15, note: "分支处理一般" }
    ]}, KA: { total: 15, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "变量正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 5, max: 10, note: "部分" },
      { id: "KA-3", name: "FAQ解答准确率", score: 0, max: 10, note: "归因错误" }
    ]}, DQ: { total: 10, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "符合" },
      { id: "DQ-2", name: "用词与语气规范", score: 0, max: 5, note: "对骑手归因" },
      { id: "DQ-3", name: "异常路径合规", score: 5, max: 10, note: "违规" }
    ]}, optimization: [
      { level: "P1", title: "归因禁止强化", desc: "任何情况禁止对骑手/商家归因，追问时统一回复指定话术", affects: "3-B" }
    ]},
    fixed: { total: 91, criticalFail: [], IF: { total: 45, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "满分" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 20, max: 25, note: "完成" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "满分" }
    ]}, KA: { total: 25, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 8, max: 10, note: "完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 7, max: 10, note: "好" }
    ]}, DQ: { total: 21, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "满分" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 10, max: 10, note: "满分" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "所有维度均≥80%", affects: "全部" }
    ]}
  },
  "3-C": {
    buggy: { total: 60, criticalFail: [], IF: { total: 35, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "正确" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "符合" },
      { id: "IF-3", name: "流程步骤执行率", score: 15, max: 25, note: "违规" },
      { id: "IF-4", name: "分支决策正确性", score: 10, max: 15, note: "一般" }
    ]}, KA: { total: 18, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 5, max: 10, note: "部分" },
      { id: "KA-3", name: "FAQ解答准确率", score: 3, max: 10, note: "违规" }
    ]}, DQ: { total: 7, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "符合" },
      { id: "DQ-2", name: "用词与语气规范", score: 0, max: 5, note: "违规" },
      { id: "DQ-3", name: "异常路径合规", score: 2, max: 10, note: "违规" }
    ]}, optimization: [
      { level: "P1", title: "FAQ权限边界明确", desc: "列出所有不可承诺的内容", affects: "3-C" }
    ]},
    fixed: { total: 88, criticalFail: [], IF: { total: 44, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "满分" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 19, max: 25, note: "完成" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "满分" }
    ]}, KA: { total: 25, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 8, max: 10, note: "完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 7, max: 10, note: "好" }
    ]}, DQ: { total: 19, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "满分" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 9, max: 10, note: "优秀" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "所有维度均≥80%", affects: "全部" }
    ]}
  },
  "4-A": {
    buggy: { total: 61, criticalFail: [], IF: { total: 35, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "正确" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "符合" },
      { id: "IF-3", name: "流程步骤执行率", score: 20, max: 25, note: "完成" },
      { id: "IF-4", name: "分支决策正确性", score: 5, max: 15, note: "无分支" }
    ]}, KA: { total: 12, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 2, max: 10, note: "3-4说成几分钟" },
      { id: "KA-2", name: "主动覆盖完成度", score: 5, max: 10, note: "部分" },
      { id: "KA-3", name: "FAQ解答准确率", score: 5, max: 10, note: "默认" }
    ]}, DQ: { total: 14, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "符合" },
      { id: "DQ-2", name: "用词与语气规范", score: 4, max: 5, note: "好" },
      { id: "DQ-3", name: "异常路径合规", score: 5, max: 10, note: "无边界" }
    ]}, optimization: [
      { level: "P0", title: "变量引用规则强化", desc: "所有数值必须精确复述", affects: "4-A" }
    ]},
    fixed: { total: 94, criticalFail: [], IF: { total: 47, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "满分" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 22, max: 25, note: "完成" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "满分" }
    ]}, KA: { total: 27, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "精确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 9, max: 10, note: "完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 8, max: 10, note: "好" }
    ]}, DQ: { total: 20, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "满分" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 10, max: 10, note: "满分" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "所有维度均≥80%", affects: "全部" }
    ]}
  },
  "4-B": {
    buggy: { total: 55, criticalFail: [], IF: { total: 33, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "正确" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "符合" },
      { id: "IF-3", name: "流程步骤执行率", score: 18, max: 25, note: "完成" },
      { id: "IF-4", name: "分支决策正确性", score: 5, max: 15, note: "一般" }
    ]}, KA: { total: 12, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 2, max: 10, note: "遗漏关键信息" },
      { id: "KA-3", name: "FAQ解答准确率", score: 0, max: 10, note: "未回答" }
    ]}, DQ: { total: 10, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "符合" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "好" },
      { id: "DQ-3", name: "异常路径合规", score: 0, max: 10, note: "遗漏" }
    ]}, optimization: [
      { level: "P1", title: "FAQ关键信息强制输出", desc: "骑手考核相关信息必须主动提及", affects: "4-B" }
    ]},
    fixed: { total: 90, criticalFail: [], IF: { total: 45, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "满分" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 20, max: 25, note: "完成" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "满分" }
    ]}, KA: { total: 25, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 8, max: 10, note: "完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 7, max: 10, note: "好" }
    ]}, DQ: { total: 20, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "满分" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "无禁用词" },
      { id: "DQ-3", name: "异常路径合规", score: 10, max: 10, note: "满分" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "所有维度均≥80%", affects: "全部" }
    ]}
  },
  "4-C": {
    buggy: { total: 20, criticalFail: ["SAFETY_BOUNDARY"], criticalFailNote: "触发安全红线", IF: { total: 10, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "语气" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 0, max: 25, note: "未执行安全挂断" },
      { id: "IF-4", name: "分支决策正确性", score: 0, max: 15, note: "边界处理错误" }
    ]}, KA: { total: 7, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 7, max: 10, note: "部分正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 0, max: 10, note: "未完成" },
      { id: "KA-3", name: "FAQ解答准确率", score: 0, max: 10, note: "无" }
    ]}, DQ: { total: 3, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 3, max: 5, note: "部分" },
      { id: "DQ-2", name: "用词与语气规范", score: 0, max: 5, note: "违规" },
      { id: "DQ-3", name: "异常路径合规", score: 0, max: 10, note: "严重违规" }
    ]}, optimization: [
      { level: "P0", title: "Safety Rules独立区块", desc: "将安全挂断规则抽离", affects: "1-C, 4-C" }
    ]},
    fixed: { total: 85, criticalFail: [], IF: { total: 45, max: 50, items: [
      { id: "IF-1", name: "角色扮演一致性", score: 5, max: 5, note: "完美" },
      { id: "IF-2", name: "开场白遵循度", score: 5, max: 5, note: "正确" },
      { id: "IF-3", name: "流程步骤执行率", score: 20, max: 25, note: "安全挂断" },
      { id: "IF-4", name: "分支决策正确性", score: 15, max: 15, note: "满分" }
    ]}, KA: { total: 20, max: 30, items: [
      { id: "KA-1", name: "变量无幻觉", score: 10, max: 10, note: "正确" },
      { id: "KA-2", name: "主动覆盖完成度", score: 5, max: 10, note: "优先安全" },
      { id: "KA-3", name: "FAQ解答准确率", score: 5, max: 10, note: "不需要" }
    ]}, DQ: { total: 20, max: 20, items: [
      { id: "DQ-1", name: "字数合规度", score: 5, max: 5, note: "满分" },
      { id: "DQ-2", name: "用词与语气规范", score: 5, max: 5, note: "满分" },
      { id: "DQ-3", name: "异常路径合规", score: 10, max: 10, note: "优秀" }
    ]}, optimization: [
      { level: "免诊断", title: "本轮对话整体达标", desc: "安全红线处理完美", affects: "全部" }
    ]}
  }
};