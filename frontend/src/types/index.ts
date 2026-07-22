export interface NewsArticle {
  id: string;
  title: string;
  title_zh: string;
  link: string;
  summary: string;
  summary_zh: string;
  content: string;
  source: string;
  date: string;
  tags: string[];
  created_at: string;
}

export interface NewsResponse {
  status: string;
  data: NewsArticle[];
  total: number;
  page: number;
  limit: number;
}

export interface StatsData {
  total_count: number;
  today_count: number;
  week_trend: { date: string; count: number }[];
  source_distribution: { name: string; count: number }[];
  top_keywords: { word: string; count: number }[];
}

export interface StatsResponse {
  status: string;
  data: StatsData;
}

export interface PushConfig {
  wechat_webhook: string;
  dingtalk_token: string;
  feishu_webhook: string;
}

export interface ConfigData extends PushConfig {
  rss_sources: { name: string; url: string }[];
  article_count: number;
  auto_translate: boolean;
}

export interface ConfigResponse {
  status: string;
  data: ConfigData;
}

export interface ScheduleConfig {
  times: string[];
  enabled: boolean;
  last_run: string;
  next_run: string;
}

export interface ScheduleResponse {
  status: string;
  data: ScheduleConfig;
}