import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'uk' | 'en';
export type Region = 'all' | 'kharkiv';
export type RatingColor = 'red' | 'green' | 'purple' | null;
export type TabType = 'owner' | 'overview';

export interface Channel {
  id: string;
  name: string;
  username: string;
  avatar: string;
  description: string;
  category: string;
  region: Region;
  ratingColor: RatingColor;
  tabs: ChannelTab[];
}

export interface ChannelTab {
  id: string;
  name: string;
  type: TabType;
  content: OwnerTabContent | OverviewTabContent;
}

export interface OwnerTabContent {
  photo: string;
  fullName: string;
  birthDate: string;
  birthPlace: string;
  residence: string;
  phone: string;
  mediaActivity: { text: string; links: string[] };
  mediaResources: { text: string; links: string[] };
  socialNetworks: { name: string; url: string; image?: string }[];
  dossierFile?: string;
}

export interface OverviewBlock {
  id: string;
  title: string;
  content: string;
  images: string[];
}

export interface OverviewTabContent {
  blocks: OverviewBlock[];
}

interface DataContextType {
  channels: Channel[];
  addChannel: (channel: Omit<Channel, 'id' | 'tabs'>) => string;
  updateChannel: (id: string, updates: Partial<Channel>) => void;
  deleteChannel: (id: string) => void;
  addTab: (channelId: string, tab: Omit<ChannelTab, 'id'>) => void;
  updateTab: (channelId: string, tabId: string, updates: Partial<ChannelTab>) => void;
  deleteTab: (channelId: string, tabId: string) => void;
  uploadImage: (file: File) => Promise<string>;
  uploadPdf: (file: File) => Promise<string>;
  getChannelsByRegion: (region: Region) => Channel[];
  getChannelById: (id: string) => Channel | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default channels
const defaultChannels: Channel[] = [
  {
    id: '1',
    name: 'Новини Харкова',
    username: '@kharkiv_news',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=KH&backgroundColor=0ea5e9',
    description: 'Актуальні новини Харкова та області. Оперативно та достовірно.',
    category: 'Новини',
    region: 'kharkiv',
    ratingColor: 'green',
    tabs: [
      {
        id: 'tab1',
        name: 'Власник',
        type: 'owner',
        content: {
          photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner1',
          fullName: 'Петренко Іван Сергійович',
          birthDate: '1985-03-12',
          birthPlace: 'Харків, Україна',
          residence: 'м. Харків, вул. Сумська, 1',
          phone: '+380501234567',
          mediaActivity: {
            text: 'Активний учасник медіа-простору Харкова з 2015 року',
            links: ['https://example.com/article1', 'https://example.com/article2'],
          },
          mediaResources: {
            text: 'Керує 3 медіа-ресурсами',
            links: ['@kharkiv_news', '@kharkiv_events', '@kharkiv_sport'],
          },
          socialNetworks: [
            { name: 'Facebook', url: 'https://facebook.com/example', image: '' },
            { name: 'Instagram', url: 'https://instagram.com/example', image: '' },
          ],
        } as OwnerTabContent,
      },
      {
        id: 'tab2',
        name: 'Огляд',
        type: 'overview',
        content: {
          blocks: [
            {
              id: 'block1',
              title: 'Про канал',
              content: 'Канал заснований у 2020 році з метою оперативного інформування мешканців Харкова про події в місті.',
              images: [],
            },
            {
              id: 'block2',
              title: 'Аудиторія',
              content: 'Основна аудиторія каналу — мешканці Харкова та області віком від 18 до 55 років.',
              images: [],
            },
          ],
        } as OverviewTabContent,
      },
    ],
  },
  {
    id: '2',
    name: 'Українські Новини',
    username: '@ukraine_news',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=UN&backgroundColor=dc2626',
    description: 'Всеукраїнські новини. Політика, економіка, суспільство.',
    category: 'Новини',
    region: 'all',
    ratingColor: 'red',
    tabs: [
      {
        id: 'tab1',
        name: 'Адмін',
        type: 'owner',
        content: {
          photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin1',
          fullName: 'Коваленко Олена Вікторівна',
          birthDate: '1990-07-08',
          birthPlace: 'Київ, Україна',
          residence: 'м. Київ, вул. Хрещатик, 15',
          phone: '+380671234567',
          mediaActivity: {
            text: 'Журналіст з 10-річним досвідом',
            links: [],
          },
          mediaResources: {
            text: 'Головний редактор',
            links: [],
          },
          socialNetworks: [
            { name: 'Telegram', url: 'https://t.me/example', image: '' },
          ],
        } as OwnerTabContent,
      },
    ],
  },
  {
    id: '3',
    name: 'Харків Life',
    username: '@kharkiv_life',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=KL&backgroundColor=9333ea',
    description: 'Життя Харкова: події, розваги, культура.',
    category: 'Розваги',
    region: 'kharkiv',
    ratingColor: 'purple',
    tabs: [],
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [imageStorage, setImageStorage] = useState<Record<string, string>>({});
  const [pdfStorage, setPdfStorage] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedChannels = localStorage.getItem('media_space_channels');
    const savedImages = localStorage.getItem('media_space_images');
    const savedPdfs = localStorage.getItem('media_space_pdfs');

    setChannels(savedChannels ? JSON.parse(savedChannels) : defaultChannels);
    setImageStorage(savedImages ? JSON.parse(savedImages) : {});
    setPdfStorage(savedPdfs ? JSON.parse(savedPdfs) : {});
  }, []);

  useEffect(() => {
    if (channels.length > 0) {
      localStorage.setItem('media_space_channels', JSON.stringify(channels));
    }
  }, [channels]);

  useEffect(() => {
    if (Object.keys(imageStorage).length > 0) {
      localStorage.setItem('media_space_images', JSON.stringify(imageStorage));
    }
  }, [imageStorage]);

  useEffect(() => {
    if (Object.keys(pdfStorage).length > 0) {
      localStorage.setItem('media_space_pdfs', JSON.stringify(pdfStorage));
    }
  }, [pdfStorage]);

  const addChannel = (channelData: Omit<Channel, 'id' | 'tabs'>): string => {
    const newChannel: Channel = {
      ...channelData,
      id: Date.now().toString(),
      tabs: [],
    };
    setChannels(prev => [...prev, newChannel]);
    return newChannel.id;
  };

  const updateChannel = (id: string, updates: Partial<Channel>) => {
    setChannels(prev =>
      prev.map(ch => ch.id === id ? { ...ch, ...updates } : ch)
    );
  };

  const deleteChannel = (id: string) => {
    setChannels(prev => prev.filter(ch => ch.id !== id));
  };

  const addTab = (channelId: string, tab: Omit<ChannelTab, 'id'>) => {
    const newTab: ChannelTab = {
      ...tab,
      id: `tab_${Date.now()}`,
    };
    setChannels(prev =>
      prev.map(ch =>
        ch.id === channelId
          ? { ...ch, tabs: [...ch.tabs, newTab] }
          : ch
      )
    );
  };

  const updateTab = (channelId: string, tabId: string, updates: Partial<ChannelTab>) => {
    setChannels(prev =>
      prev.map(ch =>
        ch.id === channelId
          ? {
              ...ch,
              tabs: ch.tabs.map(tab =>
                tab.id === tabId ? { ...tab, ...updates } : tab
              ),
            }
          : ch
      )
    );
  };

  const deleteTab = (channelId: string, tabId: string) => {
    setChannels(prev =>
      prev.map(ch =>
        ch.id === channelId
          ? { ...ch, tabs: ch.tabs.filter(tab => tab.id !== tabId) }
          : ch
      )
    );
  };

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const imageId = `img_${Date.now()}`;
        setImageStorage(prev => ({ ...prev, [imageId]: base64 }));
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadPdf = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const pdfId = `pdf_${Date.now()}`;
        setPdfStorage(prev => ({ ...prev, [pdfId]: base64 }));
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  };

  const getChannelsByRegion = (region: Region) => {
    return channels.filter(ch => region === 'all' || ch.region === region);
  };

  const getChannelById = (id: string) => channels.find(c => c.id === id);

  return (
    <DataContext.Provider value={{
      channels,
      addChannel,
      updateChannel,
      deleteChannel,
      addTab,
      updateTab,
      deleteTab,
      uploadImage,
      uploadPdf,
      getChannelsByRegion,
      getChannelById,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
