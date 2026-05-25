import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, SlidersHorizontal, Flame, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeroBannerProps {
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
  activeFilterCount: number;
  menuItems?: any[];
}

export default function HeroBanner({
  onSearch,
  onFilterToggle,
  activeFilterCount,
  menuItems = []
}: HeroBannerProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Common quick cuisines in Nepal
  const quickSearches = ["Momo", "Thakali", "Newari", "Samay Baji", "Chowmein", "Sel Roti"];

  // Debounce query search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close suggestion popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setIsFocused(false);
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    onSearch(term);
    setIsFocused(false);
  };

  // Matching algorithm for live search output
  const matchTerm = debouncedQuery.toLowerCase().trim();
  const matchingSuggestions = matchTerm
    ? (menuItems || []).filter(
        (item) =>
          item.name.toLowerCase().includes(matchTerm) ||
          item.category.toLowerCase().includes(matchTerm) ||
          (item.description && item.description.toLowerCase().includes(matchTerm))
      ).slice(0, 6)
    : [];

  const trendingSearches = [
    { name: "Momo", subtitle: "Traditional Nepalese Dumplings", category: "Momo", icon: "🥟", label: "Highly Demanded" },
    { name: "Thakali", subtitle: "Premium Himalayan Thali Sets", category: "Thakali", icon: "🥣", label: "Local Signature" },
    { name: "Samay Baji", subtitle: "Traditional Newari Feast Combo", category: "Newari", icon: "🥩", label: "Festival Favorite" },
    { name: "Chowmein", subtitle: "Wok-fried Spiced Noodles", category: "Chowmein", icon: "🍝", label: "Street Classic" },
    { name: "Sel Roti", subtitle: "Sweet Ring-shaped Crispy Bread", category: "Traditional", icon: "🫓", label: "Nepali Pride" }
  ];

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
          <div ref={searchContainerRef} className="relative w-full max-w-lg z-30">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-xl w-full group border border-transparent hover:border-orange-500/20 transition-all duration-300">
              <div className="flex items-center flex-1 px-2 text-gray-500">
                <Search className="w-5 h-5 text-gray-400 group-hover:scale-115 group-hover:rotate-12 group-hover:text-[#FF6B35] transition-all duration-300" />
                <input
                  id="hero-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    onSearch(e.target.value);
                  }}
                  onFocus={() => setIsFocused(true)}
                  placeholder="Search local Nepali street food, momos, thakali sets..."
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

            {/* 🍿 Dropdown Auto Suggest Box */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 3 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-96 w-full text-left"
                >
                  {/* Empty Input focused state ("Trending Local Searches") */}
                  {query.trim() === "" ? (
                    <div>
                      <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                          🔥 Trending Local Searches
                        </span>
                        <span className="text-[9px] bg-[#FF6B35]/15 text-[#FF6B35] font-black px-2 py-0.5 rounded-full font-mono">
                          Popular
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                        {trendingSearches.map((item) => {
                          const isHighPerforming = item.category === "Momo" || item.category === "Thakali";
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => {
                                setQuery(item.name);
                                onSearch(item.name);
                                setIsFocused(false);
                              }}
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                                isHighPerforming
                                  ? "bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-orange-500/15 hover:from-orange-500/10 hover:to-amber-500/10"
                                  : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                              }`}
                            >
                              <span className="text-xl flex-shrink-0">{item.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-bold text-gray-800 truncate">{item.name}</span>
                                  {isHighPerforming && (
                                    <span className="text-[8px] bg-[#FF6B35] text-white font-extrabold px-1.5 py-0.2 rounded-sm uppercase tracking-wider scale-90 shrink-0">
                                      Trending
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-gray-400 block truncate">{item.subtitle}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Non-Empty Input focused state ("Live Search Suggestions") */
                    <div>
                      <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                          🔎 Live Suggestions ({matchingSuggestions.length} found)
                        </span>
                        <span className="text-[9px] text-[#2D6A4F] bg-[#2D6A4F]/10 font-bold px-2 py-0.5 rounded-full font-mono">
                          Live Match
                        </span>
                      </div>

                      {matchingSuggestions.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 space-y-1">
                          <p className="text-xs font-bold text-gray-700">No exact matches for "{query}"</p>
                          <p className="text-[10px] text-gray-400 leading-normal">
                            Try searching for generic terms like "Momo", "Thakali Thali", or "Sel Roti"
                          </p>
                        </div>
                      ) : (
                        <div className="max-h-72 overflow-y-auto py-1">
                          {matchingSuggestions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setQuery(item.name);
                                onSearch(item.name);
                                setIsFocused(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-orange-50/40 transition-all text-left border-b border-gray-50 last:border-b-0 group font-sans"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-9 h-9 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-gray-800 truncate group-hover:text-[#8B1A1A] transition-colors">
                                    {item.name}
                                  </span>
                                  <span className="text-xs font-bold text-[#FF6B35] font-mono shrink-0">
                                    Rs. {item.price}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded uppercase tracking-wider scale-95 origin-left">
                                    {item.category}
                                  </span>
                                  <span className="text-[10px] text-gray-400 truncate">
                                    at {item.restaurantName || "Local Vendor"}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
