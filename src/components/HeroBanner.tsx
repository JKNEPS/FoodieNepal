import React, { useState } from "react";
import { Search, Sparkles, SlidersHorizontal, Flame, UtensilsCrossed } from "lucide-react";

interface HeroBannerProps {
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
  activeFilterCount: number;
}

export default function HeroBanner({
  onSearch,
  onFilterToggle,
  activeFilterCount
}: HeroBannerProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Common quick cuisines in Nepal
  const quickSearches = ["Momo", "Thakali", "Newari", "Samay Baji", "Chowmein", "Sel Roti"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    onSearch(term);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#8B1A1A] via-[#731515] to-[#590C0C] text-white py-14 px-6 sm:px-12 rounded-3xl my-6 mx-auto max-w-7xl shadow-xl border border-[#8B1A1A]/20">
      {/* Absolute Decorative Blobs / Mountain Silhouettes hint in background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
      
      {/* Saffron Spiced Warm Banner Headers */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl text-left">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 mb-4 animate-bounce">
            <Sparkles className="w-4 h-4 text-[#FFF8F0]" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-[#FFF8F0] uppercase font-mono">
              Local Foods For Foodie!
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-serif italic text-[#FFF8F0] tracking-tight mb-4 leading-tight">
            Order Local & <br className="hidden sm:inline" />
            <span className="text-[#FF6B35] font-sans font-extrabold not-italic tracking-normal">Traditional Nepali Foods</span>
          </h1>

          {/* Saffron Autocomplete Autogenerate Search box */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-xl max-w-lg">
            <div className="flex items-center flex-1 px-2 text-gray-500">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                id="hero-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  onSearch(e.target.value);
                }}
                onFocus={() => setIsFocused(true)}
                placeholder="Search momos, thakali sets, street chiya..."
                className="w-full bg-transparent border-none text-gray-800 focus:outline-none placeholder-gray-400 text-sm py-2 px-1"
              />
            </div>
            
            <button
              type="button"
              onClick={onFilterToggle}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#FFF8F0] text-[#8B1A1A] hover:text-white hover:bg-[#2D6A4F] rounded-xl text-xs font-bold transition-all flex-shrink-0 border border-[#8B1A1A]/10"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white rounded-xl text-sm font-bold shadow-md shadow-[#FF6B35]/25 transition-all flex-shrink-0"
            >
              Find
            </button>
          </form>

          {/* Quick recommendations tag items */}
          <div className="flex flex-wrap items-center gap-2 mt-5 text-xs">
            <span className="text-gray-300 font-semibold font-mono uppercase tracking-wider text-[10px]">Try:</span>
            {quickSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSearch(term)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 hover:border-white/30 rounded-lg font-medium transition-all text-xs"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Steam Particle Food Banner Illustration */}
        <div className="relative flex items-center justify-center p-4">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-8 border-white/15 shadow-2xl relative bg-[#FFF8F0] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative p-7 bg-[#8B1A1A] rounded-3xl text-white shadow-xl shadow-[#8B1A1A]/25 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
                <UtensilsCrossed className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse text-[#FFF8F0]" />
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF6B35] rounded-full animate-ping border-2 border-white" />
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF6B35] rounded-full border-2 border-white" />
              </div>
              <div className="flex flex-col items-center">
                <span className="font-serif italic font-bold text-lg sm:text-xl text-[#8B1A1A] tracking-tight leading-none">
                  Foodie<span className="text-[#FF6B35] font-sans font-extrabold not-italic">Nepal</span>
                </span>
                <span className="text-[10px] text-[#2D6A4F] font-mono tracking-widest font-black uppercase mt-1">Official Brand</span>
              </div>
            </div>
            {/* Overlay steam effect indicators */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
              <div className="flex items-center gap-1 text-[#FF6B35] font-extrabold text-[10px] bg-white/95 backdrop-blur px-2.5 py-1 rounded-full w-max shadow-sm">
                <Flame className="w-3.5 h-3.5 animate-bounce" />
                <span>AUTHENTIC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
