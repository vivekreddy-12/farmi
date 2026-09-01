import React, { useState, useMemo } from 'react';
import { CropGuide } from '../types';

interface KnowledgeScreenProps {
  cropGuides: CropGuide[];
  onSelectCropGuide: (guide: CropGuide) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const KnowledgeScreen: React.FC<KnowledgeScreenProps> = ({
  cropGuides,
  onSelectCropGuide,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Cereals', 'Vegetables', 'Fruits'];

  const filteredGuides = useMemo(() => {
    return cropGuides.filter((crop) => {
      const matchesCategory =
        selectedCategory === 'All' || crop.category === selectedCategory;
      const matchesSearch =
        crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.recommendedHeader.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.basal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.topDressing.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [cropGuides, selectedCategory, searchQuery]);

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-5 py-8 pb-24 md:pb-12 space-y-8">
      {/* Title & Subtitle with Farm Landscape Texture */}
      <div className="bg-[#111A13]/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border-2 border-[#1E2E21] shadow-sm relative overflow-hidden">
        {/* Farm Photo Ambient Background Watermark */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 bg-cover bg-center mix-blend-screen"
          style={{ backgroundImage: `url('/src/assets/images/dark_farm_field_1788272012797.jpg')` }}
        />

        <div className="relative z-10">
          <div className="inline-block bg-[#84CC16] text-[#0B110D] text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-3">
            Knowledge System
          </div>
          <h1 className="font-['Space_Grotesk',sans-serif] text-3xl sm:text-4xl font-extrabold text-[#F1F5F2] mb-2 tracking-tight">
            Agronomy Knowledge Hub
          </h1>
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-base text-[#9CAFA0] max-w-3xl leading-relaxed font-medium">
            Comprehensive field manuals, nutrient deficiency diagnostics, and stage-by-stage application protocols for high-yield farming.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="relative z-10 flex flex-col md:flex-row gap-3 mt-6 pt-6 border-t border-[#1E2E21]">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#84CC16] text-[22px]">
              search
            </span>
            <input
              className="w-full h-12 pl-12 pr-10 rounded-lg bg-[#16241A] border-2 border-[#1E2E21] focus:bg-[#111A13] focus:border-[#84CC16] font-['Plus_Jakarta_Sans',sans-serif] text-sm text-[#F1F5F2] transition-all placeholder:text-[#6B7F6E] outline-none font-bold"
              placeholder="Search crops, fertilizers, NPK formulas..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CAFA0] hover:text-[#84CC16] p-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 h-12 rounded-lg font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider font-extrabold flex-shrink-0 flex items-center justify-center transition-all duration-150 active:scale-95 border-2 ${
                  selectedCategory === cat
                    ? 'bg-[#84CC16] text-[#0B110D] border-[#84CC16] shadow-sm'
                    : 'bg-[#16241A] border-[#1E2E21] text-[#9CAFA0] hover:border-[#84CC16] hover:text-[#F1F5F2]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid (Bento style) */}
      {filteredGuides.length === 0 ? (
        <div className="bg-[#111A13] rounded-xl p-12 text-center border-2 border-[#1E2E21] max-w-lg mx-auto shadow-sm">
          <span className="material-symbols-outlined text-5xl text-[#84CC16] mb-3">
            search_off
          </span>
          <h3 className="font-['Space_Grotesk',sans-serif] text-xl font-extrabold text-[#F1F5F2] mb-1">
            No crops or guides found
          </h3>
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-sm text-[#9CAFA0] mb-5">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              setSelectedCategory('All');
            }}
            className="px-5 py-2.5 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider font-extrabold rounded-lg border-2 border-[#84CC16] hover:bg-[#99E321]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((crop) => (
            <article
              key={crop.id}
              className="bg-[#111A13] rounded-xl border-2 border-[#1E2E21] overflow-hidden flex flex-col transition-all hover:border-[#84CC16]/60 duration-200 shadow-sm group"
            >
              {/* Image with animated tags */}
              <div className="h-48 w-full relative overflow-hidden bg-[#16241A]">
                <img
                  className={`w-full h-full object-cover ${
                    crop.id === 'crop-rice'
                      ? 'animate-wind-sway'
                      : 'group-hover:scale-105 transition-transform duration-500'
                  }`}
                  alt={crop.name}
                  src={crop.image}
                />
                <div className="absolute top-3 left-3 bg-[#84CC16] text-[#0B110D] px-2.5 py-1 rounded font-['Space_Grotesk',sans-serif] text-[10px] font-black uppercase tracking-wider shadow-xs z-10">
                  {crop.badgeCategory}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-4">
                  <h2 className="font-['Space_Grotesk',sans-serif] text-xl font-extrabold text-[#F1F5F2] tracking-tight group-hover:text-[#84CC16] transition-colors">
                    {crop.name}
                  </h2>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#9CAFA0] mt-1 line-clamp-2 font-medium">
                    {crop.description}
                  </p>
                </div>

                {/* Recommended box */}
                <div className="bg-[#16241A] p-4 rounded-lg mb-5 flex-grow border border-[#1E2E21]">
                  <h3 className="font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider text-[#84CC16] mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#84CC16] text-[18px]">
                      {crop.recommendedIcon}
                    </span>
                    {crop.recommendedHeader}
                  </h3>
                  <ul className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#9CAFA0] space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#84CC16] text-[16px] mt-0.5 shrink-0 font-black">
                        check_circle
                      </span>
                      <span className="leading-snug text-[#F1F5F2]">{crop.basal}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#84CC16] text-[16px] mt-0.5 shrink-0 font-black">
                        check_circle
                      </span>
                      <span className="leading-snug text-[#F1F5F2]">{crop.topDressing}</span>
                    </li>
                  </ul>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onSelectCropGuide(crop)}
                  className="w-full h-12 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] rounded-lg font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest font-extrabold flex items-center justify-center transition-all active:scale-95 border-2 border-[#84CC16] shadow-sm"
                >
                  View Full Manual →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};
