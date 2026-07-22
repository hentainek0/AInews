import { useState, useEffect } from 'react';
import { Save, Send, Clock, Bell, Globe, CheckCircle } from 'lucide-react';
import { configApi } from '@/api';
import type { ConfigData, ScheduleConfig } from '@/types';

export default function Settings() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, scheduleRes] = await Promise.all([
        configApi.getConfig(),
        configApi.getSchedule(),
      ]);
      setConfig(configRes.data.data);
      setSchedule(scheduleRes.data.data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config || !schedule) return;
    setSaving(true);
    try {
      await configApi.updateConfig(config);
      await configApi.updateSchedule(schedule);
      setTestResult('配置保存成功');
      setTimeout(() => setTestResult(''), 3000);
    } catch (error) {
      setTestResult('保存失败');
      setTimeout(() => setTestResult(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleTestPush = async () => {
    if (!config) return;
    setTestResult('测试中...');
    try {
      await configApi.testPush({
        wechat_webhook: config.wechat_webhook,
        dingtalk_token: config.dingtalk_token,
        feishu_webhook: config.feishu_webhook,
      });
      setTestResult('推送测试成功');
    } catch (error) {
      setTestResult('推送测试失败');
    }
    setTimeout(() => setTestResult(''), 3000);
  };

  const handleAddSource = () => {
    if (!config) return;
    setConfig({
      ...config,
      rss_sources: [...config.rss_sources, { name: '', url: '' }],
    });
  };

  const handleRemoveSource = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      rss_sources: config.rss_sources.filter((_, i) => i !== index),
    });
  };

  const handleAddScheduleTime = () => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      times: [...schedule.times, '00:00'],
    });
  };

  const handleRemoveScheduleTime = (index: number) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      times: schedule.times.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">系统设置</h2>
          <p className="text-slate-400 mt-1">配置爬取源、推送方式和定时任务</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleTestPush}
            disabled={saving || !config}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Send size={18} />
            测试推送
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !config || !schedule}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Save size={18} />
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      {testResult && (
        <div className={`p-4 rounded-lg ${testResult.includes('成功') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {testResult}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="text-blue-400" size={24} />
            <h3 className="text-lg font-semibold">RSS 数据源</h3>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-10 bg-slate-700 rounded-lg animate-pulse" />
                  <div className="h-10 bg-slate-700 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : config ? (
            <div className="space-y-4">
              {config.rss_sources.map((source, index) => (
                <div key={index} className="p-4 bg-slate-700 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">数据源 {index + 1}</span>
                    {config.rss_sources.length > 1 && (
                      <button
                        onClick={() => handleRemoveSource(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="数据源名称"
                    value={source.name}
                    onChange={(e) => {
                      const newSources = [...config.rss_sources];
                      newSources[index].name = e.target.value;
                      setConfig({ ...config, rss_sources: newSources });
                    }}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="RSS URL"
                    value={source.url}
                    onChange={(e) => {
                      const newSources = [...config.rss_sources];
                      newSources[index].url = e.target.value;
                      setConfig({ ...config, rss_sources: newSources });
                    }}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
              <button
                onClick={handleAddSource}
                className="w-full py-3 border border-dashed border-slate-600 rounded-lg hover:border-blue-500 transition-colors text-slate-400 hover:text-blue-400"
              >
                + 添加数据源
              </button>
            </div>
          ) : null}

          <div className="mt-6 pt-6 border-t border-slate-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="number"
                min="1"
                max="20"
                value={config?.article_count || 5}
                onChange={(e) => config && setConfig({ ...config, article_count: parseInt(e.target.value) })}
                className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <span className="text-slate-300">每次爬取文章数量</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-green-400" size={24} />
            <h3 className="text-lg font-semibold">推送配置</h3>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : config ? (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">企业微信 Webhook</label>
                <input
                  type="text"
                  placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
                  value={config.wechat_webhook}
                  onChange={(e) => setConfig({ ...config, wechat_webhook: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">钉钉 Access Token</label>
                <input
                  type="text"
                  placeholder="钉钉机器人的 access_token"
                  value={config.dingtalk_token}
                  onChange={(e) => setConfig({ ...config, dingtalk_token: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">飞书 Webhook</label>
                <input
                  type="text"
                  placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
                  value={config.feishu_webhook}
                  onChange={(e) => setConfig({ ...config, feishu_webhook: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-purple-400" size={24} />
          <h3 className="text-lg font-semibold">定时任务配置</h3>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-12 bg-slate-700 rounded-lg animate-pulse" />
          </div>
        ) : schedule ? (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-300">启用定时任务</span>
              </label>
              
              <div className="mt-4">
                <label className="block text-slate-400 text-sm mb-2">运行时间</label>
                <div className="space-y-2">
                  {schedule.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...schedule.times];
                          newTimes[index] = e.target.value;
                          setSchedule({ ...schedule, times: newTimes });
                        }}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                      {schedule.times.length > 1 && (
                        <button
                          onClick={() => handleRemoveScheduleTime(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddScheduleTime}
                  className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                >
                  + 添加时间
                </button>
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-slate-400 text-sm mb-4">任务状态</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">上次运行</span>
                  <span className="text-white">{schedule.last_run || '从未运行'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">下次运行</span>
                  <span className="text-white">{schedule.next_run || '未设置'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">状态</span>
                  <span className={schedule.enabled ? 'text-green-400' : 'text-red-400'}>
                    {schedule.enabled ? '已启用' : '已禁用'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <CheckCircle className="text-blue-400 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-blue-400 font-medium">配置说明</h4>
            <ul className="text-slate-400 text-sm mt-2 space-y-1">
              <li>• 企业微信 Webhook 需要在群聊设置中添加机器人获取</li>
              <li>• 钉钉机器人需要创建自定义机器人获取 access_token</li>
              <li>• 飞书机器人需要在群聊设置中添加自定义机器人获取 webhook</li>
              <li>• 定时任务时间格式为 HH:MM，支持添加多个时间点</li>
              <li>• 配置保存后需要重启服务才能生效</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}