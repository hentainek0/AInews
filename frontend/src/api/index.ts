import axios from 'axios';
import type { NewsResponse, StatsResponse, ConfigResponse, ScheduleConfig, PushConfig } from '@/types';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const newsApi = {
  getNews: (page: number = 1, limit: number = 10, source?: string, keyword?: string) =>
    api.get<NewsResponse>('/news', { params: { page, limit, source, keyword } }),
  
  crawlNews: () => api.post('/news'),
  
  deleteNews: (id: string) => api.delete(`/news/${id}`),
};

export const analyticsApi = {
  getStats: () => api.get<StatsResponse>('/analytics/stats'),
};

export const configApi = {
  getConfig: () => api.get<ConfigResponse>('/config'),
  
  updateConfig: (data: Partial<ConfigResponse['data']>) => api.put('/config', data),
  
  testPush: (data: PushConfig) => api.post('/config/push', data),
  
  getSchedule: () => api.get<ScheduleResponse>('/config/schedule'),
  
  updateSchedule: (data: Partial<ScheduleConfig>) => api.put('/config/schedule', data),
};