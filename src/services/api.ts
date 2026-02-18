// API Service for Media Space Backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('token');

// Helper for API requests
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string, secretCode: string) =>
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, secretCode }),
    }),

  getMe: () => fetchApi('/auth/me'),
};

// Channels API
export const channelsApi = {
  getAll: (filters?: { region?: string; ratingColor?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.region && filters.region !== 'all') params.append('region', filters.region);
    if (filters?.ratingColor && filters.ratingColor !== 'all') params.append('ratingColor', filters.ratingColor);
    if (filters?.search) params.append('search', filters.search);
    return fetchApi(`/channels?${params.toString()}`);
  },

  getById: (id: string) => fetchApi(`/channels/${id}`),

  create: (data: any) =>
    fetchApi('/channels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi(`/channels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi(`/channels/${id}`, {
      method: 'DELETE',
    }),
};

// Tabs API
export const tabsApi = {
  create: (channelId: string, data: any) =>
    fetchApi(`/channels/${channelId}/tabs`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (tabId: string, data: any) =>
    fetchApi(`/tabs/${tabId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (tabId: string) =>
    fetchApi(`/tabs/${tabId}`, {
      method: 'DELETE',
    }),
};

// Owner Content API
export const ownerContentApi = {
  update: (tabId: string, data: any) =>
    fetchApi(`/tabs/${tabId}/owner-content`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Overview Blocks API
export const blocksApi = {
  create: (tabId: string, data: any) =>
    fetchApi(`/tabs/${tabId}/blocks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (blockId: string, data: any) =>
    fetchApi(`/blocks/${blockId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (blockId: string) =>
    fetchApi(`/blocks/${blockId}`, {
      method: 'DELETE',
    }),
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error);
    }

    return response.json();
  },

  uploadPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${API_URL}/upload/pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error);
    }

    return response.json();
  },
};

// Stats API
export const statsApi = {
  get: () => fetchApi('/stats'),
};

export default {
  auth: authApi,
  channels: channelsApi,
  tabs: tabsApi,
  ownerContent: ownerContentApi,
  blocks: blocksApi,
  upload: uploadApi,
  stats: statsApi,
};
