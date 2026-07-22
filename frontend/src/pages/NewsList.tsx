import { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink, X, Tag } from 'lucide-react';
import { newsApi } from '@/api';
import type { NewsArticle } from '@/types';

interface NewsDetailModalProps {
  article: NewsArticle;
  onClose: () => void;
}

function NewsDetailModal({ article, onClose }: NewsDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-xl font-bold">{article.title_zh || article.title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              {article.source}
            </span>
            <span className="text-slate-400 text-sm">{article.date}</span>
            {article.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-slate-600 text-slate-300 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">中文摘要</h4>
              <p className="text-slate-300 leading-relaxed">{article.summary_zh || article.summary}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">英文原文</h4>
              <p className="text-slate-400 leading-relaxed">{article.title}</p>
            </div>
            
            <div className="pt-4 border-t border-slate-700">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink size={18} />
                查看原文
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsList() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    fetchNews();
  }, [page, searchKeyword, selectedSource]);

  useEffect(() => {
    const uniqueSources = [...new Set(articles.map(a => a.source))];
    setSources(uniqueSources);
  }, [articles]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await newsApi.getNews(page, limit, selectedSource || undefined, searchKeyword || undefined);
      setArticles(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">新闻列表</h2>
        <p className="text-slate-400 mt-1">浏览和管理所有爬取的新闻文章</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="搜索新闻标题..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          >
            <option value="">全部来源</option>
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <span className="text-slate-400">共 {total} 条记录</span>
        </div>
        
        <div className="divide-y divide-slate-700">
          {loading ? (
            <div className="p-8">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-slate-700 rounded-lg mb-4 animate-pulse" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="p-6 hover:bg-slate-700/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {article.title_zh || article.title}
                    </h3>
                    <p className="text-slate-400 mt-2 line-clamp-2">
                      {article.summary_zh || article.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {article.source}
                      </span>
                      {article.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded flex items-center gap-1">
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-slate-500 text-sm">{article.date}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="text-slate-400">暂无新闻数据</div>
              <p className="text-slate-500 text-sm mt-2">请先执行爬取操作获取新闻</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
          <span className="text-slate-400 text-sm">
            显示 {(page - 1) * limit + 1} - {Math.min(page * limit, total)} 条
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <span className="text-slate-300 mx-2">
              {page} / {totalPages || 1}
            </span>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {selectedArticle && (
        <NewsDetailModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}