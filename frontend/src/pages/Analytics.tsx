import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { analyticsApi } from '@/api';
import type { StatsData } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await analyticsApi.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const trendChartData = stats ? {
    labels: stats.week_trend.map(d => d.date.slice(5)),
    datasets: [
      {
        label: '新闻数量',
        data: stats.week_trend.map(d => d.count),
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  } : null;

  const trendChartOptions = {
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

  const doughnutChartData = stats ? {
    labels: stats.source_distribution.map(d => d.name),
    datasets: [
      {
        data: stats.source_distribution.map(d => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
          'rgb(249, 115, 22)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          padding: 16,
          usePointStyle: true,
        },
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
    cutout: '60%',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">数据分析</h2>
        <p className="text-slate-400 mt-1">深入分析新闻数据，洞察AI领域趋势</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 bg-slate-800 rounded-xl border border-slate-700 animate-pulse" />
          ))
        ) : stats ? (
          <>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-sm">新闻总数</p>
              <p className="text-3xl font-bold mt-2 text-blue-400">{stats.total_count}</p>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-sm">今日新增</p>
              <p className="text-3xl font-bold mt-2 text-green-400">{stats.today_count}</p>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-sm">来源数量</p>
              <p className="text-3xl font-bold mt-2 text-purple-400">{stats.source_distribution.length}</p>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-sm">关键词数量</p>
              <p className="text-3xl font-bold mt-2 text-orange-400">{stats.top_keywords.length}</p>
            </div>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4">近7天新闻趋势</h3>
          <div className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400">加载中...</div>
            ) : trendChartData ? (
              <Line data={trendChartData} options={trendChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">暂无数据</div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4">来源分布</h3>
          <div className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400">加载中...</div>
            ) : doughnutChartData ? (
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">暂无数据</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">热门关键词</h3>
        <div className="grid grid-cols-5 gap-4">
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className="p-4 bg-slate-700 rounded-lg animate-pulse text-center" />
            ))
          ) : stats?.top_keywords ? (
            stats.top_keywords.map((keyword, index) => {
              const maxCount = Math.max(...stats.top_keywords.map(k => k.count));
              const size = 1.2 + (keyword.count / maxCount) * 0.8;
              const colors = ['text-blue-400', 'text-green-400', 'text-purple-400', 'text-orange-400', 'text-pink-400'];
              return (
                <div
                  key={index}
                  className="p-4 bg-slate-700 rounded-lg text-center hover:bg-slate-600 transition-colors"
                >
                  <span className={`font-bold ${colors[index % colors.length]}`} style={{ fontSize: `${size}rem` }}>
                    {keyword.word.charAt(0).toUpperCase() + keyword.word.slice(1)}
                  </span>
                  <p className="text-slate-400 text-sm mt-1">{keyword.count} 次</p>
                </div>
              );
            })
          ) : (
            <div className="col-span-5 text-center text-slate-400 py-8">暂无数据</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4">来源详细统计</h3>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-700 rounded-lg animate-pulse" />
              ))
            ) : stats?.source_distribution ? (
              stats.source_distribution.map((source, index) => {
                const percentage = ((source.count / stats.total_count) * 100).toFixed(1);
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{source.name}</span>
                      <span className="text-slate-400">{source.count} 篇 ({percentage}%)</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-700`}
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

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4">本周数据概览</h3>
          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-700 rounded-lg animate-pulse" />
              ))
            ) : stats?.week_trend ? (
              stats.week_trend.slice(-7).map((day, index) => {
                const maxDayCount = Math.max(...stats.week_trend.map(d => d.count));
                return (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-16 text-slate-400 text-sm">{day.date.slice(5)}</span>
                    <div className="flex-1 h-8 bg-slate-700 rounded-lg overflow-hidden flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(day.count / (maxDayCount || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-white font-medium">{day.count}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-400 text-center py-8">暂无数据</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}