import React, { useEffect, useState } from 'react';
import { TMDBResult, MediaDetails as MediaDetailsType, CollectionStatus, Language } from '../types';
import { fetchMediaDetails, getBackdropUrl, getImageUrl } from '../services/tmdbService';
import { ChevronLeft, Star, Play, Plus, Check, MoreHorizontal, Calendar, X, Share2, ExternalLink } from 'lucide-react';
import { translations, getTMDBLocale } from '../utils/i18n';

interface MediaDetailsProps {
  item: TMDBResult;
  onClose: () => void;
  onAction: (item: MediaDetailsType | TMDBResult, action: CollectionStatus | 'remove') => void;
  currentStatus?: CollectionStatus;
  language: Language;
}

const MediaDetails: React.FC<MediaDetailsProps> = ({ item, onClose, onAction, currentStatus, language }) => {
  const t = translations[language];
  const [details, setDetails] = useState<MediaDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [playTrailer, setPlayTrailer] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      const tmdbLocale = getTMDBLocale(language);
      const data = await fetchMediaDetails(item.id, item.media_type === 'movie' ? 'movie' : 'tv', tmdbLocale);
      setDetails(data);
      setLoading(false);
    };
    loadDetails();
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [item, language]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!details) return null;

  const title = details.title || details.name;
  const year = (details.release_date || details.first_air_date || '').split('-')[0];
  const trailer = details.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  // Get first 10 cast members for horizontal scroll
  const cast = details.credits.cast.slice(0, 10);
  
  const region = language === 'fr' ? 'FR' : 'US';
  const providers = details['watch/providers']?.results?.[region]?.flatrate || [];
  
  // Genres string (max 2)
  const genres = details.genres?.slice(0, 2).map(g => g.name).join(' • ');

  // Format runtime
  const formatRuntime = (mins?: number) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}min`;
  };
  const duration = details.runtime ? formatRuntime(details.runtime) : (details.number_of_seasons ? `${details.number_of_seasons} ${t.seasons}` : '');

  return (
    <div className="fixed inset-0 z-[60] bg-black text-white overflow-hidden animate-fade-in font-sans">
      
      {/* 1. Dynamic Background Layers */}
      <div className="absolute inset-0 z-0">
         {/* Top Backdrop (Sharper) */}
         <div className="absolute top-0 w-full h-[60vh] opacity-60">
             <img 
               src={getBackdropUrl(details.backdrop_path)} 
               alt="" 
               className="w-full h-full object-cover mask-image-b-fade"
               style={{ maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}
             />
         </div>
         
         {/* Full Screen Ambient Blur (The "Wallpaper" Color) */}
         <div className="absolute inset-0">
             <img 
               src={getImageUrl(details.poster_path)} 
               alt="" 
               className="w-full h-full object-cover blur-[80px] opacity-50 scale-125"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent" />
         </div>
      </div>

      {/* 2. Scrollable Content */}
      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden pb-20 no-scrollbar">
        
        {/* Header Actions */}
        <div className="sticky top-0 z-50 flex justify-between items-center p-4 md:p-8">
            <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/30 transition-colors shadow-lg"
            >
                <ChevronLeft size={24} />
            </button>
            
            <button 
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                onClick={() => {
                   // Share functionality mock
                   if (navigator.share) {
                       navigator.share({ title: title, text: details.overview, url: window.location.href });
                   }
                }}
            >
                <Share2 size={20} />
            </button>
        </div>

        <div className="px-6 flex flex-col items-center max-w-2xl mx-auto">
            
            {/* Poster - Centered Floating */}
            <div className="relative w-48 md:w-64 aspect-[2/3] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-6 mt-2 animate-scale-in">
                <img 
                    src={getImageUrl(details.poster_path)} 
                    alt={title} 
                    className="w-full h-full object-cover rounded-2xl border border-white/10"
                />
            </div>

            {/* Title & Metadata */}
            <div className="text-center w-full mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-md">
                    {title}
                </h1>
                
                <div className="flex items-center justify-center gap-3 text-sm font-medium text-gray-300/90">
                    <span>{year}</span>
                    {duration && <><span>•</span><span>{duration}</span></>}
                    {genres && <><span>•</span><span className="truncate max-w-[150px]">{genres}</span></>}
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star size={14} className="fill-current" />
                        <span>{details.vote_average.toFixed(1)}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full mb-8">
                <button
                    onClick={() => onAction(details, 'watchlist')}
                    className={`
                        flex-1 h-12 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95
                        ${currentStatus === 'watchlist' 
                            ? 'bg-white text-black' 
                            : 'bg-gradient-to-r from-[#FF8B71] to-[#FF5E62] text-white'}
                    `}
                >
                    {currentStatus === 'watchlist' ? (
                        <><Check size={20} /> {t.inWatchlist}</>
                    ) : (
                        <><Plus size={20} /> {t.addToWatchlist}</>
                    )}
                </button>
                
                <button
                    onClick={() => onAction(details, 'seen')}
                    className={`
                        w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors shadow-lg
                        ${currentStatus === 'seen' 
                            ? 'bg-emerald-500/80 border-emerald-400 text-white' 
                            : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}
                    `}
                >
                    {currentStatus === 'seen' ? <Check size={20} /> : <div className="text-xs font-bold">Vue</div>}
                </button>

                <button
                    onClick={() => onAction(details, 'remove')}
                    className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md text-white hover:bg-white/20 shadow-lg"
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Streaming Providers */}
            {providers.length > 0 && (
                <div className="w-full flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex -space-x-2 overflow-hidden">
                        {providers.slice(0, 4).map(p => (
                            <img 
                                key={p.provider_id}
                                src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                                alt={p.provider_name}
                                className="w-10 h-10 rounded-xl border-2 border-[#0f172a] shadow-sm"
                            />
                        ))}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Provided by</span>
                        <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                            <Play size={12} className="fill-current" /> JustWatch
                        </div>
                    </div>
                </div>
            )}

            {/* Overview */}
            <div className="w-full mb-8">
                <p className="text-gray-300 leading-relaxed text-sm md:text-base text-justify">
                    {details.overview}
                </p>
            </div>

            {/* Extras / Trailer */}
            {trailer && (
                <div className="w-full mb-8">
                    <h3 className="text-lg font-bold text-white mb-4">Extras</h3>
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                         {!playTrailer ? (
                            <div 
                                className="absolute inset-0 group cursor-pointer"
                                onClick={() => setPlayTrailer(true)}
                            >
                                <img 
                                    src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`} 
                                    alt="Trailer" 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80" />
                                <div className="absolute bottom-4 left-4">
                                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1 block">{t.officialTrailer}</span>
                                    <h4 className="text-white font-bold text-lg truncate pr-4">{trailer.name}</h4>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                        <Play size={24} className="fill-white text-white ml-1" />
                                    </div>
                                </div>
                            </div>
                         ) : (
                            <iframe 
                                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1&rel=0&origin=${window.location.origin}`} 
                                title="YouTube video player" 
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                         )}
                    </div>
                    {playTrailer && (
                         <a 
                            href={`https://www.youtube.com/watch?v=${trailer.key}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-3 text-xs text-gray-500 hover:text-white flex items-center justify-center gap-1 transition-colors"
                        >
                            <ExternalLink size={10} /> {t.openInYoutube}
                        </a>
                    )}
                </div>
            )}

            {/* Cast & Crew */}
            <div className="w-full mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    {t.topCast} <span className="text-gray-500 text-sm font-normal">›</span>
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x">
                    {cast.map(actor => (
                        <div key={actor.id} className="snap-start shrink-0 w-24 flex flex-col items-center gap-2">
                            <div className="w-24 h-32 rounded-xl overflow-hidden shadow-lg bg-gray-800 border border-white/10">
                                <img 
                                    src={getImageUrl(actor.profile_path)} 
                                    alt={actor.name} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-center w-full">
                                <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{actor.character}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Next Episode (If TV) */}
            {details.next_episode_to_air && (
                <div className="w-full bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-5 mb-8 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-500 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">{t.nextEpisode}</span>
                            <h4 className="text-white font-bold">{details.next_episode_to_air.air_date}</h4>
                        </div>
                    </div>
                    <div className="mt-2 pl-[52px]">
                         <p className="text-sm text-white font-medium">S{details.next_episode_to_air.season_number}E{details.next_episode_to_air.episode_number}: "{details.next_episode_to_air.name}"</p>
                         <p className="text-xs text-gray-400 mt-1 line-clamp-2">{details.next_episode_to_air.overview}</p>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default MediaDetails;