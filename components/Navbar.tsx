import React from 'react';
import { Search, Film, Eye, ListVideo, Sparkles, Calendar, Settings, User as UserIcon, LogOut } from 'lucide-react';
import { User, Language } from '../types';
import { translations } from '../utils/i18n';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchClick: () => void;
  onSettingsClick: () => void;
  onAuthClick: () => void;
  onLogoutClick: () => void;
  user: User | null;
  language: Language;
}

const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onSearchClick, 
  onSettingsClick,
  onAuthClick,
  onLogoutClick,
  user,
  language
}) => {
  const t = translations[language];
  const tabs = [
    { id: 'discover', label: t.discover, icon: Film },
    { id: 'watchlist', label: t.toWatch, icon: ListVideo },
    { id: 'agenda', label: t.agenda, icon: Calendar },
    { id: 'seen', label: t.seen, icon: Eye },
    { id: 'ai', label: t.aiCurator, icon: Sparkles },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 flex justify-center">
      <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 flex items-center shadow-2xl w-full max-w-5xl justify-between">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between sm:justify-start gap-1 flex-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                    relative p-3 md:landscape:px-4 md:landscape:py-2 lg:px-4 lg:py-2 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 group
                    ${isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
                title={tab.label}
                >
                {isActive && (
                    <span className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                )}
                <Icon size={20} className={`md:landscape:w-4 md:landscape:h-4 lg:w-4 lg:h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                <span className="whitespace-nowrap hidden md:landscape:block lg:block">{tab.label}</span>
                </button>
            );
            })}
        </div>

        {/* Actions (Search, Settings, Auth) */}
        <div className="flex items-center gap-1 pl-2 ml-2 shrink-0 border-l border-white/10">
            <button
                onClick={onSearchClick}
                className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title={t.searchPlaceholder}
            >
                <Search size={20} className="md:landscape:w-[18px] md:landscape:h-[18px] lg:w-[18px] lg:h-[18px]" />
            </button>
            <button
                onClick={onSettingsClick}
                className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title={t.settings}
            >
                <Settings size={20} className="md:landscape:w-[18px] md:landscape:h-[18px] lg:w-[18px] lg:h-[18px]" />
            </button>

            {user ? (
                <div className="flex items-center gap-2 ml-1 pl-1 sm:ml-2 sm:pl-2 sm:border-l sm:border-white/10">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-xs font-bold text-white">{user.username}</span>
                        <span className="text-[10px] text-emerald-400">Online</span>
                    </div>
                    <button
                        onClick={onLogoutClick}
                        className="p-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors"
                        title={t.logout}
                    >
                        <LogOut size={20} className="md:landscape:w-[18px] md:landscape:h-[18px] lg:w-[18px] lg:h-[18px]" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={onAuthClick}
                    className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20"
                >
                    <UserIcon size={20} className="md:landscape:w-4 md:landscape:h-4 lg:w-4 lg:h-4" />
                    <span className="hidden md:landscape:inline lg:inline">{t.login}</span>
                </button>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;