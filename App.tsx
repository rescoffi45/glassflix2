import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import GlassCard from './components/GlassCard';
import MediaDetails from './components/MediaDetails';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import FilterBar, { SortType, SortOrder } from './components/FilterBar';
import { fetchTrending, searchMulti, fetchMediaDetails, fetchSeasonDetails } from './services/tmdbService';
import { getRecommendations } from './services/geminiService';
import { authService } from './services/authService';
import { TMDBResult, CollectionItem, CollectionStatus, AIRecommendation, MediaDetails as MediaDetailsType, AgendaEvent, User, Language } from './types';
import { translations, getTMDBLocale } from './utils/i18n';
import { X, Search, Sparkles, Loader2, Calendar, Clock } from 'lucide-react';

const App: React.FC = () => {
  // User State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Language State
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('glassflix_language') as Language) || 'en';
  });
  const t = translations[language];

  const [activeTab, setActiveTab] = useState('discover');
  const [trending, setTrending] = useState<TMDBResult[]>([]);
  
  // Collection State (Initially empty until loaded from local or user)
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  
  // Settings & UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Filter & Sort State
  const [sortBy, setSortBy] = useState<SortType>('dateAdded');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [gridColumns, setGridColumns] = useState<number>(5);

  // Search Data
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // AI State
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Details Modal State
  const [selectedMedia, setSelectedMedia] = useState<TMDBResult | null>(null);

  // Effect: Persist Language
  useEffect(() => {
    localStorage.setItem('glassflix_language', language);
  }, [language]);

  // Initialization Effect: Check session and load initial data
  useEffect(() => {
    // 1. Load Trending
    const loadTrending = async () => {
      const tmdbLocale = getTMDBLocale(language);
      const data = await fetchTrending(tmdbLocale);
      setTrending(data);
    };
    loadTrending();

    // 2. Check for User Session
    const sessionUser = authService.checkSession();
    if (sessionUser) {
      setUser(sessionUser);
      setCollection(sessionUser.collection);
    } else {
      // 3. If no user, load Guest collection
      const guestData = localStorage.getItem('glassflix_collection');
      if (guestData) {
        setCollection(JSON.parse(guestData));
      }
    }
  }, [language]); // Reload trending when language changes

  // Persistence Effect: Save collection when it changes
  useEffect(() => {
    if (user) {
      // If user is logged in, save to User DB
      authService.saveUserCollection(user.username, collection);
      // Update local user state to reflect changes
      setUser(prev => prev ? { ...prev, collection } : null);
    } else {
      // If guest, save to generic local storage
      localStorage.setItem('glassflix_collection', JSON.stringify(collection));
    }
  }, [collection, user?.username]); // Only re-run if collection changes, or username changes

  // Auth Handlers
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCollection(loggedInUser.collection);
    authService.setSession(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    authService.clearSession();
    // Switch back to guest data
    const guestData = localStorage.getItem('glassflix_collection');
    setCollection(guestData ? JSON.parse(guestData) : []);
    setActiveTab('discover');
  };

  // Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        const tmdbLocale = getTMDBLocale(language);
        const results = await searchMulti(searchQuery, tmdbLocale);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, language]); // Re-search if language changes

  // Handle Collection Actions
  const handleAction = async (itemOrDetails: TMDBResult | MediaDetailsType, action: CollectionStatus | 'remove') => {
    const id = itemOrDetails.id;

    if (action === 'remove') {
      setCollection(prev => prev.filter(i => i.id !== id));
      return;
    }

    const mediaType = itemOrDetails.media_type || (itemOrDetails.title ? 'movie' : 'tv');
    const today = new Date().toLocaleDateString('en-CA');

    // 1. Optimistic Add/Update
    setCollection(prev => {
        const existing = prev.find(i => i.id === id);
        const baseItem = existing || { ...(itemOrDetails as TMDBResult), addedAt: Date.now(), media_type: mediaType };
        const updatedItem: CollectionItem = { ...baseItem, status: action };

        if (action !== 'watchlist') {
            delete updatedItem.agendaEvents;
            delete updatedItem.agendaDate;
            delete updatedItem.agendaTitle;
        }

        if (existing) return prev.map(i => i.id === id ? updatedItem : i);
        return [...prev, updatedItem];
    });

    // 2. Background Fetch for Agenda Events
    if (action === 'watchlist') {
        try {
            let events: AgendaEvent[] = [];
            const tmdbLocale = getTMDBLocale(language);
            
            // Case A: Movie
            if (mediaType === 'movie') {
                const releaseDate = (itemOrDetails as any).release_date;
                if (releaseDate && releaseDate >= today) {
                    events.push({
                        date: releaseDate,
                        title: 'Movie Release',
                        overview: itemOrDetails.overview
                    });
                }
            } 
            // Case B: TV Show
            else if (mediaType === 'tv') {
                // We need full details to get next_episode_to_air
                let details = itemOrDetails as MediaDetailsType;
                // Fetch details if missing (e.g. added from grid)
                if (!('next_episode_to_air' in details) || !details.seasons) {
                   const fetched = await fetchMediaDetails(id, 'tv', tmdbLocale);
                   if (fetched) details = fetched;
                }

                if (details.next_episode_to_air) {
                    // Get the season of the next episode to find ALL remaining episodes
                    const seasonNum = details.next_episode_to_air.season_number;
                    const seasonData = await fetchSeasonDetails(id, seasonNum, tmdbLocale);
                    
                    if (seasonData && seasonData.episodes) {
                        const futureEpisodes = seasonData.episodes.filter(ep => ep.air_date >= today);
                        events = futureEpisodes.map(ep => ({
                            date: ep.air_date,
                            title: `S${ep.season_number}E${ep.episode_number}`,
                            episodeTitle: ep.name,
                            overview: ep.overview
                        }));
                    }
                }
            }

            // Update Collection with Events
            if (events.length > 0) {
                setCollection(prev => prev.map(item => {
                    if (item.id === id) {
                        return { ...item, agendaEvents: events };
                    }
                    return item;
                }));
            }

        } catch (err) {
            console.error("Failed to fetch agenda events:", err);
        }
    }
  };

  // Generate AI Recommendations
  const generateRecommendations = async () => {
    setIsGeneratingAI(true);
    const seenTitles = collection
      .filter(item => item.status === 'seen')
      .map(item => item.title || item.name || '')
      .filter(t => t.length > 0)
      .slice(-10); 
    
    const recs = await getRecommendations(seenTitles, language);
    setRecommendations(recs);
    setIsGeneratingAI(false);
  };

  const getFilteredCollection = (status: CollectionStatus) => {
    let items = collection.filter(item => item.status === status);

    // Sorting Logic
    items.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'dateAdded':
          comparison = (a.addedAt || 0) - (b.addedAt || 0);
          break;
        case 'rating':
          comparison = (a.vote_average || 0) - (b.vote_average || 0);
          break;
        case 'title':
          const titleA = a.title || a.name || '';
          const titleB = b.title || b.name || '';
          comparison = titleA.localeCompare(titleB);
          break;
        case 'releaseDate':
            const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01').getTime();
            const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01').getTime();
            comparison = dateA - dateB;
            break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return items;
  };

  // Helper to flatten all events for the agenda view
  const getAllAgendaEvents = () => {
    const today = new Date().toLocaleDateString('en-CA');
    let events: { 
        uniqueId: string;
        item: CollectionItem;
        event: AgendaEvent 
    }[] = [];

    collection.forEach(item => {
        if (item.status !== 'watchlist') return;

        // Modern multiple events
        if (item.agendaEvents && item.agendaEvents.length > 0) {
            item.agendaEvents.forEach(event => {
                if (event.date >= today) {
                    events.push({
                        uniqueId: `${item.id}-${event.date}-${event.title}`,
                        item: item,
                        event: event
                    });
                }
            });
        } 
        // Legacy/Fallback single event
        else if (item.agendaDate && item.agendaDate >= today) {
            events.push({
                uniqueId: `${item.id}-${item.agendaDate}`,
                item: item,
                event: {
                    date: item.agendaDate,
                    title: item.agendaTitle || 'Upcoming',
                    episodeTitle: item.title || item.name,
                    overview: item.overview
                }
            });
        }
    });

    // Sort by Date
    return events.sort((a, b) => a.event.date.localeCompare(b.event.date));
  };

  const handleCardClick = (item: TMDBResult) => {
    setSelectedMedia(item);
  };

  // Get Grid Classes dynamically based on setting
  const getGridClass = () => {
    switch (gridColumns) {
        case 2: return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2';
        case 3: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3';
        case 4: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4';
        case 6: return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6';
        default: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'; 
    }
  };

  // Render Logic
  const renderContent = () => {
    if (activeTab === 'discover') {
      return (
        <div className="animate-fade-in">
          <div className="mb-8 relative">
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-white drop-shadow-sm">{t.trending}</h2>
            <p className="text-gray-400 text-sm">{t.trendingSub}</p>
          </div>
          <div className={`grid gap-6 ${getGridClass()}`}>
            {trending.map(item => (
              <GlassCard
                key={item.id}
                item={item}
                onAction={handleAction}
                onClick={handleCardClick}
                isCollected={collection.some(c => c.id === item.id)}
                currentStatus={collection.find(c => c.id === item.id)?.status}
                language={language}
              />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'watchlist' || activeTab === 'seen') {
      const items = getFilteredCollection(activeTab as CollectionStatus);
      const title = activeTab === 'watchlist' ? t.toWatch : t.seen;
      
      return (
        <div className="animate-fade-in">
          <div className="mb-4">
            <h2 className="text-3xl font-bold mb-2 capitalize bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-white">{title}</h2>
            <p className="text-gray-400 text-sm mb-6">
                {items.length === 0 ? (activeTab === 'watchlist' ? t.emptyWatchlist : t.emptySeen) : `${items.length} ${t.itemsCollected}`}
            </p>
            
            <FilterBar 
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                gridColumns={gridColumns}
                setGridColumns={setGridColumns}
                language={language}
            />
          </div>

          {items.length > 0 ? (
            <div className={`grid gap-6 ${getGridClass()}`}>
              {items.map(item => (
                <GlassCard
                  key={item.id}
                  item={item}
                  onAction={handleAction}
                  onClick={handleCardClick}
                  isCollected={true}
                  currentStatus={item.status}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <FilmIcon className="w-16 h-16 mb-4 opacity-50" />
              <p>{t.startAdding}</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'agenda') {
        const agendaEvents = getAllAgendaEvents();
        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-500/20 rounded-full mb-4 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                        <Calendar size={32} className="text-indigo-300" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4">{t.upcomingAgenda}</h2>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        {t.agendaSubtitle}
                    </p>
                </div>

                {agendaEvents.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center backdrop-blur-md">
                        <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-300 mb-2">{t.noEvents}</h3>
                        <p className="text-gray-500">{t.noEventsSub}</p>
                    </div>
                ) : (
                    <div className="space-y-6 relative">
                        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-white/10 hidden sm:block"></div>

                        {agendaEvents.map(({ uniqueId, item, event }) => {
                            const date = new Date(event.date);
                            // Locale aware dates
                            const locale = language === 'fr' ? 'fr-FR' : 'en-US';
                            const day = date.toLocaleDateString(locale, { day: 'numeric', timeZone: 'UTC' });
                            const month = date.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' });
                            const weekday = date.toLocaleDateString(locale, { weekday: 'long', timeZone: 'UTC' });
                            const fullDate = date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

                            return (
                                <div key={uniqueId} className="relative flex gap-6 group cursor-pointer" onClick={() => handleCardClick(item)}>
                                     {/* Date Bubble */}
                                    <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 bg-[#111827] border border-indigo-500/30 rounded-2xl shadow-lg z-10 shrink-0 group-hover:border-indigo-400 transition-colors">
                                        <span className="text-xs font-bold text-indigo-400 uppercase">{month}</span>
                                        <span className="text-xl font-bold text-white">{day}</span>
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-xl backdrop-blur-md transition-all hover:translate-x-2 flex gap-4 items-center overflow-hidden">
                                        {/* Image */}
                                        <div className="w-16 h-24 bg-gray-800 rounded-lg shrink-0 overflow-hidden border border-white/10">
                                            <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1 sm:hidden">
                                                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{fullDate}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white truncate">{item.title || item.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                                                <span className="px-2 py-0.5 bg-white/10 rounded text-xs border border-white/10 whitespace-nowrap">
                                                    {event.title}
                                                </span>
                                                {event.episodeTitle && (
                                                    <span className="text-indigo-200 italic truncate hidden md:inline">"{event.episodeTitle}"</span>
                                                )}
                                                <span className="text-gray-500 hidden sm:inline">•</span>
                                                <span className="text-gray-400 text-xs hidden sm:inline">{weekday}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 line-clamp-1">{event.overview || item.overview}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === 'ai') {
        const seenCount = collection.filter(c => c.status === 'seen').length;
        
        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-purple-500/20 rounded-full mb-4 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                        <Sparkles size={32} className="text-purple-300" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4">{t.aiCurator}</h2>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        {t.aiSubtitle}
                    </p>
                </div>

                {seenCount < 3 ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl flex items-start gap-4 backdrop-blur-md">
                        <Info className="text-yellow-400 shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-yellow-100 mb-1">{t.notEnoughData}</h3>
                            <p className="text-yellow-200/70 text-sm">{t.notEnoughDataSub}</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {!isGeneratingAI && recommendations.length === 0 && (
                            <div className="text-center">
                                <button 
                                    onClick={generateRecommendations}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/40 transform hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                                >
                                    <Sparkles size={20} />
                                    {t.generate}
                                </button>
                            </div>
                        )}

                        {isGeneratingAI && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 size={40} className="animate-spin text-purple-400 mb-4" />
                                <p className="text-purple-200 animate-pulse">{t.consulting}</p>
                            </div>
                        )}

                        {recommendations.length > 0 && !isGeneratingAI && (
                            <div className="grid gap-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-bold text-white">{t.topPicks}</h3>
                                    <button 
                                        onClick={generateRecommendations}
                                        className="text-sm text-purple-300 hover:text-white flex items-center gap-1"
                                    >
                                        <Sparkles size={14} /> {t.refresh}
                                    </button>
                                </div>
                                {recommendations.map((rec, idx) => (
                                    <div key={idx} className="bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-xl backdrop-blur-md transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                                {rec.title}
                                            </h4>
                                            <p className="text-sm text-purple-200/80 italic">"{rec.reason}"</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSearchQuery(rec.title);
                                                setIsSearchOpen(true);
                                            }}
                                            className="self-start sm:self-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white border border-white/10 flex items-center gap-2"
                                        >
                                            <Search size={14} /> {t.findAdd}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
    return null;
  };

  // Search Overlay
  const renderSearch = () => {
    if (!isSearchOpen) return null;
    return (
      <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl animate-fade-in flex flex-col">
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                    <input
                        autoFocus
                        type="text"
                        placeholder={t.searchPlaceholder}
                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-14 pr-4 text-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/15 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                    }}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {searchResults.length > 0 ? (
                    <div className={`grid gap-6 pb-20 ${getGridClass()}`}>
                         {searchResults.map(item => (
                            <GlassCard
                                key={item.id}
                                item={item}
                                onAction={handleAction}
                                onClick={handleCardClick}
                                isCollected={collection.some(c => c.id === item.id)}
                                currentStatus={collection.find(c => c.id === item.id)?.status}
                                language={language}
                            />
                        ))}
                    </div>
                ) : searchQuery.length > 2 && !isSearching ? (
                    <div className="text-center text-gray-500 mt-20">
                        <p>{t.noResults} "{searchQuery}"</p>
                    </div>
                ) : (
                    <div className="text-center text-gray-600 mt-20">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{t.typeToSearch}</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 pt-28 px-4 md:px-8 max-w-7xl mx-auto">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSearchClick={() => setIsSearchOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onAuthClick={() => setIsAuthOpen(true)}
        onLogoutClick={handleLogout}
        user={user}
        language={language}
      />
      
      {renderContent()}
      {renderSearch()}

      {isSettingsOpen && (
        <SettingsModal 
            onClose={() => setIsSettingsOpen(false)}
            collection={collection}
            onImport={(data) => {
                setCollection(data);
            }}
            language={language}
            onLanguageChange={setLanguage}
        />
      )}

      {isAuthOpen && (
        <AuthModal 
            onClose={() => setIsAuthOpen(false)}
            onLogin={handleLogin}
            language={language}
        />
      )}

      {selectedMedia && (
        <MediaDetails 
          item={selectedMedia} 
          onClose={() => setSelectedMedia(null)} 
          onAction={handleAction}
          currentStatus={collection.find(c => c.id === selectedMedia.id)?.status}
          language={language}
        />
      )}
    </div>
  );
};

const FilmIcon = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
)

const Info = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
)

export default App;