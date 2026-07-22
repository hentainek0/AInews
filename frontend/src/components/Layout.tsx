import { LayoutDashboard, Newspaper, BarChart3, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: '/', label: 'Dashboard', icon: LayoutDashboard },
  { id: '/news', label: '新闻列表', icon: Newspaper },
  { id: '/analytics', label: '数据分析', icon: BarChart3 },
  { id: '/settings', label: '系统设置', icon: Settings },
];

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex">
        <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 fixed h-screen overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI News Crawler
            </h1>
            <p className="text-slate-400 text-sm mt-1">实时新闻监控平台</p>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="mt-auto pt-8 border-t border-slate-700">
            <div className="text-slate-500 text-xs">
              <p>Version 1.0.0</p>
              <p className="mt-1">Last updated: 2026-07-13</p>
            </div>
          </div>
        </aside>
        
        <main className="ml-64 p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}