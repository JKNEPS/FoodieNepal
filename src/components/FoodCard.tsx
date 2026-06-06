import { Flame, Star, ShoppingCart, Sparkles, Footprints, Camera } from "lucide-react";
import { MenuItem } from "../types";

interface FoodCardProps {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
  onAddToCart: (item: MenuItem, restId: string, restName: string) => void;
  onCookAnimation: (item: MenuItem) => void;
  onARPreview: (item: MenuItem) => void;
}

export default function FoodCard({
  item,
  restaurantId,
  restaurantName,
  onAddToCart,
  onCookAnimation,
  onARPreview
}: FoodCardProps) {
  // Determine spice indicators
  const getSpiceClass = (level: string) => {
    switch (level) {
      case "Mild": return "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200/40";
      case "Medium": return "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200/40";
      case "Spicy": return "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200/40";
      default: return "bg-[#8B1A1A]/10 text-[#8B1A1A] hover:bg-[#8B1A1A]/20 border border-[#8B1A1A]/20 font-bold animate-pulse";
    }
  };

  return (
    <div className="relative flex flex-col justify-between editorial-card h-full overflow-hidden group border border-[#8B1A1A]/10 bg-white">
      
      {/* Sasto pricing or popular badges floating */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
        {item.isVeg ? (
          <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border border-emerald-200 shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            Veg
          </span>
         ) : (
          <span className="bg-red-50 text-red-800 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border border-red-250 shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            Non-veg
          </span>
        )}
        
        {item.price <= 150 && (
          <span className="bg-[#FF6B35] text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
            Local Pick
          </span>
        )}
      </div>

      {/* Main card visual display image */}
      <div className="relative h-40 overflow-hidden bg-[#FFF8F0]/30 border-b border-[#8B1A1A]/5">
        <img
          src={item.image || "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=400"}
          alt={item.name}
          className="object-cover w-full h-full transform group-hover:scale-103 transition-all duration-300"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=400";
            e.currentTarget.onerror = null;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Item metadata descriptions */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-bold rounded px-2 py-0.5 ${getSpiceClass(item.spiceLevel)} flex items-center gap-1`}>
              <Flame className="w-3 h-3 flex-shrink-0" />
              {item.spiceLevel}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold font-mono uppercase tracking-wider truncate max-w-[100px]">{categoryShort(item.category)}</span>
          </div>

          <h3 className="font-serif italic font-bold text-gray-950 group-hover:text-[#FF6B35] transition-colors leading-snug text-lg mb-1">
            {item.name}
          </h3>
          <p className="text-xs text-gray-555 line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>

        {/* Dynamic Launchers for priority interactive items (Animated Cook , AR table scan) */}
        <div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
               onClick={() => onCookAnimation(item)}
               className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-[#FFF8F0] hover:bg-[#FF6B35]/10 text-[#FF6B35] rounded-xl text-xs font-bold border border-[#FF6B35]/25 hover:border-[#FF6B35]/50 transition-all shadow-xs"
               title="See ingredients cook live in 3D"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="tracking-wide">Animate</span>
            </button>
            <button
              onClick={() => onARPreview(item)}
              className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-[#2D6A4F]/5 hover:bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-xl text-xs font-bold border border-[#2D6A4F]/25 hover:border-[#2D6A4F]/50 transition-all shadow-xs"
              title="Visualize food plate in scale AR inside your home"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="tracking-wide">View in AR</span>
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-[#8B1A1A]/10 pt-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-405 font-bold uppercase tracking-wider leading-none">Price NPR</span>
              <span className="text-xl font-serif italic font-bold text-[#8B1A1A]">Rs. {item.price}</span>
            </div>

            <button
              id={`add-to-cart-${item.id}`}
              onClick={() => onAddToCart(item, restaurantId, restaurantName)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#FF6B35]/15 hover:shadow-none hover:scale-102"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function categoryShort(cat: string) {
  if (cat.length > 14) return cat.substring(0, 12) + "..";
  return cat;
}
