import React from 'react';
import { ArrowDownAZ, Calendar, Star, ArrowUpNarrowWide, ArrowDownWideNarrow, Grid3X3, Grid2X2, LayoutGrid } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/i18n';

export type SortType = 'dateAdded' | 'releaseDate' | 'rating' | 'title';
export type SortOrder = 'asc' | 'desc';

interface FilterBarProps {
  sortBy: SortType;
  setSortBy: (type: SortType) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  gridColumns: number;
  setGridColumns: (cols: number) => void;
  language: Language;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  sortBy, 
  setSortBy, 
  sortOrder, 
  setSortOrder,
  gridColumns,
  setGridColumns,
  language
}) => {
  const t = translations[language];
  
  const handleSortClick = (type: SortType) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc'); // Default to desc for most things
    }
  };

  const SortButton = ({ type, label, icon: Icon }: { type: SortType, label: string, icon: any }) => (
    <button
      onClick={() => handleSortClick(type)}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
        ${sortBy === type 
          ? 'bg-indigo-500/20 border-indigo-500/40 text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}
      `}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
      {sortBy === type && (
        sortOrder === 'asc' ? <ArrowUpNarrowWide size={12} /> : <ArrowDownWideNarrow size={12} />
      )}
    </button>
  );

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
      
      {/* Sort Controls */}
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
        <span className="text-xs text-gray-500 font-bold uppercase mr-2 shrink-0">{t.sortBy}:</span>
        <SortButton type="dateAdded" label={t.added} icon={Calendar} />
        <SortButton type="releaseDate" label={t.release} icon={Calendar} />
        <SortButton type="rating" label={t.rating} icon={Star} />
        <SortButton type="title" label={t.az} icon={ArrowDownAZ} />
      </div>

      {/* Grid Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-gray-500 font-bold uppercase mr-2 hidden sm:inline">{t.view}:</span>
        <div className="flex bg-black/20 rounded-lg p-1 border border-white/5">
            {[2, 3, 4, 5, 6].map((num) => (
                <button
                    key={num}
                    onClick={() => setGridColumns(num)}
                    className={`
                        w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-all
                        ${gridColumns === num 
                            ? 'bg-white/10 text-white shadow-inner' 
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                    `}
                    title={`${num} columns`}
                >
                    {num}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;