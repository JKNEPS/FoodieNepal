import { useState, useEffect } from "react";
import { Star, MapPin, Bike, ArrowRight, ShieldCheck, Heart, Sparkles, Flame, Store, ShoppingBasket } from "lucide-react";
import HeroBanner from "../components/HeroBanner";
import { Restaurant, MenuItem, GroceryItem } from "../types";

interface HomeProps {
  onSelectRestaurant: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCartDirect: (item: MenuItem, restId: string, restName: string) => void;
  onCookAnimation: (item: MenuItem) => void;
  onARPreview: (item: MenuItem) => void;
  onSelectGroceryItem: (item: GroceryItem, qty: number) => void;
}

export default function Home({
  onSelectRestaurant,
  favorites,
  onToggleFavorite,
  onAddToCartDirect,
  onCookAnimation,
  onARPreview,
  onSelectGroceryItem
}: HomeProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"food" | "fresh">("food");
  
  // Custom filter sliders
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Fetch Restaurants and Groceries on load
  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurants(data))
      .catch((err) => console.error(err));

    fetch("/api/grocery")
      .then((res) => res.json())
      .then((data) => setGroceries(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const categories = [
    { name: "Momo", icon: "🥟" },
    { name: "Newari", icon: "🥩" },
    { name: "Thakali", icon: "🥣" },
    { name: "Chowmein", icon: "🍝" },
    { name: "Street Food", icon: "🌶️" },
    { name: "Traditional", icon: "🫓" },
    { name: "Bakery", icon: "🍪" }
  ];

  // Filter restaurants based on query guidelines
  const filteredRestaurants = restaurants.filter((rest) => {
    const matchesSearch =
      rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.cuisineTypes.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rest.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory
      ? rest.cuisineTypes.includes(selectedCategory)
      : true;

    const matchesRating = rest.rating >= minRating;

    return matchesSearch && matchesCategory && matchesRating;
  });

  // Extract a list of all "Sabse Sasto" items under Rs. 150 for immediate ordering
  const sastoMenuItems: { item: MenuItem; restaurantId: string; restaurantName: string }[] = [];
  // Hardcoded mapping of items in server.ts
  const sampleSastoItems = [
    {
      restaurantId: "rest_1",
      restaurantName: "Momo House & Newari Delicacy",
      item: {
        id: "item_101",
        name: "Steam Buff Momo",
        price: 130,
        description: "Nepali style dumplings stuffed with spiced minced buffalo meat, steamed to perfection.",
        category: "Momo",
        image: "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=400",
        spiceLevel: "Medium" as const,
        isVeg: false,
        ingredients: [
          { name: "Maida Flour", icon: "🌾", xOffset: -120, yOffset: -80 },
          { name: "Minced Buff/Chicken", icon: "🥩", xOffset: 120, yOffset: -80 },
          { name: "Ginger-Garlic", icon: "🧄", xOffset: -150, yOffset: 120 }
        ]
      }
    },
    {
      restaurantId: "rest_4",
      restaurantName: "Dal-Bhat Kamalpokhari Express",
      item: {
        id: "item_401",
        name: "Classic Veg Dal Bhat Thali",
        price: 130,
        description: "Delightful Nepali Dal Bhat. Daily hand-milled rice, cream yellow lentils, seasonal mixed curry, radish-cucumber pickle.",
        category: "Nepali",
        image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=400",
        spiceLevel: "Mild" as const,
        isVeg: true,
        ingredients: [
          { name: "Rice", icon: "🌾", xOffset: -100, yOffset: 100 },
          { name: "Dal", icon: "🥣", xOffset: 50, yOffset: 150 }
        ]
      }
    },
    {
      restaurantId: "rest_5",
      restaurantName: "Basantapur Sweet & Selroti Pasal",
      item: {
        id: "item_502",
        name: "Piped Sel Roti with Alu Achar",
        price: 90,
        description: "A traditional ring-shaped crispy sweet rice bread, deep-fried in ghee, served with sesame potato salad.",
        category: "Traditional",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
        spiceLevel: "Medium" as const,
        isVeg: true,
        ingredients: [
          { name: "Rice", icon: "🌾", xOffset: -100, yOffset: 100 },
          { name: "Ghee", icon: "🧈", xOffset: 80, yOffset: -120 }
        ]
      }
    },
    {
      restaurantId: "rest_6",
      restaurantName: "Lalitpur Chowmein",
      item: {
        id: "item_601",
        name: "Classic Buff Chowmein",
        price: 110,
        description: "Nepali wok-fired wheat noodles tossed with sautéed buffalo meat and dark soy.",
        category: "Chowmein",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400",
        spiceLevel: "Medium" as const,
        isVeg: false,
        ingredients: []
      }
    },
    {
      restaurantId: "rest_10",
      restaurantName: "Baneshwor Lassi & Chatpat Corner",
      item: {
        id: "item_1001",
        name: "Spicy Basantapur Chatpat",
        price: 50,
        description: "Crunchy puffed rice mixed in raw green chilies, boiled potatoes, chopped onions, and mustard oil.",
        category: "Street Food",
        image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=400",
        spiceLevel: "Spicy" as const,
        isVeg: true,
        ingredients: []
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      
      {/* Animated Hero Header */}
      <HeroBanner
        onSearch={handleSearch}
        onFilterToggle={() => setShowFilters(!showFilters)}
        activeFilterCount={(minRating > 0 ? 1 : 0)}
      />

      {/* Filter Options Side Panel HUD */}
      {showFilters && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md mb-6 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-bold text-gray-700">Minimum Partner Rating:</span>
            <div className="flex items-center gap-1.5">
              {[0, 4.0, 4.5, 4.8].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(stars)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${minRating === stars ? "bg-[#2D6A4F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {stars === 0 ? "All" : `${stars} ★ +`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setMinRating(0);
              setSearchQuery("");
              setSelectedCategory(null);
            }}
            className="text-xs font-bold text-[#8B1A1A] hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Cuisines categories horizontally sliding */}
      <div className="mb-10">
        <h2 className="text-xl font-serif italic font-bold text-[#8B1A1A] text-left mb-4">Explore Local Nepali Cuisines</h2>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-xs ${selectedCategory === null ? "bg-[#8B1A1A] text-white border border-[#8B1A1A]" : "bg-white text-gray-750 hover:bg-gray-50 border border-[#8B1A1A]/10"}`}
              >
                🍴 All Foods
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-xs ${selectedCategory === cat.name ? "bg-[#FF6B35] text-white border border-[#FF6B35]" : "bg-white text-gray-750 hover:bg-gray-50 border border-[#8B1A1A]/10"}`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SABSE SASTO: BUDGET SECTION FOR LOW INCOME FAMILIES! (Under Rs 150) */}
          <div className="bg-gradient-to-r from-[#FFF8F0] to-[#FFE8D6] p-6 rounded-3xl border border-[#8B1A1A]/10 mb-12 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
              <div>
                <div className="flex items-center gap-2 text-[#FF6B35] font-black text-xs uppercase tracking-wider bg-white px-2.5 py-1 rounded-full w-max border border-orange-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  Customer Choice Kitchen
                </div>
                <h2 className="text-2xl font-serif italic text-[#8B1A1A] mt-1 font-bold">Popular Dishes (Under Rs. 150)</h2>
                <p className="text-xs text-gray-550 font-medium font-serif italic">Nutritious and delicious traditional dishes sourced from partner local stands.</p>
              </div>
              <span className="text-[10px] font-extrabold text-[#2D6A4F] font-mono tracking-widest uppercase bg-white px-3 py-1.5 rounded-xl border border-[#8B1A1A]/5">
                ★ Direct Partner
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {sampleSastoItems.map((sasto) => (
                <div key={sasto.item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 hover:shadow-md transition-all flex flex-col justify-between text-left">
                  <div className="relative rounded-xl overflow-hidden mb-2.5 aspect-video">
                    <img src={sasto.item.image} alt={sasto.item.name} className="object-cover w-full h-full" />
                    <span className="absolute bottom-1 right-1 bg-[#2D6A4F] text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded leading-none">
                      Rs. {sasto.item.price}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-900 truncate leading-tight">{sasto.item.name}</h4>
                    <span className="text-[9px] text-gray-400 font-bold block truncate mt-0.5">{sasto.restaurantName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    <button
                      onClick={() => onCookAnimation(sasto.item as any)}
                      className="py-1 px-1 bg-gray-50 hover:bg-orange-50 text-[10px] text-center font-bold text-[#FF6B35] rounded-lg border border-gray-100"
                    >
                      Cook
                    </button>
                    <button
                      onClick={() => onAddToCartDirect(sasto.item as any, sasto.restaurantId, sasto.restaurantName)}
                      className="py-1 px-1 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white text-[10px] text-center font-bold rounded-lg"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN RESTAURANTS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-6 text-left">
              <div>
                <h2 className="text-2xl font-serif italic text-[#8B1A1A] font-bold">Featured Local Restaurants</h2>
                <p className="text-xs text-gray-550 font-medium">Fresh warm dishes directly from neighborhood standard kitchens</p>
              </div>
              <span className="text-xs text-[#FF6B35] font-extrabold hidden sm:inline">Showing {filteredRestaurants.length} places</span>
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700">No partner kitchens detected close to your query</h3>
                <p className="text-xs text-gray-400 mt-1">Try resetting the star ratings filter or look up local search coordinates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredRestaurants.map((rest) => (
                  <div
                    key={rest.id}
                    onClick={() => onSelectRestaurant(rest.id)}
                    className="editorial-card group text-left cursor-pointer flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Banner Wrapper */}
                      <div className="relative h-44 bg-gray-100">
                        <img src={rest.banner} alt={rest.name} className="object-cover w-full h-full group-hover:scale-101 transition-all" />
                        
                        {/* Favorite Heart toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(rest.id);
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-rose-500 hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-md border border-[#8B1A1A]/10"
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(rest.id) ? "fill-current" : ""}`} />
                        </button>

                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-md border border-[#8B1A1A]/10 text-[9px] font-extrabold font-mono text-[#8B1A1A] uppercase tracking-wider">
                          ⏱️ {rest.deliveryTimeCode}
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className="font-bold text-gray-900 group-hover:text-[#FF6B35] transition-colors text-base truncate flex-1">
                            {rest.name}
                          </h3>
                          <span className="bg-[#2D6A4F]/10 text-[#2D6A4F] font-black text-xs px-2 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-[#2D6A4F]" />
                            {rest.rating.toFixed(1)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-550 font-medium mb-3 truncate">{rest.address}</p>

                        {/* Cuisine chips */}
                        <div className="flex flex-wrap items-center gap-1 mb-4">
                          {rest.cuisineTypes.map((c) => (
                            <span key={c} className="bg-[#FFF8F0] border border-[#8B1A1A]/5 text-[#8B1A1A]/85 text-[9px] font-bold px-2.5 py-1 rounded-md">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Delivery metadata footer line */}
                    <div className="border-t border-[#8B1A1A]/10 px-5 py-3.5 bg-[#FFF8F0]/30 flex items-center justify-between text-xs text-gray-700 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Bike className="w-4 h-4 text-[#FF6B35]" />
                        <span>Delivery Rs. {rest.deliveryFee}</span>
                      </div>
                      <span className="text-[#8B1A1A] font-extrabold">Min. order Rs. {rest.minOrder}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
    </div>
  );
}
