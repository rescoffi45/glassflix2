import React, { useState, useRef, useEffect } from 'react';
import { TMDBResult, CollectionItem, CollectionStatus, Language } from '../types';
import { getImageUrl } from '../services/tmdbService';
import { Plus, Check, Eye, Trash2, Star, MoreVertical } from 'lucide-react';
import { translations } from '../utils/i18n';

interface GlassCardProps {
  item: TMDBResult | CollectionItem;
  onAction: (item: TMDBResult, action: CollectionStatus | 'remove') => void;
  onClick?: (item: TMDBResult) => void;
  isCollected?: boolean;
  currentStatus?: CollectionStatus;
  language: Language;
}

const GlassCard: React.FC<GlassCardProps> = ({ item, onAction, onClick, isCollected, currentStatus, language }) => {
  const t = translations[language];
  const title = item.title || item.name || 'Unknown Title';
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuAction = (e: React.MouseEvent, action: CollectionStatus | 'remove') => {
    e.stopPropagation();
    onAction(item, action);
    setShowMenu(false);
  };

  return (
    <div 
      className="group relative w-full aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer bg-gray-900"
      onClick={() => onClick?.(item)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Background Image */}
      <img
        src={getImageUrl(item.poster_path)}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

      {/* Top Left Status Badge */}
      {isCollected && (
        <div className="absolute top-2 left-2 z-20">
          <span className={`
            px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-lg
            ${currentStatus === 'seen' 
              ? 'bg-emerald-500/80 border-emerald-400/50 text-white' 
              : 'bg-indigo-500/80 border-indigo-400/50 text-white'}
          `}>
            {currentStatus === 'watchlist' ? t.toWatch : t.seen}
          </span>
        </div>
      )}

      {/* Top Right Menu Button */}
      <div className="absolute top-2 right-2 z-30" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className={`
            p-1.5 rounded-full backdrop-blur-md text-white border border-white/10 transition-all duration-200
            ${showMenu ? 'bg-black/60 opacity-100' : 'bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 focus:opacity-100'}
            /* Ensure visibility on touch devices where hover is not applicable by default interactions or add a specific class if needed, 
               but group-hover usually works fine on tap for some devices. 
               To be safe for mobile functionality, we can make it always slightly visible or visible on interaction. 
               Given the request "hide buttons", opacity-0 -> 100 on hover is the cleanest desktop look. 
               On mobile, the user can tap the details to see buttons, or tap the corner if they know it's there. 
               For better UX, we'll keep it visible but subtle on small screens. */
            sm:opacity-0 sm:group-hover:opacity-100 opacity-100
          `}
        >
           <MoreVertical size={18} />
        </button>
        
        {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-[#1a202c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col z-40 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                {!isCollected ? (
                    <>
                        <button 
                            onClick={(e) => handleMenuAction(e, 'watchlist')}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 text-left transition-colors"
                        >
                            <Plus size={16} className="text-indigo-400" /> {t.watch}
                        </button>
                        <button 
                            onClick={(e) => handleMenuAction(e, 'seen')}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 text-left transition-colors"
                        >
                            <Eye size={16} className="text-emerald-400" /> {t.seen}
                        </button>
                    </>
                ) : (
                    <>
                         {currentStatus !== 'watchlist' && (
                             <button 
                                onClick={(e) => handleMenuAction(e, 'watchlist')}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 text-left transition-colors"
                             >
                                <Plus size={16} className="text-indigo-400" /> {t.watch}
                             </button>
                         )}
                         {currentStatus !== 'seen' && (
                            <button 
                                onClick={(e) => handleMenuAction(e, 'seen')}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 text-left transition-colors"
                            >
                                <Check size={16} className="text-emerald-400" /> {t.markSeen}
                            </button>
                         )}
                        <div className="h-px bg-white/10 mx-2 my-1"></div>
                        <button 
                            onClick={(e) => handleMenuAction(e, 'remove')}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/20 text-left transition-colors"
                        >
                            <Trash2 size={16} /> {t.remove}
                        </button>
                    </>
                )}
            </div>
        )}
      </div>

      {/* Glass Content Overlay (Text only) */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-md mb-1">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
            <span>{year}</span>
            <span>•</span>
            <div className="flex items-center text-yellow-400">
              <Star size={10} className="fill-current mr-1" />
              {item.vote_average.toFixed(1)}
            </div>
            <span>•</span>
            <span className="uppercase">{item.media_type}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassCard;