import React, { useState } from "react";
import { Search, Sparkles, SlidersHorizontal, Flame } from "lucide-react";

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
  const quickSearches = ["Momo", "Thakali", "Newari", "Samay Baji", "Chowmein", "Sel Roti", "Sasto"];

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
              Himalyan local spices & ingredients
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-serif italic text-[#FFF8F0] tracking-tight mb-4 leading-tight">
            Order Affordable <br className="hidden sm:inline" />
            <span className="text-[#FF6B35] font-sans font-extrabold not-italic tracking-normal">Traditional Nepali Food</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-medium mb-6">
            Connecting Low-to-Middle Income families with beloved local street stalls, Thakali kitchens, and Basantapur Samay Baji corners. Sabse Sasto dishes under Rs. 150!
          </p>

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
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-8 border-white/15 shadow-2xl relative bg-[#FFF8F0]/10 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=400"
              alt="Momo Steamer"
              className="object-cover w-full h-full scale-105"
            />
            {/* Overlay steam effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-4 text-left">
              <div className="flex items-center gap-1 text-[#FF6B35] font-bold text-xs bg-white/95 backdrop-blur px-2.5 py-1 rounded-full w-max">
                <Flame className="w-4 h-4 animate-bounce" />
                <span>Hot Dumpling Season</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
