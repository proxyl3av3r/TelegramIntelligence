export interface Channel {
  id: string;
  name: string;
  username: string;
  avatar: string;
  subscribers: number;
  description: string;
  category: string;
  createdAt: string;
  activityLevel: 'high' | 'medium' | 'low';
  trustScore: number;
}

export interface Owner {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  otherChannels: string[];
  trustScore: number;
  verified: boolean;
}

export interface ChannelDossier {
  channel: Channel;
  owner: Owner;
  stats: {
    totalPosts: number;
    avgViews: number;
    engagementRate: number;
    growthRate: number;
  };
  contentAnalysis: {
    mainTopics: string[];
    politicalLeaning: string;
    reliabilityScore: number;
  };
  connections: {
    affiliatedChannels: string[];
    mentionedChannels: string[];
    crossPromotion: string[];
  };
  history: {
    date: string;
    event: string;
  }[];
}

export const channels: Channel[] = [
  {
    id: '1',
    name: 'Новости Технологий',
    username: '@technews_ru',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TN&backgroundColor=0ea5e9',
    subscribers: 1250000,
    description: 'Ежедневные обновления из мира технологий, гаджетов и инноваций.',
    category: 'Технологии',
    createdAt: '2019-03-15',
    activityLevel: 'high',
    trustScore: 85,
  },
  {
    id: '2',
    name: 'Политика Сегодня',
    username: '@politics_today',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PS&backgroundColor=dc2626',
    subscribers: 890000,
    description: 'Анализ политических событий и экспертные мнения.',
    category: 'Политика',
    createdAt: '2018-07-22',
    activityLevel: 'high',
    trustScore: 72,
  },
  {
    id: '3',
    name: 'Финансовый Инсайт',
    username: '@finance_insight',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FI&backgroundColor=16a34a',
    subscribers: 567000,
    description: 'Инвестиции, криптовалюты и финансовая грамотность.',
    category: 'Финансы',
    createdAt: '2020-01-10',
    activityLevel: 'medium',
    trustScore: 91,
  },
  {
    id: '4',
    name: 'Культурный Код',
    username: '@culture_code',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=KK&backgroundColor=9333ea',
    subscribers: 340000,
    description: 'Искусство, литература, кино и современная культура.',
    category: 'Культура',
    createdAt: '2021-05-08',
    activityLevel: 'medium',
    trustScore: 88,
  },
  {
    id: '5',
    name: 'Спорт 24/7',
    username: '@sports_247',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=S24&backgroundColor=f97316',
    subscribers: 2100000,
    description: 'Спортивные новости, трансферы и эксклюзивные интервью.',
    category: 'Спорт',
    createdAt: '2017-11-30',
    activityLevel: 'high',
    trustScore: 79,
  },
  {
    id: '6',
    name: 'Наука Просто',
    username: '@science_simple',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=NP&backgroundColor=06b6d4',
    subscribers: 780000,
    description: 'Научные открытия и объяснения сложных phenomena простым языком.',
    category: 'Наука',
    createdAt: '2020-09-14',
    activityLevel: 'medium',
    trustScore: 94,
  },
];

export const owners: Record<string, Owner> = {
  '1': {
    id: '1',
    name: 'Александр Петров',
    username: '@alexp_tech',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4',
    bio: 'Технологический предприниматель и журналист. Основатель нескольких IT-стартапов.',
    location: 'Москва, Россия',
    otherChannels: ['@startup_digest', '@ai_weekly'],
    trustScore: 87,
    verified: true,
  },
  '2': {
    id: '2',
    name: 'Елена Смирнова',
    username: '@elena_politics',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&backgroundColor=ffdfbf',
    bio: 'Политический аналитик с 15-летним опытом. Экс-советник в Государственной Думе.',
    location: 'Санкт-Петербург, Россия',
    otherChannels: ['@policy_deep_dive'],
    trustScore: 75,
    verified: true,
  },
  '3': {
    id: '3',
    name: 'Дмитрий Волков',
    username: '@dmitry_finance',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry&backgroundColor=c0aede',
    bio: 'Финансовый консультант, CFA. Специализация: фондовый рынок и криптовалюты.',
    location: 'Дубай, ОАЭ',
    otherChannels: ['@crypto_daily', '@investment_tips'],
    trustScore: 93,
    verified: true,
  },
  '4': {
    id: '4',
    name: 'Мария Козлова',
    username: '@maria_culture',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=ffd5dc',
    bio: 'Искусствовед, куратор выставок. Бывший редактор культурного отдела major издания.',
    location: 'Москва, Россия',
    otherChannels: [],
    trustScore: 89,
    verified: false,
  },
  '5': {
    id: '5',
    name: 'Игорь Соколов',
    username: '@igor_sports',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Igor&backgroundColor=d1f4e0',
    bio: 'Спортивный журналист, бывший комментатор на федеральном канале.',
    location: 'Казань, Россия',
    otherChannels: ['@football_insider', '@hockey_news'],
    trustScore: 81,
    verified: true,
  },
  '6': {
    id: '6',
    name: 'Анна Новикова',
    username: '@anna_science',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna&backgroundColor=ffdfbf',
    bio: 'Кандидат физико-математических наук. Научный популяризатор.',
    location: 'Новосибирск, Россия',
    otherChannels: ['@physics_fun'],
    trustScore: 96,
    verified: true,
  },
};

export const dossiers: Record<string, ChannelDossier> = {
  '1': {
    channel: channels[0],
    owner: owners['1'],
    stats: {
      totalPosts: 4520,
      avgViews: 980000,
      engagementRate: 4.2,
      growthRate: 12.5,
    },
    contentAnalysis: {
      mainTopics: ['Технологии', 'Гаджеты', 'AI', 'Стартапы'],
      politicalLeaning: 'Нейтральный',
      reliabilityScore: 85,
    },
    connections: {
      affiliatedChannels: ['@startup_digest', '@ai_weekly'],
      mentionedChannels: ['@techcrunch_ru', '@vc_ru'],
      crossPromotion: ['@gadget_reviews'],
    },
    history: [
      { date: '2019-03-15', event: 'Создание канала' },
      { date: '2020-06-20', event: 'Первые 100K подписчиков' },
      { date: '2021-12-10', event: 'Партнерство с major tech компанией' },
      { date: '2023-08-05', event: 'Достигнут 1M подписчиков' },
    ],
  },
  '2': {
    channel: channels[1],
    owner: owners['2'],
    stats: {
      totalPosts: 3890,
      avgViews: 650000,
      engagementRate: 6.8,
      growthRate: 8.3,
    },
    contentAnalysis: {
      mainTopics: ['Политика', 'Выборы', 'Государство', 'Оппозиция'],
      politicalLeaning: 'Центристский',
      reliabilityScore: 72,
    },
    connections: {
      affiliatedChannels: ['@policy_deep_dive'],
      mentionedChannels: ['@politics_weekly', '@election_watch'],
      crossPromotion: ['@news_analytics'],
    },
    history: [
      { date: '2018-07-22', event: 'Создание канала' },
      { date: '2019-11-15', event: 'Освещение президентских выборов' },
      { date: '2022-02-24', event: 'Резкий рост аудитории' },
      { date: '2023-09-30', event: 'Интервью с государственным деятелем' },
    ],
  },
  '3': {
    channel: channels[2],
    owner: owners['3'],
    stats: {
      totalPosts: 2150,
      avgViews: 420000,
      engagementRate: 5.5,
      growthRate: 18.7,
    },
    contentAnalysis: {
      mainTopics: ['Инвестиции', 'Криптовалюта', 'Фондовый рынок', 'Личные финансы'],
      politicalLeaning: 'Нейтральный',
      reliabilityScore: 91,
    },
    connections: {
      affiliatedChannels: ['@crypto_daily', '@investment_tips'],
      mentionedChannels: ['@trading_pro', '@forex_news'],
      crossPromotion: ['@wealth_builder'],
    },
    history: [
      { date: '2020-01-10', event: 'Создание канала' },
      { date: '2021-04-15', event: 'Предсказание bull run крипты' },
      { date: '2022-11-08', event: 'FTX коллапс анализ' },
      { date: '2024-01-20', event: 'Запуск платного сообщества' },
    ],
  },
  '4': {
    channel: channels[3],
    owner: owners['4'],
    stats: {
      totalPosts: 1680,
      avgViews: 280000,
      engagementRate: 7.2,
      growthRate: 15.3,
    },
    contentAnalysis: {
      mainTopics: ['Искусство', 'Литература', 'Кино', 'Театр'],
      politicalLeaning: 'Либеральный',
      reliabilityScore: 88,
    },
    connections: {
      affiliatedChannels: [],
      mentionedChannels: ['@art_gallery', '@book_club'],
      crossPromotion: ['@museum_guide'],
    },
    history: [
      { date: '2021-05-08', event: 'Создание канала' },
      { date: '2022-02-14', event: 'Обзор Венецианской биеннале' },
      { date: '2023-06-20', event: 'Интервью с известным режиссером' },
      { date: '2024-01-15', event: 'Кураторство онлайн-выставки' },
    ],
  },
  '5': {
    channel: channels[4],
    owner: owners['5'],
    stats: {
      totalPosts: 5230,
      avgViews: 1500000,
      engagementRate: 3.8,
      growthRate: 9.6,
    },
    contentAnalysis: {
      mainTopics: ['Футбол', 'Хоккей', 'Теннис', 'Олимпиада'],
      politicalLeaning: 'Нейтральный',
      reliabilityScore: 79,
    },
    connections: {
      affiliatedChannels: ['@football_insider', '@hockey_news'],
      mentionedChannels: ['@sports_ru', '@match_tv'],
      crossPromotion: ['@betting_tips'],
    },
    history: [
      { date: '2017-11-30', event: 'Создание канала' },
      { date: '2018-06-15', event: 'ЧМ-2018 освещение' },
      { date: '2021-08-08', event: 'Олимпиада Токио' },
      { date: '2022-12-18', event: 'Финал ЧМ-2022' },
    ],
  },
  '6': {
    channel: channels[5],
    owner: owners['6'],
    stats: {
      totalPosts: 1890,
      avgViews: 560000,
      engagementRate: 8.1,
      growthRate: 22.4,
    },
    contentAnalysis: {
      mainTopics: ['Физика', 'Космос', 'Биология', 'Нейронаука'],
      politicalLeaning: 'Нейтральный',
      reliabilityScore: 94,
    },
    connections: {
      affiliatedChannels: ['@physics_fun'],
      mentionedChannels: ['@naked_science', '@postnauka'],
      crossPromotion: ['@space_explorer'],
    },
    history: [
      { date: '2020-09-14', event: 'Создание канала' },
      { date: '2021-07-20', event: 'Интервью с нобелевским лауреатом' },
      { date: '2022-11-15', event: 'Запуск научного подкаста' },
      { date: '2024-02-28', event: 'Сотрудничество с университетом' },
    ],
  },
};

export function getChannelById(id: string): Channel | undefined {
  return channels.find(c => c.id === id);
}

export function getDossierByChannelId(id: string): ChannelDossier | undefined {
  return dossiers[id];
}

export function getAllChannels(): Channel[] {
  return channels;
}
