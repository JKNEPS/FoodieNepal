import { useState, useEffect } from "react";
import { Star, MapPin, Bike, ArrowRight, ShieldCheck, Heart, Sparkles, Flame, Store, ShoppingBasket, Plus, Clock, History } from "lucide-react";
import HeroBanner from "../components/HeroBanner";
import { Restaurant, MenuItem, GroceryItem, Order } from "../types";

interface HomeProps {
  onSelectRestaurant: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCartDirect: (item: MenuItem, restId: string, restName: string) => void;
  onCookAnimation: (item: MenuItem) => void;
  onARPreview: (item: MenuItem) => void;
  onSelectGroceryItem: (item: GroceryItem, qty: number) => void;
  customerAddress: string;
  onChangeAddress: (addr: string) => void;
  loyaltyPoints: number;
  onChangeLoyaltyPoints: (pts: number | ((p: number) => number)) => void;
  onTrackOrder: (order: Order) => void;
}

const LOYALTY_EXCHANGE_ITEMS = [
  {
    id: "loyalty_momo",
    name: "🎁 Points Steamed Buff Momo (6 pcs)",
    pointsRequired: 50,
    price: 0,
    description: "Points Special: Authentic mini plate of steamed dumplings seasoned to perfection.",
    category: "Momo",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400",
    spiceLevel: "Medium",
    isVeg: false,
    ingredients: []
  },
  {
    id: "loyalty_selroti",
    name: "🎁 Points Sel Roti with Chhiya (Set)",
    pointsRequired: 80,
    price: 0,
    description: "Points Special: Warm spiced ring bread served with a traditional cup of sweet milk tea.",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400",
    spiceLevel: "Mild",
    isVeg: true,
    ingredients: []
  },
  {
    id: "loyalty_chatamari",
    name: "🎁 Points Supreme Egg Chatamari",
    pointsRequired: 100,
    price: 0,
    description: "Points Special: Delightful thin crispy rice flour base topped with coriander and farm egg.",
    category: "Newari",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=400",
    spiceLevel: "Medium",
    isVeg: false,
    ingredients: []
  }
];

export default function Home({
  onSelectRestaurant,
  favorites,
  onToggleFavorite,
  onAddToCartDirect,
  onCookAnimation,
  onARPreview,
  onSelectGroceryItem,
  customerAddress,
  onChangeAddress,
  loyaltyPoints,
  onChangeLoyaltyPoints,
  onTrackOrder
}: HomeProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"food" | "fresh" | "history">("food");
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [redeemSuccess, setRedeemSuccess] = useState("");
  
  // Custom filter sliders
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const fetchOrderHistory = () => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort reverse chronologically
          setOrderHistory([...data].reverse());
        }
      })
      .catch((err) => console.error(err));
  };

  const handleRedeemLoyaltyItem = (loyaltyItem: typeof LOYALTY_EXCHANGE_ITEMS[number]) => {
    if (loyaltyPoints < loyaltyItem.pointsRequired) {
      return;
    }
    // Deduct points
    onChangeLoyaltyPoints((prev) => prev - loyaltyItem.pointsRequired);
    // Add to cart with zero price directly
    const convertedItem: MenuItem = {
      id: loyaltyItem.id,
      name: loyaltyItem.name,
      price: 0,
      description: loyaltyItem.description,
      category: loyaltyItem.category,
      image: loyaltyItem.image,
      spiceLevel: loyaltyItem.spiceLevel as any,
      isVeg: loyaltyItem.isVeg,
      ingredients: []
    };
    onAddToCartDirect(convertedItem, "points_exchange", "FoodiePoints Rewards Hub");
    // Show success banner
    setRedeemSuccess(`Successfully redeemed "${loyaltyItem.name.replace("🎁 Points ", "")}"! Added directly to your Cart at Rs. 0.`);
    setTimeout(() => setRedeemSuccess(""), 4500);
  };

  // Fetch Restaurants, Groceries, and Order History on load
  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurants(data))
      .catch((err) => console.error(err));

    fetch("/api/grocery")
      .then((res) => res.json())
      .then((data) => setGroceries(data))
      .catch((err) => console.error(err));

    fetchOrderHistory();
    const interval = setInterval(fetchOrderHistory, 10000);
    return () => clearInterval(interval);
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
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md mb-6 flex flex-wrap items-center justify-between gap-4 animate-fadeIn text-left">
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

      {/* Current Delivery Location GPS HUD Picker */}
      <div className="bg-[#121620] text-white p-4 sm:p-5 rounded-3xl border border-gray-800 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="p-3 bg-[#FF6B35]/15 rounded-2xl border border-[#FF6B35]/20 flex-shrink-0 animate-pulse">
            <MapPin className="w-5 h-5 text-[#FF6B35]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-orange-400 font-extrabold block">GPS Active Destination</span>
            <p className="text-xs text-gray-300 font-black truncate mt-0.5" title={customerAddress}>{customerAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search Pokhara address..."
            defaultValue={customerAddress}
            id="gps-address-input-spot"
            className="bg-gray-950 border border-gray-800 focus:border-[#FF6B35] px-4 py-2 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none w-full md:w-64"
          />
          <button
            onClick={() => {
              const input = document.getElementById("gps-address-input-spot") as HTMLInputElement;
              if (input && input.value.trim()) {
                onChangeAddress(input.value.trim());
              }
            }}
            className="px-4 py-2 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-2xl transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            Update Location Area
          </button>
        </div>
      </div>

      {/* Tabs Layout Switcher */}
      <div className="flex border-b border-gray-150 mb-8 overflow-x-auto scroller-hidden gap-1">
        <button
          onClick={() => setActiveTab("food")}
          className={`pb-3 px-6 text-sm font-serif italic font-bold border-b-22 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "food" ? "border-b-2 border-[#FF6B35] text-[#FF6B35]" : "border-b-2 border-transparent text-gray-455 hover:text-gray-900"}`}
        >
          <Store className="w-4 h-4" />
          <span>Nepali Food Menu & Feast Bazaar</span>
        </button>
        <button
          onClick={() => setActiveTab("fresh")}
          className={`pb-3 px-6 text-sm font-serif italic font-bold border-b-22 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "fresh" ? "border-b-2 border-[#FF6B35] text-[#FF6B35]" : "border-b-2 border-transparent text-gray-455 hover:text-gray-900"}`}
        >
          <ShoppingBasket className="w-4 h-4" />
          <span>Fresh Mandi & Organic Pantry</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-6 text-sm font-serif italic font-bold border-b-22 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === "history" ? "border-b-2 border-[#FF6B35] text-[#FF6B35]" : "border-b-2 border-transparent text-gray-455 hover:text-gray-900"}`}
        >
          <Clock className="w-4 h-4" />
          <span>Order Dispatch History Logs</span>
        </button>
      </div>

      {/* CONDITIONAL RENDER VIEWS */}
      
      {activeTab === "food" && (
        <div className="space-y-12">
          {/* POINTS EXCHANGES MINI BANNER HUD */}
          <div className="bg-[#121620] p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden text-left text-white mb-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-[#FF6B35] font-black text-[10px] uppercase tracking-widest bg-[#FF6B35]/10 px-3 py-1 rounded-full border border-[#FF6B35]/20 w-max">
                  💸 Loyalty Reward Hub
                </div>
                <h3 className="text-2xl font-serif italic text-white mt-2 font-bold flex items-center gap-2">
                  <span>🎁 Points Food Exchange Bazaar</span>
                </h3>
                <p className="text-xs text-gray-400 max-w-xl leading-relaxed mt-0.5">
                  Redeem your foodie loyalty points here instantly for zero-price gourmet delicacies! Points are loaded automatically from orders.
                </p>
              </div>

              <div className="bg-gradient-to-r from-orange-500/20 to-[#8B1A1A]/30 px-5 py-3 rounded-2xl border border-orange-500/30 flex items-center gap-3.5 shadow-lg">
                <span className="text-2xl animate-spin-slow">🌟</span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFF8F0]/65 block font-bold">Your Available Points</span>
                  <span className="text-xl font-black text-amber-300 font-mono">{loyaltyPoints} pts</span>
                </div>
              </div>
            </div>

            {redeemSuccess && (
              <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-2xl text-xs font-bold font-mono tracking-wide mb-4 animate-fadeIn flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span>{redeemSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {LOYALTY_EXCHANGE_ITEMS.map((item) => {
                const countNeeded = item.pointsRequired;
                const hasEnough = loyaltyPoints >= countNeeded;
                return (
                  <div key={item.id} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-3.5 flex flex-col justify-between hover:border-[#FF6B35]/30 transition-all">
                    <div className="relative rounded-xl overflow-hidden mb-3 aspect-video">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full filter brightness-90 hover:scale-101 transition-all" referrerPolicy="no-referrer" />
                      <span className="absolute bottom-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-950 font-black text-[10px] px-2.5 py-1 rounded-lg leading-none shadow-md">
                        Cost: {countNeeded} pts
                      </span>
                    </div>

                    <div className="text-left">
                      <h4 className="font-extrabold text-[#FFF8F0] text-xs leading-tight">{item.name.replace("🎁 Points ", "")}</h4>
                      <p className="text-[10px] text-gray-400 leading-snug font-medium mt-1 pr-1">{item.description}</p>
                    </div>

                    <button
                      disabled={!hasEnough}
                      onClick={() => handleRedeemLoyaltyItem(item)}
                      className={`mt-4 py-2 px-3 text-xs font-bold text-center rounded-xl transition-all ${
                        hasEnough
                          ? "bg-gradient-to-r from-[#FF6B35] to-orange-600 hover:from-emerald-600 hover:to-emerald-700 text-white cursor-pointer shadow-md"
                          : "bg-gray-800 text-gray-500 border border-gray-700/60 cursor-not-allowed"
                      }`}
                    >
                      {hasEnough ? "🎁 Redeem for Free!" : `Locked (Need ${countNeeded} pts)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cuisines categories horizontally sliding */}
          <div>
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
      )}

      {activeTab === "fresh" && (
        <div className="space-y-6 text-left animate-fadeIn">
          <div>
            <h2 className="text-2xl font-serif italic text-[#2D6A4F] font-bold">Fresh Mandi & Organic Pantry</h2>
            <p className="text-xs text-gray-550 font-medium">Directly from local organic cooperative farms to your kitchen</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {groceries.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl border border-gray-150 p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                <div className="relative rounded-2xl overflow-hidden mb-3 aspect-square bg-[#FFF8F0]/40 flex items-center justify-center">
                  <img src={item.image} alt={item.name} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                  <span className="absolute top-2 left-2 bg-[#2D6A4F] text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg border border-emerald-600/25">
                    {item.unit}
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#8B1A1A] text-sm truncate leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-gray-450 font-medium mt-0.5 truncate">{item.category}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900 text-xs">Rs. {item.price}</span>
                  <button
                    onClick={() => onSelectGroceryItem(item, 1)}
                    className="bg-[#2D6A4F] hover:bg-[#1a3d2e] text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    + Carry Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-6 text-left animate-fadeIn">
          <div>
            <h2 className="text-2xl font-serif italic text-[#8B1A1A] font-bold">Your Past & Active Consignments</h2>
            <p className="text-xs text-gray-550 font-medium">Real-time order statuses and active culinary routing trackers</p>
          </div>

          {orderHistory.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-xs">
              <span className="text-3xl">🫓</span>
              <h3 className="font-bold text-gray-700 mt-2">No past orders registered yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Once you check out items from your cart and place an order, they will appear in this trace log.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orderHistory.map((order) => {
                const isActive = order.status !== "delivered" && order.status !== "cancelled";
                return (
                  <div key={order.id} className="bg-white rounded-3xl border border-gray-150 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden text-left font-sans">
                    {/* Status badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-ping" : "bg-gray-450"}`} />
                      <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold px-2.5 py-1 rounded-xl ${
                        order.status === "delivered" ? "bg-emerald-50 text-emerald-855 border border-emerald-100" :
                        order.status === "cancelled" ? "bg-red-50 text-red-855 border border-red-100" :
                        "bg-orange-50 text-orange-950 border border-orange-200"
                      }`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B1A1A] font-extrabold">CONSIGNMENT ID: #{order.id.slice(-6).toUpperCase()}</span>
                      <h4 className="font-serif italic font-bold text-base text-[#8B1A1A] mt-1 pr-20">{order.restaurantName}</h4>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">Placed: {new Date(order.createdAt).toLocaleString()}</p>
                      
                      <div className="border-t border-b border-gray-100 py-3 my-3.5 space-y-1.5 font-sans">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-gray-700 font-medium">
                            <span className="truncate flex-1 max-w-[240px]">{item.menuItem.name} <span className="text-gray-400 text-[10px]">x{item.quantity}</span></span>
                            <span>Rs. {item.menuItem.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-gray-400 italic truncate font-medium">📍 Dropoff: {order.address}</p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-gray-100 font-sans">
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase leading-none font-sans">Total Value</p>
                        <p className="text-sm font-extrabold text-gray-900 mt-0.5">Rs. {order.totalAmount}</p>
                      </div>

                      <div className="flex gap-2">
                        {isActive && (
                          <button
                            onClick={() => onTrackOrder(order)}
                            className="bg-[#2D6A4F] hover:bg-[#1a3d2e] text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            🚴 Track Live Rider
                          </button>
                        )}
                        {!isActive && (
                          <button
                            onClick={() => {
                              order.items.forEach((it) => {
                                onAddToCartDirect(it.menuItem, order.restaurantId, order.restaurantName);
                              });
                            }}
                            className="bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 border border-[#FF6B35]/20 text-[#FF6B35] font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                          >
                            🔄 Reorder All
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
