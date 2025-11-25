
import React, { useState, useEffect } from 'react';
import { TMDBResult, Language } from '../types';
import { getBackdropUrl } from '../services/tmdbService';
import { Star, PlayCircle, Info } from 'lucide-react';
import { translations } from '../utils/i18n';

interface HeroSliderProps {
  items: TMDBResult[];
  onClick: (item: TMDBResult) => void;
  language: Language;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ items, onClick, language }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const t = translations[language];

  // Auto-play
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [items]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const title = currentItem.title || currentItem.name;
  const year = (currentItem.release_date || currentItem.first_air_date || '').split('-')[0];

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-10 group cursor-pointer border border-white/5" onClick={() => onClick(currentItem)}>
      
      {/* Background Slides */}
      {items.map((item, index) => (
        <div 
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <img 
            src={getBackdropUrl(item.backdrop_path)} 
            alt="" 
            className="w-full h-full object-cover transition-transform duration-[6000ms] ease-linear scale-100 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 via-transparent to-transparent md:via-[#0f172a]/20" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-2xl animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white border border-white/10">
            {t.trending}
          </span>
          <div className="flex items-center gap-1 text-yellow-400 bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">
            <Star size={12} className="fill-current" />
            <span className="text-xs font-bold">{currentItem.vote_average.toFixed(1)}</span>
          </div>
        </div>

        <h2 className="text-2xl md:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg line-clamp-2">
          {title}
        </h2>
        
        <p className="text-gray-300 text-sm md:text-base line-clamp-2 mb-6 max-w-lg drop-shadow-md">
          {currentItem.overview}
        </p>

        <div className="flex items-center gap-3">
           <button className="px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
              <PlayCircle size={20} /> {t.watch}
           </button>
           <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-colors">
              <Info size={20} /> {t.overview}
           </button>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {items.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
