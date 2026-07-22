import { useState, useEffect } from 'react';
import { TrendingUp, Newspaper, Globe, Tag, RefreshCw, Play } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { newsApi, analyticsApi } from '@/api';
import type { NewsArticle, StatsData } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, newsRes] = await Promise.all([
        analyticsApi.getStats(),
        newsApi.getNews(1, 5),
      ]);
      setStats(statsRes.data.data);
      setLatestNews(newsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrawl = async () => {
    setCrawling(true);
    try {
      await newsApi.crawlNews();
      await fetchData();
    } catch (error) {
      console.error('Failed to crawl:', error);
    } finally {
      setCrawling(false);
    }
  };

  const chartData = stats ? {
    labels: stats.week_trend.map(d => d.date.slice(5)),
    datasets: [
      {
        label: '新闻数量',
        data: stats.week_trend.map(d => d.count),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.5)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.5)',
        },
        ticks: {
          color: '#94a3b8',
          stepSize: 2,
        },
        beginAtZero: true,
      },
    },
  };

  const statCards = stats ? [
    { icon: Newspaper, label: '新闻总数', value: stats.total_count, color: 'from-blue-500 to-blue-600' },
    { icon: TrendingUp, label: '今日新增', value: stats.today_count, color: 'from-green-500 to-green-600' },
    { icon: Globe, label: '来源数量', value: stats.source_distribution.length, color: 'from-purple-500 to-purple-600' },
    { icon: Tag, label: '热门关键词', value: stats.top_keywords.length, color: 'from-orange-500 to-orange-600' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-slate-400 mt-1">实时数据概览与趋势分析</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            刷新数据
          </button>
          <button
            onClick={handleCrawl}
            disabled={crawling}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Play size={18} />
            {crawling ? '爬取中...' : '立即爬取'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-200 hover:shadow-lg ${loading ? 'animate-pulse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                <Icon size={24} className="text-white" />
              </div>
              <p className="text-slate-400 text-sm">{card.label}</p>
              <p className="text-3xl font-bold mt-2">{loading ? '---' : card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4">近7天新闻趋势</h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400">加载中...</div>
            ) : chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">暂无数据</div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4">来源分布</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            ) : stats?.source_distribution ? (
              stats.source_distribution.map((source, index) => {
                const percentage = ((source.count / stats.total_count) * 100).toFixed(1);
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{source.name}</span>
                      <span className="text-slate-400">{source.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-400 text-center py-8">暂无数据</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">最新新闻</h3>
          <span className="text-slate-400 text-sm">{latestNews.length} 条记录</span>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : latestNews.length > 0 ? (
            latestNews.map((article) => (
              <div
                key={article.id}
                className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {article.title_zh || article.title}
                    </h4>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-1">
                      {article.summary_zh || article.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {article.source}
                      </span>
                      {article.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs whitespace-nowrap ml-4">
                    {article.date}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-center py-8">暂无新闻数据</div>
          )}
        </div>
      </div>
    </div>
  );
}