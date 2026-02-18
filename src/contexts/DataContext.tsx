import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { channelsApi, tabsApi, ownerContentApi, blocksApi } from '../services/api';

export type Region = 'all' | 'kharkiv';
export type RatingColor = 'red' | 'green' | 'purple';
export type TabTemplate = 'owner' | 'overview';

export interface OverviewBlock {
  id: string;
  titleUk: string;
  titleEn: string;
  contentUk: string;
  contentEn: string;
  images: string[];
}

export interface OwnerContent {
  id?: string;
  photo?: string;
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  residence?: string;
  phone?: string;
  mediaActivity?: string;
  mediaResources?: string;
  socialNetworks?: string;
  dossierPdf?: string;
}

export interface ChannelTab {
  id: string;
  nameUk: string;
  nameEn: string;
  template: TabTemplate;
  content?: OwnerContent;
  blocks?: OverviewBlock[];
}

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
  createdAt?: string;
  updatedAt?: string;
}

interface DataContextType {
  channels: Channel[];
  isLoading: boolean;
  error: string | null;
  fetchChannels: (filters?: { region?: string; ratingColor?: string; search?: string }) => Promise<void>;
  fetchChannel: (id: string) => Promise<Channel>;
  addChannel: (channel: Omit<Channel, 'id' | 'tabs'> & { tabs?: Partial<ChannelTab>[] }) => Promise<string>;
  updateChannel: (id: string, channel: Partial<Channel>) => Promise<void>;
  deleteChannel: (id: string) => Promise<void>;
  addTab: (channelId: string, tab: Omit<ChannelTab, 'id' | 'content' | 'blocks'>) => Promise<string>;
  updateTab: (tabId: string, tab: Partial<ChannelTab>) => Promise<void>;
  deleteTab: (tabId: string) => Promise<void>;
  updateOwnerContent: (tabId: string, content: OwnerContent) => Promise<void>;
  addBlock: (tabId: string, block: Omit<OverviewBlock, 'id'>) => Promise<string>;
  updateBlock: (blockId: string, block: Partial<OverviewBlock>) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = useCallback(async (filters?: { region?: string; ratingColor?: string; search?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await channelsApi.getAll(filters);
      // Transform API data to match our interface
      const transformedChannels: Channel[] = data.map((ch: any) => ({
        id: ch.id,
        name: ch.name,
        username: ch.username,
        avatar: ch.avatar || '',
        description: ch.description || '',
        category: ch.category || '',
        region: ch.region || 'all',
        ratingColor: ch.rating_color || 'green',
        tabs: [], // Tabs are loaded separately for list view
        createdAt: ch.created_at,
        updatedAt: ch.updated_at,
      }));
      setChannels(transformedChannels);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch channels');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchChannel = useCallback(async (id: string): Promise<Channel> => {
    const data = await channelsApi.getById(id);
    
    // Transform tabs
    const tabs: ChannelTab[] = (data.tabs || []).map((tab: any) => {
      const baseTab = {
        id: tab.id,
        nameUk: tab.name_uk,
        nameEn: tab.name_en,
        template: tab.template as TabTemplate,
      };

      if (tab.template === 'owner') {
        return {
          ...baseTab,
          content: tab.content ? {
            id: tab.content.id,
            photo: tab.content.photo,
            fullName: tab.content.full_name,
            birthDate: tab.content.birth_date,
            birthPlace: tab.content.birth_place,
            residence: tab.content.residence,
            phone: tab.content.phone,
            mediaActivity: tab.content.media_activity,
            mediaResources: tab.content.media_resources,
            socialNetworks: tab.content.social_networks,
            dossierPdf: tab.content.dossier_pdf,
          } : undefined,
        };
      } else {
        return {
          ...baseTab,
          blocks: (tab.blocks || []).map((block: any) => ({
            id: block.id,
            titleUk: block.title_uk,
            titleEn: block.title_en,
            contentUk: block.content_uk,
            contentEn: block.content_en,
            images: JSON.parse(block.images || '[]'),
          })),
        };
      }
    });

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      avatar: data.avatar || '',
      description: data.description || '',
      category: data.category || '',
      region: data.region || 'all',
      ratingColor: data.rating_color || 'green',
      tabs,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }, []);

  const addChannel = useCallback(async (channel: Omit<Channel, 'id' | 'tabs'> & { tabs?: Partial<ChannelTab>[] }): Promise<string> => {
    const data = await channelsApi.create({
      name: channel.name,
      username: channel.username,
      avatar: channel.avatar,
      description: channel.description,
      category: channel.category,
      region: channel.region,
      ratingColor: channel.ratingColor,
      tabs: channel.tabs?.map(tab => ({
        nameUk: tab.nameUk,
        nameEn: tab.nameEn,
        template: tab.template,
      })),
    });
    
    // Refresh channels list
    await fetchChannels();
    return data.id;
  }, [fetchChannels]);

  const updateChannel = useCallback(async (id: string, channel: Partial<Channel>) => {
    await channelsApi.update(id, {
      name: channel.name,
      username: channel.username,
      avatar: channel.avatar,
      description: channel.description,
      category: channel.category,
      region: channel.region,
      ratingColor: channel.ratingColor,
    });
    
    // Refresh channels list
    await fetchChannels();
  }, [fetchChannels]);

  const deleteChannel = useCallback(async (id: string) => {
    await channelsApi.delete(id);
    
    // Refresh channels list
    await fetchChannels();
  }, [fetchChannels]);

  const addTab = useCallback(async (channelId: string, tab: Omit<ChannelTab, 'id' | 'content' | 'blocks'>): Promise<string> => {
    const data = await tabsApi.create(channelId, {
      nameUk: tab.nameUk,
      nameEn: tab.nameEn,
      template: tab.template,
    });
    return data.id;
  }, []);

  const updateTab = useCallback(async (tabId: string, tab: Partial<ChannelTab>) => {
    await tabsApi.update(tabId, {
      nameUk: tab.nameUk,
      nameEn: tab.nameEn,
    });
  }, []);

  const deleteTab = useCallback(async (tabId: string) => {
    await tabsApi.delete(tabId);
  }, []);

  const updateOwnerContent = useCallback(async (tabId: string, content: OwnerContent) => {
    await ownerContentApi.update(tabId, {
      photo: content.photo,
      fullName: content.fullName,
      birthDate: content.birthDate,
      birthPlace: content.birthPlace,
      residence: content.residence,
      phone: content.phone,
      mediaActivity: content.mediaActivity,
      mediaResources: content.mediaResources,
      socialNetworks: content.socialNetworks,
      dossierPdf: content.dossierPdf,
    });
  }, []);

  const addBlock = useCallback(async (tabId: string, block: Omit<OverviewBlock, 'id'>): Promise<string> => {
    const data = await blocksApi.create(tabId, {
      titleUk: block.titleUk,
      titleEn: block.titleEn,
      contentUk: block.contentUk,
      contentEn: block.contentEn,
      images: block.images,
    });
    return data.id;
  }, []);

  const updateBlock = useCallback(async (blockId: string, block: Partial<OverviewBlock>) => {
    await blocksApi.update(blockId, {
      titleUk: block.titleUk,
      titleEn: block.titleEn,
      contentUk: block.contentUk,
      contentEn: block.contentEn,
      images: block.images,
    });
  }, []);

  const deleteBlock = useCallback(async (blockId: string) => {
    await blocksApi.delete(blockId);
  }, []);

  return (
    <DataContext.Provider
      value={{
        channels,
        isLoading,
        error,
        fetchChannels,
        fetchChannel,
        addChannel,
        updateChannel,
        deleteChannel,
        addTab,
        updateTab,
        deleteTab,
        updateOwnerContent,
        addBlock,
        updateBlock,
        deleteBlock,
      }}
    >
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
