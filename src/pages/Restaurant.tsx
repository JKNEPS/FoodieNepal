import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, Heart, Share2, Phone, Sparkles, MapPin, MessageCircle, AlertCircle } from "lucide-react";
import FoodCard from "../components/FoodCard";
import { Restaurant as RestaurantType, MenuItem, Review } from "../types";

interface RestaurantProps {
  restaurantId: string;
  onBack: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (item: MenuItem, restId: string, restName: string) => void;
  onCookAnimation: (item: MenuItem) => void;
  onARPreview: (item: MenuItem) => void;
}

export default function Restaurant({
  restaurantId,
  onBack,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onCookAnimation,
  onARPreview
}: RestaurantProps) {
  const [restaurant, setRestaurant] = useState<RestaurantType | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Review inputs form
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Fetch detailed info
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => res.json())
      .then((data) => {
        setRestaurant(data.restaurant);
        setMenuItems(data.menuItems);
      })
      .catch((err) => console.error(err));

    fetch(`/api/restaurants/${restaurantId}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error(err));
  }, [restaurantId]);

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-bold text-sm">Fetching restaurant menu and reviews from kitchen...</p>
      </div>
    );
  }

  // Group unique categories in this restaurant menu
  const menuCategories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))];

  const filteredItems = selectedCategory === "All"
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  // Handle placing a review comment
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);

    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating, comment: newComment })
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => [data.review, ...prev]);
        setNewComment("");
        setNewRating(5);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-left">
      
      {/* Back triggers panel */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#8B1A1A] hover:text-[#2D6A4F] font-bold text-xs tracking-wider uppercase font-mono mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Marketplace</span>
      </button>

      {/* Styled Large banner block with restaurant metrics */}
      <div className="relative rounded-3xl overflow-hidden h-72 md:h-85 bg-[#1C0D0D] mb-8 border border-[#8B1A1A]/15 shadow-md flex items-end p-6 md:p-8">
        {/* Soft atmospheric blurred background reflection of the logo */}
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-35 scale-125 pointer-events-none"
          style={{ backgroundImage: `url('${restaurant.logo}')` }}
        />
        {/* Dark overlay for text contrast and premium look */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120505]/95 via-[#120505]/70 to-[#120505]/40" />

        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            {/* Logo Container */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white shadow-xl border border-white/10 flex items-center justify-center p-2 shrink-0">
              <img 
                src={restaurant.logo} 
                alt={`${restaurant.name} Logo`} 
                className="object-contain w-full h-full rounded-xl" 
                referrerPolicy="no-referrer" 
              />
            </div>
            
            {/* Restaurant Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-[#2D6A4F] text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded border border-[#2D6A4F]/25">
                  ★ CERTIFIED PARTNER
                </span>
                <span className="text-xs text-orange-200 font-bold flex items-center gap-1 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  {restaurant.address}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif italic font-bold text-[#FFF8F0] leading-tight">{restaurant.name}</h1>
              <p className="text-[#FFF8F0]/85 text-xs font-semibold mt-1.5 font-mono uppercase tracking-wider">Operational Hours: {restaurant.operatingHours}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onToggleFavorite(restaurant.id)}
              className="p-3 bg-white/10 backdrop-blur rounded-2xl hover:bg-white/20 text-white hover:scale-105 active:scale-95 transition-all"
            >
              <Heart className={`w-5 h-5 ${favorites.includes(restaurant.id) ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
            <a
              href="tel:+9779800000000"
              className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#2D6A4F] font-sans font-bold px-5 py-3 rounded-2xl text-xs text-white shadow-md shadow-[#FF6B35]/25 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Host</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid containing categorized menus and review commentary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Food Menu details (Takes 2/3 column layout on wide screens) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Menu Categories sliders */}
          <div className="flex overflow-x-auto gap-2 pb-3 border-b border-[#8B1A1A]/10">
            {menuCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4.5 py-2.5 text-xxs font-bold uppercase tracking-wider font-mono rounded-xl transition-all whitespace-nowrap ${selectedCategory === cat ? "bg-[#8B1A1A] text-white shadow-xs" : "bg-[#FFF8F0] text-gray-700 hover:bg-gray-100 border border-[#8B1A1A]/5"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="h-full">
                <FoodCard
                  item={item}
                  restaurantId={restaurant.id}
                  restaurantName={restaurant.name}
                  onAddToCart={onAddToCart}
                  onCookAnimation={onCookAnimation}
                  onARPreview={onARPreview}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Reviews logs & comment forms (Takes 1/3 column layout) */}
        <div className="space-y-6">
          
          {/* Partner scorecard stats summary */}
          <div className="bg-white border border-[#8B1A1A]/10 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 text-[#FF6B35] fill-[#FF6B35]" />
              <span className="text-4xl font-serif italic font-bold text-[#8B1A1A]">{restaurant.rating.toFixed(1)}</span>
            </div>
            
            <p className="text-xs font-bold text-[#8B1A1A]">Cumulative Customer Score</p>
            <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">Based on {restaurant.reviewsCount} historic customer surveys</p>
          </div>

          {/* User Reviews lists and comments */}
          <div className="bg-white border border-[#8B1A1A]/10 p-6 rounded-2xl space-y-6">
            <h3 className="font-serif italic font-bold text-[#8B1A1A] text-lg border-b border-[#8B1A1A]/5 pb-3">
              Customer Experiences
            </h3>

            {/* Input review submit form */}
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase">Submit Restaurant Review</span>
              
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setNewRating(stars)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${newRating >= stars ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                  </button>
                ))}
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your culinary experience (e.g. delicious buffer, spicy momo douse!)..."
                rows={3}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                required
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition-all"
              >
                {submittingReview ? "Submitting..." : "Publish Review"}
              </button>
            </form>

            {/* Render reviews listing */}
            <div className="space-y-4 pt-3 border-t border-gray-50 max-h-[250px] overflow-y-auto scrollbar-hide">
              {reviews.length === 0 ? (
                <p className="text-center text-xs text-gray-400 font-semibold py-4">Be the very first customer to write a review!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-50 pb-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#8B1A1A]">{rev.userName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-black">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 leading-relaxed font-medium">{rev.comment}</p>
                    
                    {rev.restaurantReply && (
                      <div className="bg-[#FFF8F0] p-2 rounded-xl mt-1.5 border border-dashed border-[#FF6B35]/20">
                        <p className="text-[10px] text-[#FF6B35] font-black uppercase">Host Response:</p>
                        <p className="text-[10px] text-gray-600 mt-0.5 italic font-medium">"{rev.restaurantReply}"</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
