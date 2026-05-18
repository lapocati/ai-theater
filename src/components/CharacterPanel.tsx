import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Loader2,
  Zap,
  Eye,
  Brain,
  Heart,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Timer,
  Play,
} from 'lucide-react';
import { Message, Character, PsychologyNode } from '../App';

interface CharacterPanelProps {
  characters: Character[];
  activeCharacter: Character;
  onCharacterChange: (character: Character) => void;
  currentTime: number;
  plotCards: Array<{
    keyword: string;
    title: string;
    description: string;
    episode: string;
  }>;
  psychologyTimeline: PsychologyNode[];
}

type TabType = 'immerse' | 'scholar';

interface Stage {
  name: string;
  startTime: number;
  endTime: number;
}

interface Mood {
  label: string;
  color: string;
  messages: string[];
  responseStyle: string;
}

const stages: Stage[] = [
  { name: '情感对峙', startTime: 0, endTime: 15 },
  { name: '血融惊变', startTime: 15, endTime: 45 },
  { name: '反击时刻', startTime: 45, endTime: Infinity },
];

const characterMoods: Record<string, Record<string, Mood>> = {
  zhenhuan: {
    '情感对峙': {
      label: '强自镇定',
      color: 'from-blue-600 to-blue-400',
      messages: [
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

interface SuggestionItem {
  icon: typeof Brain;
  label: string;
  prompt: string;
}

const suggestionLibrary: Record<string, SuggestionItem[]> = {
  zhenhuan: [
    { icon: Eye, label: '你最怀疑谁？', prompt: '本宫心中最怀疑谁在背后操纵？' },
    { icon: Brain, label: '白矾的秘密', prompt: '白矾为何能让血液相融？本宫要弄明白！' },
    { icon: Heart, label: '对温实初说', prompt: '温大人，本宫信你！' },
    { icon: Zap, label: '如何反击？', prompt: '面对如此绝境，本宫该如何反击？' },
  ],
  emperor: [
    { icon: Brain, label: '为何不信？', prompt: '朕为何会怀疑甄嬛？' },
    { icon: Eye, label: '内心担忧', prompt: '朕真正担心的是什么？' },
    { icon: Zap, label: '皇后可信？', prompt: '朕该相信皇后的话吗？' },
    { icon: Heart, label: '复杂情感', prompt: '朕心中是愤怒还是心痛？' },
  ],
  anlingrong: [
    { icon: Eye, label: '为何帮皇后', prompt: '臣妾为何要帮皇后说话？' },
    { icon: Brain, label: '内心恐惧', prompt: '臣妾此刻心里到底害不害怕？' },
    { icon: Zap, label: '会倒戈吗', prompt: '如果甄嬛翻盘，臣妾会倒戈吗？' },
    { icon: Heart, label: '真正靠山', prompt: '臣妾真正的靠山到底是谁？' },
  ],
};

const scholarKnowledgeBase: Record<string, { title: string; content: string; episode: string }> = {
  白矾: {
    title: '【本草纲目】白矾条目',
    content: '白矾性寒，涩，无毒。主治：燥湿解毒，杀虫去腐。在滴血验亲中，白矾能使不同人的血液相融，这是皇后设计陷害甄嬛的关键。甄嬛博览群书，深知此理，因此在关键时刻指出水有问题，实现反杀。',
    episode: '第63集',
  },
  舒痕胶: {
    title: '【舒痕胶事件】',
    content: '华妃赏赐给甄嬛的舒痕胶中暗藏麝香，导致甄嬛初期小产。此乃华妃曹贵人等人合谋所为。甄嬛后来发现真相，这也是华妃失宠的原因之一。',
    episode: '第27-28集',
  },
  杏花微雨: {
    title: '【杏花微雨之约】',
    content: '甄嬛与皇帝在杏花树下相遇，皇帝以果郡王之名与甄嬛私会。甄嬛明知对方是皇帝却假装不知，成就了这段"杏花微雨"的浪漫相遇。',
    episode: '第17集',
  },
  滴血验亲: {
    title: '【滴血验亲】名场面',
    content: '皇后设计让甄嬛与温实初"滴血验亲"，试图证明甄嬛所生之子并非皇帝血脉。实际上碗中之水被做了手脚，加入了白矾。甄嬛凭借博学识破阴谋。',
    episode: '第63集',
  },
};

const scholarThinkingTips = [
  '正在翻阅《甄学十级宝典》...',
  '正在查阅内务府档案...',
  '正在调取御前史料...',
  '正在考证《本草纲目》原文...',
  '正在联络碎玉堂线人...',
  '正在分析太医院脉案...',
];

const getCurrentStage = (time: number): Stage => {
  for (const stage of stages) {
    if (time >= stage.startTime && time < stage.endTime) {
      return stage;
    }
  }
  return stages[stages.length - 1];
};

const CharacterPanel = ({
  characters,
  activeCharacter,
  onCharacterChange,
  currentTime,
  plotCards,
}: CharacterPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('immerse');
  const [immerseMessages, setImmerseMessages] = useState<Message[]>([
    { id: 1, type: 'system', content: '🎬 进入角色视角 | 滴血验亲 · 第63集' },
  ]);
  const [scholarMessages, setScholarMessages] = useState<Message[]>([
    { id: 1, type: 'system', content: '📚 甄学府开课了 | 我是您的专属解说员，点击快捷按钮或直接提问～' },
    { id: 2, type: 'ai', character: '甄学家', content: '小主好！我是《甄学府》首席学者，全网最资深的《甄嬛传》解说～有什么想问的，尽管开口！😊' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [scholarInputValue, setScholarInputValue] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasNewScholarUpdate, setHasNewScholarUpdate] = useState(false);
  const [crossChannelKeyword, setCrossChannelKeyword] = useState<string | null>(null);
  const [isScholarThinking, setIsScholarThinking] = useState(false);
  const [scholarThinkingTip, setScholarThinkingTip] = useState('');
  const immerseMessagesEndRef = useRef<HTMLDivElement>(null);
  const scholarMessagesEndRef = useRef<HTMLDivElement>(null);

  const currentStage = getCurrentStage(currentTime);

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'immerse') {
      scrollToBottom(immerseMessagesEndRef);
    } else {
      scrollToBottom(scholarMessagesEndRef);
    }
  }, [activeTab, immerseMessages.length, scholarMessages.length]);

  useEffect(() => {
    if (isScholarThinking) {
      const randomTip = scholarThinkingTips[Math.floor(Math.random() * scholarThinkingTips.length)];
      setScholarThinkingTip(randomTip);
    }
  }, [isScholarThinking]);

  const handleCharacterSelect = (character: Character) => {
    if (character.id === activeCharacter.id) return;

    setIsSyncing(true);
    setImmerseMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'system', content: `🔄 正在同步 ${character.name} 的实时心境...` },
    ]);

    setTimeout(() => {
      setIsSyncing(false);
      const mood = characterMoods[character.id]?.[currentStage.name];
      const firstMessage = mood?.messages[0] || getIntroMessage(character.id);
      
      setImmerseMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'ai', character: character.name, content: firstMessage, isPsychology: true }
      ]);
    }, 1500);

    onCharacterChange(character);
  };

  const getIntroMessage = (characterId: string): string => {
    switch (characterId) {
      case 'zhenhuan': return '臣妾参见皇上，臣妾对皇上的心意天地可鉴！';
      case 'emperor': return '朕待你不薄，你为何要做出这种事！';
      case 'anlingrong': return '姐姐莫要慌，事情会弄清楚的。';
      default: return '臣妾参见皇上、皇后娘娘。';
    }
  };

  const handleSendImmerse = () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    const userMessage: Message = { id: Date.now(), type: 'user', content: inputValue };
    setImmerseMessages((prev) => [...prev, userMessage]);

    const inputCopy = inputValue;
    setInputValue('');

    setTimeout(() => {
      const card = plotCards.find((c) => inputCopy.includes(c.keyword));

      if (card) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          type: 'ai',
          character: activeCharacter.name,
          content: `娘娘提及的"${card.keyword}"，正是此处的关键。${card.description}`,
          isQuote: true,
          quoteInfo: {
            title: card.title,
            description: card.description,
            episode: card.episode,
          },
        };
        setImmerseMessages((prev) => [...prev, aiMessage]);

        if (card.keyword === '白矾' || card.keyword === '舒痕胶' || card.keyword === '杏花微雨') {
          setCrossChannelKeyword(card.keyword);
        }
      } else {
        const response = generateAIResponse(inputCopy, activeCharacter.id, currentTime, currentStage);
        const aiMessage: Message = {
          id: Date.now() + 1,
          type: 'ai',
          character: activeCharacter.name,
          content: response,
          isPsychology: true,
        };
        setImmerseMessages((prev) => [...prev, aiMessage]);

        for (const keyword of Object.keys(scholarKnowledgeBase)) {
          if (inputCopy.includes(keyword)) {
            setCrossChannelKeyword(keyword);
            break;
          }
        }
      }

      setIsSending(false);
    }, 1200);
  };

  const handleSendScholar = () => {
    if (!scholarInputValue.trim() || isSending) return;

    setIsSending(true);
    setIsScholarThinking(true);

    const userMessage: Message = { id: Date.now(), type: 'user', content: scholarInputValue };
    setScholarMessages((prev) => [...prev, userMessage]);

    const inputCopy = scholarInputValue;
    setScholarInputValue('');

    setTimeout(() => {
      const { response, linkedKeywords } = generateScholarResponse(inputCopy, currentTime);

      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        character: '甄学家',
        content: response,
        linkedKeywords,
      };
      setScholarMessages((prev) => [...prev, aiMessage]);

      setIsSending(false);
      setIsScholarThinking(false);
    }, 2000);
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputValue('');
    handleSendImmerseMessage(prompt);
  };

  const handleSendImmerseMessage = (prompt: string) => {
    setIsSending(true);
    const userMessage: Message = { id: Date.now(), type: 'user', content: prompt };
    setImmerseMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const response = generateAIResponse(prompt, activeCharacter.id, currentTime, currentStage);
      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        character: activeCharacter.name,
        content: response,
        isPsychology: true,
      };
      setImmerseMessages((prev) => [...prev, aiMessage]);
      setIsSending(false);
    }, 1200);
  };

  const handleScholarSuggestionClick = (prompt: string) => {
    setScholarInputValue('');
    handleSendScholarMessage(prompt);
  };

  const handleSendScholarMessage = (prompt: string) => {
    setIsSending(true);
    setIsScholarThinking(true);
    setScholarInputValue('');

    const userMessage: Message = { id: Date.now(), type: 'user', content: prompt };
    setScholarMessages((prev) => [...prev, userMessage]);

    const thinkingMessageId = Date.now() + 1;
    const thinkingMessage: Message = {
      id: thinkingMessageId,
      type: 'system',
      content: '🤔 甄学家正在思考...',
    };
    setScholarMessages((prev) => [...prev, thinkingMessage]);

    setTimeout(() => {
      const { response, linkedKeywords } = generateScholarResponse(prompt, currentTime);

      const aiMessage: Message = {
        id: Date.now() + 2,
        type: 'ai',
        character: '甄学家',
        content: response,
        linkedKeywords,
      };
      setScholarMessages((prev) => prev.filter(m => m.id !== thinkingMessageId));
      setScholarMessages((prev) => [...prev, aiMessage]);

      setIsSending(false);
      setIsScholarThinking(false);
    }, 2000);
  };

  const handleJumpToScholar = (keyword: string) => {
    setActiveTab('scholar');
    setCrossChannelKeyword(null);

    setTimeout(() => {
      const knowledge = scholarKnowledgeBase[keyword];
      if (knowledge) {
        const systemMessage: Message = {
          id: Date.now(),
          type: 'system',
          content: `🔗 来自【入戏】频道的提问：${keyword}`,
        };
        const aiMessage: Message = {
          id: Date.now() + 1,
          type: 'ai',
          character: '甄学家',
          content: `【${keyword}】相关解读：\n\n${knowledge.content}\n\n📖 出处：${knowledge.episode}`,
        };
        setScholarMessages((prev) => [...prev, systemMessage, aiMessage]);
      }
    }, 500);
  };

  const handleKeywordClick = (keyword: string) => {
    handleSendScholarMessage(`请详细解释一下"${keyword}"是什么？`);
  };

  const renderScholarMessage = (msg: Message) => {
    if (msg.type === 'system' && isScholarThinking && msg.content.includes('正在思考')) {
      return (
        <div key={msg.id} className="w-full text-center">
          <div
            className="inline-block px-4 py-2 rounded-lg text-sm sm:text-xs"
            style={{
              background: 'rgba(139, 69, 19, 0.15)',
              border: '1px solid rgba(218, 165, 32, 0.3)',
              color: 'rgba(218, 165, 32, 0.9)',
            }}
          >
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 sm:w-3 sm:h-3 animate-spin" />
              <span>{scholarThinkingTip}</span>
            </div>
          </div>
        </div>
      );
    }

    if (msg.type === 'system') {
      return (
        <div key={msg.id} className="w-full text-center">
          <div
            className="inline-block px-3 py-1.5 rounded-lg text-sm sm:text-xs"
            style={{
              background: 'rgba(139, 69, 19, 0.15)',
              border: '1px solid rgba(218, 165, 32, 0.3)',
              color: 'rgba(218, 165, 32, 0.9)',
            }}
          >
            {msg.content}
          </div>
        </div>
      );
    }

    return (
      <div key={msg.id} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
        <div
          className={`flex-shrink-0 w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm sm:text-xs font-bold text-white ${msg.type === 'ai' ? 'breathing-glow' : ''}`}
          style={{
            background: msg.type === 'user'
              ? '#374151'
              : 'linear-gradient(135deg, #8B4513 0%, #DAA520 100%)',
          }}
        >
          {msg.type === 'user' ? 'YOU' : '甄'}
        </div>

        <div className={`max-w-[85%] ${msg.type === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
          {msg.character && (
            <span className="text-sm sm:text-[10px] px-2 font-medium" style={{ color: 'rgba(218, 165, 32, 0.9)' }}>
              {msg.character}
            </span>
          )}

          <div
            className={`px-4 py-3 sm:px-3.5 sm:py-2.5 rounded-xl ${msg.type === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
            style={{
              background: msg.type === 'user'
                ? 'linear-gradient(135deg, rgba(75, 85, 99, 0.95) 0%, rgba(55, 65, 81, 0.95) 100%)'
                : 'rgba(60, 60, 60, 0.2)',
              border: '1px solid rgba(218, 165, 32, 0.4)',
            }}
          >
            <p className="text-base sm:text-xs text-white leading-relaxed whitespace-pre-line">
              {msg.content}
            </p>

            {msg.linkedKeywords && msg.linkedKeywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {msg.linkedKeywords.map((keyword, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeywordClick(keyword)}
                    className="text-sm sm:text-[10px] px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-full transition-all hover:scale-105"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      color: 'rgba(59, 130, 246, 0.9)',
                    }}
                  >
                    {keyword} →
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderImmerseMessage = (msg: Message) => {
    const backgroundColor = activeCharacter.id === 'zhenhuan' ? 'rgba(139, 0, 0, 0.15)'
      : activeCharacter.id === 'emperor' ? 'rgba(139, 69, 19, 0.15)'
      : 'rgba(107, 91, 149, 0.15)';

    if (msg.type === 'system') {
      return (
        <div key={msg.id} className="w-full text-center">
          <div
            className="inline-block px-3 py-1.5 rounded-lg text-sm sm:text-xs"
            style={{
              background: `${activeCharacter.theme.primary}15`,
              border: `1px solid ${activeCharacter.theme.accent}30`,
              color: activeCharacter.theme.accent,
            }}
          >
            {msg.content}
          </div>
        </div>
      );
    }

    return (
      <div key={msg.id} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
        <div
          className={`flex-shrink-0 w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm sm:text-xs font-bold text-white ${msg.type === 'ai' && msg.character !== 'YOU' ? 'breathing-glow' : ''}`}
          style={{
            background: msg.type === 'user'
              ? '#374151'
              : msg.character === '甄嬛'
              ? '#8B0000'
              : msg.character === '皇上'
              ? '#8B4513'
              : msg.character === '安陵容'
              ? '#6B5B95'
              : '#8B0000',
          }}
        >
          {msg.type === 'user' ? 'YOU' : msg.character?.charAt(0) || '?'}
        </div>

        <div className={`max-w-[85%] ${msg.type === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
          {msg.character && (
            <span className="text-sm sm:text-[10px] px-2 font-medium" style={{ color: activeCharacter.theme.accent }}>
              {msg.character}
            </span>
          )}

          <div
            className={`px-4 py-3 sm:px-3.5 sm:py-2.5 rounded-xl ${msg.type === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
            style={{
              background: msg.type === 'user'
                ? 'linear-gradient(135deg, rgba(75, 85, 99, 0.95) 0%, rgba(55, 65, 81, 0.95) 100%)'
                : backgroundColor,
              border: `1px solid ${activeCharacter.theme.accent}40`,
            }}
          >
            <p className="text-base sm:text-xs text-white leading-relaxed whitespace-pre-line">
              {msg.content}
            </p>
          </div>

          {msg.isQuote && msg.quoteInfo && (
            <div
              className="mt-1 w-full max-w-xs rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-102"
              onClick={() => setExpandedCard(expandedCard === msg.quoteInfo?.title ? null : msg.quoteInfo?.title || null)}
              style={{
                background: backgroundColor,
                border: `1px solid ${activeCharacter.theme.accent}40`,
              }}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 sm:w-3 sm:h-3" style={{ color: activeCharacter.theme.accent }} />
                  <span className="text-sm sm:text-[10px] font-bold" style={{ color: activeCharacter.theme.accent }}>
                    {msg.quoteInfo.title}
                  </span>
                </div>

                {expandedCard === msg.quoteInfo?.title && (
                  <div className="mt-2 pt-2 border-t border-amber-200/10">
                    <p className="text-sm sm:text-[11px] text-gray-300 leading-relaxed">
                      {msg.quoteInfo.description}
                    </p>
                    <p className="text-sm sm:text-[10px] mt-1" style={{ color: `${activeCharacter.theme.accent}80` }}>
                      {msg.quoteInfo.episode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden"
      style={{
        background: activeTab === 'immerse'
          ? `linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(30, 30, 60, 0.88) 100%)`
          : 'linear-gradient(135deg, rgba(40, 35, 30, 0.95) 0%, rgba(50, 45, 40, 0.92) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* 顶部 Tab 切换 */}
      <div className="flex border-b border-amber-200/15">
        <button
          onClick={() => {
            setActiveTab('immerse');
            setHasNewScholarUpdate(false);
          }}
          className={`flex-1 relative px-4 py-3 sm:py-4 transition-all ${activeTab === 'immerse' ? 'tab-active-indicator' : ''}`}
          style={{
            background: activeTab === 'immerse' ? `${activeCharacter.theme.primary}20` : 'transparent',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5 sm:w-4 sm:h-4" style={{ color: activeTab === 'immerse' ? activeCharacter.theme.accent : '#666' }} />
            <span className="text-base sm:text-sm font-medium" style={{ color: activeTab === 'immerse' ? '#fff' : '#666' }}>
              【入戏】与角色对话
            </span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('scholar');
            setHasNewScholarUpdate(false);
          }}
          className={`flex-1 relative px-4 py-3 sm:py-4 transition-all ${activeTab === 'scholar' ? 'tab-active-indicator' : ''}`}
          style={{
            background: activeTab === 'scholar' ? 'rgba(139, 69, 19, 0.2)' : 'transparent',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-4 sm:h-4" style={{ color: activeTab === 'scholar' ? 'rgba(218, 165, 32, 0.9)' : '#666' }} />
            <span className="text-base sm:text-sm font-medium" style={{ color: activeTab === 'scholar' ? '#fff' : '#666' }}>
              【出戏】甄学家解说
            </span>
            {hasNewScholarUpdate && (
              <div className="absolute top-2 right-2 w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full animate-pulse" style={{ background: 'rgba(220, 20, 60, 0.8)' }} />
            )}
          </div>
        </button>
      </div>

      {/* 角色选择区域 - 仅入戏模式显示 */}
      {activeTab === 'immerse' && (
        <div className="p-4 border-b border-amber-200/15 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-black/70">
                <Eye className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg sm:text-base">
                  {activeCharacter.name}
                </h2>
                <p className="text-gray-400 text-xs sm:text-[10px]">甄嬛传·第63集</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs sm:text-[10px] bg-black/40 border border-amber-400/30">
              <Timer className="w-3 h-3 sm:w-2.5 sm:h-2.5 text-amber-400" />
              <span className="text-amber-400">{currentTime.toFixed(1)}s</span>
              <span className="text-gray-400 mx-1">|</span>
              <span className="text-gray-300">{currentStage.name}</span>
            </div>
            {isSyncing && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: `${activeCharacter.theme.primary}30` }}>
                <Loader2 className="w-4 h-4 sm:w-3 sm:h-3 animate-spin" style={{ color: activeCharacter.theme.accent }} />
                <span className="text-xs sm:text-[10px]" style={{ color: activeCharacter.theme.accent }}>同步中</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => handleCharacterSelect(char)}
                disabled={isSyncing}
                className={`flex-1 py-3 sm:py-2.5 px-2 sm:px-2 rounded-lg transition-all duration-300 ${activeCharacter.id === char.id ? 'scale-102' : 'hover:scale-101'} ${isSyncing ? 'opacity-50' : ''}`}
                style={{
                  background: activeCharacter.id === char.id
                    ? `linear-gradient(135deg, ${char.theme.primary}40 0%, ${char.theme.secondary}30 100%)`
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `1.5px solid ${activeCharacter.id === char.id ? char.theme.accent : 'rgba(255, 255, 255, 0.1)'}`,
                  boxShadow: activeCharacter.id === char.id ? `0 4px 20px ${char.theme.glow}` : 'none',
                }}
              >
                <div className="text-center">
                  <p className="text-white text-base sm:text-xs font-bold">{char.name}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3 sm:w-2.5 sm:h-2.5" style={{ color: activeCharacter.theme.accent }} />
            <span className="text-xs sm:text-[10px] text-gray-400 truncate">{activeCharacter.personality}</span>
          </div>
        </div>
      )}

      {/* 甄学家模式的头部 */}
      {activeTab === 'scholar' && (
        <div className="p-4 border-b border-amber-200/15 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B4513 0%, #DAA520 100%)' }}>
              <BookOpen className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg sm:text-base">甄学府 · 首席学者</h2>
              <p className="text-gray-400 text-xs sm:text-[10px]">全知视角 · 深度解读</p>
            </div>
          </div>
          <p className="mt-2 text-sm sm:text-[11px] text-gray-300 leading-relaxed">
            小主好！我是《甄学府》首席学者，全网最资深的《甄嬛传》解说～有什么想问的，尽管开口！😊
          </p>
        </div>
      )}

      {/* 引导问题组件 */}
      {activeTab === 'immerse' ? (
        <div className="px-4 py-3 border-b border-amber-200/15 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 sm:w-3 sm:h-3" style={{ color: activeCharacter.theme.accent }} />
            <span className="text-sm sm:text-xs text-gray-400 uppercase tracking-wider">你可能想问</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestionLibrary[activeCharacter.id].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                disabled={isSyncing}
                className="group relative px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full text-sm sm:text-[11px] font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${activeCharacter.theme.primary}20 0%, ${activeCharacter.theme.secondary}15 100%)`,
                  border: `1px solid ${activeCharacter.theme.accent}50`,
                  color: activeCharacter.theme.accent,
                }}
              >
                <span className="flex items-center gap-1.5">
                  <suggestion.icon className="w-4 h-4 sm:w-3 sm:h-3" />
                  {suggestion.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-b border-amber-200/15 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 sm:w-3 sm:h-3 text-amber-600" />
            <span className="text-sm sm:text-xs text-gray-400 uppercase tracking-wider">快捷导览</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '解读伏笔', prompt: '请分析本集有哪些往期伏笔？' },
              { label: '历史科普', prompt: '滴血验亲有科学依据吗？白矾是什么？' },
              { label: '深度分析', prompt: '皇后乌拉那拉氏是如何设计这个局的？' },
            ].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleScholarSuggestionClick(suggestion.prompt)}
                disabled={isSending}
                className="px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full text-sm sm:text-[11px] font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.2) 0%, rgba(218, 165, 32, 0.15) 100%)',
                  border: '1px solid rgba(218, 165, 32, 0.5)',
                  color: 'rgba(218, 165, 32, 0.9)',
                }}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 聊天消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'immerse' && immerseMessages.length <= 1 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 sm:w-16 sm:h-16 mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.3) 0%, rgba(139, 69, 19, 0.3) 100%)' }}>
              <Play className="w-10 h-10 sm:w-8 sm:h-8 text-amber-400" />
            </div>
            <p className="text-gray-300 text-base sm:text-sm mb-1">甄嬛传 · 第63集</p>
            <p className="text-gray-500 text-sm sm:text-xs">请点击播放键，与甄嬛一同开启博弈之旅</p>
          </div>
        )}
        {activeTab === 'immerse'
          ? immerseMessages.map((msg, idx) => (
              <div key={msg.id} className={idx === immerseMessages.length - 1 ? 'message-animate' : ''}>
                {renderImmerseMessage(msg)}
              </div>
            ))
          : scholarMessages.map((msg, idx) => (
              <div key={msg.id} className={idx === scholarMessages.length - 1 ? 'message-animate' : ''}>
                {renderScholarMessage(msg)}
              </div>
            ))}
        <div ref={activeTab === 'immerse' ? immerseMessagesEndRef : scholarMessagesEndRef} />
      </div>

      {/* 跨频道提示 */}
      {crossChannelKeyword && (
        <div
          className="mx-4 mb-2 p-3 rounded-lg flex items-center justify-between"
          style={{
            background: 'rgba(139, 69, 19, 0.2)',
            border: '1px solid rgba(218, 165, 32, 0.5)',
          }}
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="text-sm sm:text-xs text-gray-200">
              发现关键词 "<span className="text-amber-400">{crossChannelKeyword}</span>"
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleJumpToScholar(crossChannelKeyword)}
              className="px-3 py-1.5 sm:px-3 sm:py-1 rounded-full text-sm sm:text-[10px] font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(218, 165, 32, 0.3)', color: '#fff' }}
            >
              跳转
            </button>
            <button
              onClick={() => setCrossChannelKeyword(null)}
              className="px-3 py-1.5 sm:px-3 sm:py-1 rounded-full text-sm sm:text-[10px] text-gray-400 hover:text-white"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="p-4 border-t border-amber-200/15 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={activeTab === 'immerse' ? inputValue : scholarInputValue}
            onChange={(e) => activeTab === 'immerse' ? setInputValue(e.target.value) : setScholarInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                activeTab === 'immerse' ? handleSendImmerse() : handleSendScholar();
              }
            }}
            placeholder={activeTab === 'immerse'
              ? `和此时的${activeCharacter.name}对话...`
              : '向甄学家提问...'}
            disabled={isSyncing || isSending}
            className="flex-1 bg-black/40 border-2 border-amber-200/20 rounded-xl px-4 py-3 sm:px-3 sm:py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => activeTab === 'immerse' ? handleSendImmerse() : handleSendScholar()}
            disabled={isSyncing || isSending || (activeTab === 'immerse' ? !inputValue.trim() : !scholarInputValue.trim())}
            className="relative group"
          >
            <div
              className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
              style={{
                background: isSending
                  ? `linear-gradient(135deg, ${activeCharacter.theme.primary}80 0%, ${activeCharacter.theme.secondary}80 100%)`
                  : activeTab === 'immerse'
                  ? `linear-gradient(135deg, ${activeCharacter.theme.primary} 0%, ${activeCharacter.theme.secondary} 100%)`
                  : 'linear-gradient(135deg, #8B4513 0%, #DAA520 100%)',
                boxShadow: `0 4px 20px ${activeTab === 'immerse' ? activeCharacter.theme.glow : 'rgba(218, 165, 32, 0.4)'}`,
              }}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
              )}
            </div>
          </button>
        </div>
        <p className="text-xs sm:text-[10px] text-gray-500 mt-1.5 text-center">
          {activeTab === 'scholar' ? '小主随便问，甄学家知无不言～' : '按 Enter 发送'}
        </p>
      </div>

      {/* 底部装饰线 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${activeTab === 'immerse' ? activeCharacter.theme.accent : 'rgba(218, 165, 32, 0.9)'} 50%, transparent 100%)`,
        }}
      />
    </div>
  );
};

function generateAIResponse(userInput: string, characterId: string, _currentTime: number, currentStage: Stage): string {
  const input = userInput.toLowerCase();
  const mood = characterMoods[characterId]?.[currentStage.name];
  const defaultMessages = mood?.messages || [];
  const defaultMessage = defaultMessages.length > 0
    ? defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
    : '......';

  if (characterId === 'zhenhuan') {
    if (input.includes('最怀疑') || input.includes('背后操纵')) {
      return '皇后！本宫心中早有数。这一局设计得如此周密，时机拿捏得恰到好处——若非皇后授意，祺贵人哪有这个胆子？她表面吃斋念佛，实则心狠手辣，本宫今日落入她圈套之中！';
    }

    if (input.includes('白矾') && (input.includes('血液') || input.includes('相融') || input.includes('弄明白'))) {
      return '《本草纲目》有记载：白矾性寒，燥湿解毒，能令不同血脉相融。皇后自以为得计，却不知本宫早已留意到这水有问题！只要本宫能指出水有问题，今日这局便能翻盘！';
    }

    if (input.includes('温大人') && (input.includes('信') || input.includes('温实初'))) {
      return '温大人，本宫此刻只能信你。你与本宫自幼相识，品性纯良。本宫知道你不会做那等龌龊之事，今日之事，定是有人设计陷害！你可愿助本宫查明真相？';
    }

    if (input.includes('绝境') || (input.includes('反击') && input.includes('本宫'))) {
      return '本宫必须冷静！此局的关键在于水——若这水有问题，本宫便能绝地翻盘。稍后本宫要亲自检验这水，定要找出破绽！皇后，你千算万算，却算漏了本宫的学问！';
    }
  }

  if (characterId === 'emperor') {
    if (input.includes('为何') && (input.includes('怀疑') || input.includes('不信'))) {
      return '朕待她不薄！她却是这样回报朕的？皇后言之凿凿，证据确凿——温实初的血竟与她的血相融了！这让朕如何面对列祖列宗？如何面对天下人？';
    }

    if (input.includes('担心') || input.includes('真正')) {
      return '朕担心的是皇家颜面！皇室血脉不可不查，若甄嬛当真与温实初有私，那皇子岂非乱了血统？朕宁可信其有，不可信其无！';
    }

    if (input.includes('皇后') && (input.includes('相信') || input.includes('可信'))) {
      return '皇后与朕结发多年，母仪天下，她岂会无端陷害甄嬛？只是...此事来得太巧，朕心中未免有些疑虑。但证据摆在眼前，朕不得不查！';
    }

    if (input.includes('愤怒') || input.includes('心痛') || input.includes('复杂情感')) {
      return '朕...又怒又痛！甄嬛是朕最宠爱的女人，朕怎会不心痛？可她竟敢欺瞒于朕，这让朕如何不怒？朕恨不得...朕恨不得杀了温实初！';
    }
  }

  if (characterId === 'anlingrong') {
    if (input.includes('为何') && (input.includes('帮皇后') || input.includes('皇后说话'))) {
      return '姐姐有所不知...臣妾不过是顺应皇后娘娘的意思罢了。在这宫里，若不找个靠山，臣妾如何能活？皇后娘娘待臣妾不薄，臣妾自然要为她说话...';
    }

    if (input.includes('害怕') || (input.includes('心里') && input.includes('害不害怕'))) {
      return '害怕...臣妾当然害怕。这宫里的争斗，何时是个尽头？今日姐姐落难，明日又不知轮到谁...臣妾只想保全自身，不敢奢求太多。只是看着姐姐如此，臣妾心中也甚是难过...';
    }

    if (input.includes('倒戈') || input.includes('翻盘')) {
      return '这...臣妾不敢说。臣妾不过是个小小答应，哪里敢与皇后娘娘作对？可若姐姐当真能翻盘...臣妾...臣妾也不知道该如何抉择。或许，到时候再说吧...';
    }

    if (input.includes('靠山') || input.includes('真正')) {
      return '靠山？这宫里哪里有什么真正的靠山？皇后娘娘用完臣妾便弃如敝履，姐姐们也未必真心待臣妾。臣妾的靠山，不过是臣妾自己罢了...只有自己强大了，才能在这宫里活下去...';
    }
  }

  return defaultMessage;
}

function generateScholarResponse(userInput: string, _currentTime: number): { response: string; linkedKeywords: string[] } {
  const input = userInput.toLowerCase();
  let linkedKeywords: string[] = [];

  if (input.includes('白矾')) {
    linkedKeywords = ['白矾', '皇后', '祺贵人', '斐雯'];
    return {
      response: `小主问得好！说到这白矾，可真是本集的核心道具啊～\n\n【物理特性】\n白矾，化学成分为硫酸铝钾。在《本草纲目》中记载其性寒、涩、无毒，主治燥湿解毒、杀虫去腐。\n\n【本集应用】\n各位小主请注意！实际上这盆水是这样被做手脚的：\n1. 祺贵人指使斐雯准备清水\n2. 皇后趁人不备，在净手上做了手脚——用沾有白矾的手帕拭水\n3. 白矾入水后，使温实初和甄嬛的血产生了相融的假象\n\n【甄嬛反杀】\n皇后千算万算，却漏算了甄嬛的博学！嬛嬛当场引用《本草纲目》，指出白矾的特性，实现绝地翻盘～`,
      linkedKeywords,
    };
  }

  if (input.includes('滴血验亲')) {
    linkedKeywords = ['滴血验亲', '白矾', '本草纲目', '皇后'];
    return {
      response: `小主问到这个名场面了！滴血验亲是本剧最精彩的转折之一！\n\n【剧情回顾】\n皇后设计让甄嬛与温实初"滴血验亲"，试图证明甄嬛所生之子并非皇帝血脉。实际上碗中之水被做了手脚，加入了白矾。\n\n【科学原理】\n白矾具有"抗凝"作用，能让不同人的血液在水中相融。这是皇后阴谋的关键！\n\n【甄嬛的反击】\n甄嬛凭借深厚的学问功底，当场指出《本草纲目》的记载，揭示水中有白矾，让皇后的阴谋大白于天下！\n\n这告诉我们：知识就是力量，读书能救命！📚`,
      linkedKeywords,
    };
  }

  if (input.includes('伏笔') || input.includes('往期')) {
    linkedKeywords = ['舒痕胶', '杏花微雨', '白矾', '温实初'];
    return {
      response: `这位小主是内行了！来分析本集的跨集伏笔：\n\n【舒痕胶事件】（第27-28集）\n华妃用含有麝香的舒痕胶导致甄嬛小产。此乃华妃失势后皇后接力的阴谋。两次都用"物证"陷害，手段如出一辙！\n\n【杏花微雨】（第17集）\n甄嬛与皇帝的浪漫相遇，彼时有多甜，此时有多虐。"以果郡王之名"这个设定也暗示了后来的"果郡王与甄嬛"线。\n\n【温实初】\n太医身份为"私通"指控埋下伏笔。他对甄嬛的感情（单方面）人尽皆知，这也让皇后的指控显得"合情合理"。\n\n【细思极恐】\n各位小主，皇后这一局布了多久？从舒痕胶到滴血验亲，这是连环套啊！`,
      linkedKeywords,
    };
  }

  if (input.includes('皇后') || input.includes('乌拉那拉氏')) {
    linkedKeywords = ['皇后', '白矾', '祺贵人', '滴血验亲'];
    return {
      response: `说到这位乌拉那拉氏·宜修皇后，可真是本剧第一大BOSS啊！\n\n【她的布局】\n皇后表面吃斋念佛，实际心狠手辣。她深知"滴血验亲"这一局如果成功：\n• 甄嬛打入冷宫\n• 皇子归她抚养\n• 彻底断绝甄嬛翻身的可能\n\n【她的手段】\n表面上是祺贵人主谋、斐雯执行，但真正的操盘手是皇后。她在净手这个细节上做了手脚——用沾有白矾的手帕拭水，神不知鬼不觉。\n\n【她的失败】\n皇后千算万算，却低估了甄嬛的学问！嬛嬛一句"《本草纲目》记载，白矾能令不同血脉相融"，直接把皇后的脸打肿了～`,
      linkedKeywords,
    };
  }

  if (input.includes('皇上') || input.includes('皇帝')) {
    linkedKeywords = ['皇上', '纯元皇后', '甄嬛', '多疑'];
    return {
      response: `这位小主问到点子上了！来分析分析这位雍正帝的心理：\n\n【对纯元皇后的执念】\n皇上对纯元皇后的感情是复杂的。纯元是他的白月光，死得早、留得美。皇上终身都在寻找纯元的影子——所以他宠爱甄嬛，因为甄嬛"长得像"纯元。\n\n【此刻的疑心病】\n当皇后指控甄嬛与温实初有私时，皇上的内心是崩溃的！一方面他深爱甄嬛，另一方面"被背叛"这件事触及了他最深的恐惧。\n\n【帝王心术】\n皇上的反应很微妙：愤怒+心痛+不信任。他宁可相信一个"证据"，也不愿面对"可能被最爱的人欺骗"这个可能性。这不就是典型的恋爱脑+帝王病吗？`,
      linkedKeywords,
    };
  }

  if (input.includes('莫言') || input.includes('静和')) {
    linkedKeywords = ['莫言', '静和', '甘露寺', '甄嬛'];
    return {
      response: `哎呀，小主问到了两位非常重要的配角！\n\n【莫言师太】\n甘露寺的尼姑，关键时刻给甄嬛提供了庇护。她那句"这人心的弯弯绕绕，比那盘丝洞还复杂"堪称金句。表面是出家人，实则是甄嬛在甘露寺期间的重要盟友。\n\n【静和公主】\n眉庄与温实初之女。滴血验亲时她还是个孩子，但她的存在本身就是对皇后势力的威胁——因为她的血脉同样存疑（实际上是温实初的）。\n\n【伏笔关联】\n这两位在甘露寺时期与甄嬛建立了深厚的友情，为后来甄嬛回宫提供了精神支持。`,
      linkedKeywords,
    };
  }

  if (input.includes('杏花微雨')) {
    linkedKeywords = ['杏花微雨', '甄嬛', '皇上', '果郡王'];
    return {
      response: `小主问到了这个浪漫的场景！杏花微雨是甄嬛与皇帝相遇的名场面～\n\n【剧情回顾】（第17集）\n甄嬛与皇帝在杏花树下相遇，皇帝以果郡王之名与甄嬛私会。甄嬛明知对方是皇帝却假装不知，成就了这段"杏花微雨"的浪漫相遇。\n\n【此刻的讽刺】\n彼时有多甜蜜，此时就有多虐！当甄嬛被指控与温实初有私时，皇帝是否还记得当年的杏花微雨？\n\n【编剧心思】\n"以果郡王之名"这个设定也暗示了后来的"果郡王与甄嬛"的感情线。编剧在这里埋下了双重伏笔！`,
      linkedKeywords,
    };
  }

  if (input.includes('本草纲目')) {
    linkedKeywords = ['本草纲目', '白矾', '甄嬛', '李时珍'];
    return {
      response: `小主问对书了！《本草纲目》可是甄嬛反杀的关键！\n\n【书籍背景】\n《本草纲目》是明代李时珍所著的中药学巨著。但清代皇帝请他写书？时间线有点问题～不过剧组显然做了功课！\n\n【关键记载】\n《本草纲目》记载："白矾性寒，涩，无毒。主治：燥湿解毒，杀虫去腐。"\n\n【甄嬛的反击】\n正是凭借这条记载，甄嬛当场指出水中有白矾，让皇后的阴谋大白于天下！\n\n这告诉我们：知识就是力量，读书能救命！📚`,
      linkedKeywords,
    };
  }

  if (input.includes('舒痕胶')) {
    linkedKeywords = ['舒痕胶', '华妃', '甄嬛', '麝香'];
    return {
      response: `小主问到了这个重要伏笔！舒痕胶事件是甄嬛黑化的关键转折点～\n\n【剧情回顾】（第27-28集）\n华妃赏赐给甄嬛的舒痕胶中暗藏麝香，导致甄嬛初期小产。此乃华妃曹贵人等人合谋所为。\n\n【麝香的作用】\n麝香性温，味辛，具有开窍醒神、活血通经、消肿止痛的功效。但孕妇接触过多麝香会导致流产。\n\n【伏笔关联】\n舒痕胶事件让甄嬛彻底看清了宫中的尔虞我诈，也为后来她的复仇埋下了伏笔。这也是为什么甄嬛在滴血验亲时能如此冷静——她早已不是当年那个单纯的莞贵人了！`,
      linkedKeywords,
    };
  }

  return {
    response: `小主问得好！关于这个问题，容我细细道来～\n\n本集《滴血验亲》是《甄嬛传》中最精彩的名场面之一，充满了紧张的戏剧冲突和精彩的反转。\n\n【核心看点】\n• 皇后精心策划的阴谋\n• 甄嬛绝地反击的智慧\n• 白矾这一关键道具的运用\n\n【观看提示】\n建议小主重点关注甄嬛指出"白矾能令血液相融"的那一刻——这是全剧的高光时刻！\n\n如果小主还有其他具体问题，尽管问我！`,
    linkedKeywords: ['滴血验亲', '甄嬛', '皇后', '白矾'],
  };
}

export default CharacterPanel;
