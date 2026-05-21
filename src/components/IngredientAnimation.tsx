import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flame, Sparkles, Check, ShoppingCart, Play, RotateCcw, Utensils, Award } from "lucide-react";
import { MenuItem } from "../types";

interface IngredientAnimationProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCartDirect: (item: MenuItem) => void;
}

export default function IngredientAnimation({
  item,
  onClose,
  onAddToCartDirect
}: IngredientAnimationProps) {
  const [cookingStage, setCookingStage] = useState<"ready" | "flying" | "combining" | "cooking" | "plated">("ready");
  
  // Custom timer state to progress stages automatically
  useEffect(() => {
    if (!item) return;
    setCookingStage("ready");

    const timer1 = setTimeout(() => setCookingStage("flying"), 800);
    const timer2 = setTimeout(() => setCookingStage("combining"), 2800);
    const timer3 = setTimeout(() => setCookingStage("cooking"), 4400);
    const timer4 = setTimeout(() => setCookingStage("plated"), 6500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [item]);

  if (!item) return null;

  const handleRestart = () => {
    setCookingStage("ready");
    setTimeout(() => setCookingStage("flying"), 400);
    setTimeout(() => setCookingStage("combining"), 2400);
    setTimeout(() => setCookingStage("cooking"), 4000);
    setTimeout(() => setCookingStage("plated"), 6100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#8B1A1A] to-[#2D3131] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading Title specs */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold tracking-widest text-[#FF6B35] uppercase bg-[#FFF8F0]/10 px-2.5 py-1 rounded-full">
            FoodieNepal virtual Kitchen
          </span>
          <h2 className="text-2xl font-black mt-2 tracking-tight">Cooking: {item.name}</h2>
          <p className="text-xs text-gray-300 px-6 mt-1">{item.description}</p>
        </div>

        {/* Central interactive kitchen arena */}
        <div className="relative h-64 border border-white/5 rounded-3xl bg-black/40 shadow-inner flex items-center justify-center overflow-hidden mb-6">
          
          {/* 1. READY STAGE: Setup empty plate or clay bowl */}
          {cookingStage === "ready" && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-600/60 flex items-center justify-center text-gray-500 text-sm">
                <Utensils className="w-10 h-10 stroke-1 animate-bounce" />
              </div>
              <span className="text-xs text-gray-400 font-semibold mt-3 animate-pulse">Assembling fresh local farm ingredients...</span>
            </motion.div>
          )}

          {/* 2. FLYING STAGE: Staggered flying from specific offsets */}
          {cookingStage === "flying" && (
            <div className="absolute inset-0">
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] bg-[#FF6B35]/20 text-[#FF6B35] px-2 py-0.5 rounded-full font-bold">
                Spiced ingredients entering wok...
              </span>
              {item.ingredients.map((ing, idx) => (
                <motion.div
                  key={ing.name}
                  initial={{ x: ing.xOffset, y: ing.yOffset, scale: 0.3, opacity: 0 }}
                  animate={{ x: 0, y: -20, scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.3, duration: 1.2, ease: "easeOut" }}
                  className="absolute left-[45%] top-[45%] flex flex-col items-center"
                >
                  <span className="text-4xl bg-white/10 p-2 rounded-2xl border border-white/20 shadow-md">
                    {ing.icon}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-200 mt-1 max-w-[80px] text-center truncate">
                    {ing.name}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* 3. COMBINING STAGE: Shaking & rotating spices at the center */}
          {cookingStage === "combining" && (
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: [1, 1.15, 0.9, 1.1, 1],
                  rotate: [0, 15, -15, 360, 0]
                }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
                className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-full border border-white/10"
              >
                {item.ingredients.slice(0, 6).map((ing) => (
                  <span key={ing.name} className="text-2xl animate-spin">
                    {ing.icon}
                  </span>
                ))}
              </motion.div>
              <span className="text-[#FF6B35] text-xs font-bold py-1 px-3 mt-4 bg-[#FF6B35]/10 rounded-full animate-pulse">
                Whisking and marinating food...
              </span>
            </div>
          )}

          {/* 4. COOKING STAGE: Heat shimmer & Steams rising particles! */}
          {cookingStage === "cooking" && (
            <div className="flex flex-col items-center justify-center relative w-full h-full">
              {/* Steamer pot / wok */}
              <motion.div
                animate={{ y: [0, -4, 0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="relative z-10 w-24 h-24 bg-gray-700 rounded-3xl border-4 border-[#FF6B35] shadow-lg flex items-center justify-center text-4xl"
              >
                🥘
              </motion.div>

              {/* Fire Flame Icon */}
              <div className="flex items-center gap-1 text-[#FF6B35] absolute bottom-6 font-black animate-pulse bg-black/60 px-3 py-1 rounded-full border border-[#FF6B35]/30">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
                <span className="text-xs tracking-wider uppercase">Frying (Ghee Tossed)</span>
              </div>

              {/* Simulated steam rises using random absolute bubbles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0, scale: 0.5 }}
                  animate={{ y: -80, opacity: [0, 0.8, 0], scale: [0.5, 1.5, 2] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.4,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                  className="absolute pointer-events-none text-white/30 text-lg font-bold"
                >
                  💨
                </motion.div>
              ))}
            </div>
          )}

          {/* 5. PLATED STAGE: Completed meal with nice bounces */}
          {cookingStage === "plated" && (
            <motion.div
              initial={{ y: 50, scale: 0.3, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-36 h-36 rounded-full border-4 border-[#2D6A4F] object-cover shadow-2xl"
                />
                <div className="absolute -top-2 -right-2 bg-[#2D6A4F] text-white rounded-full p-2 border-2 border-white shadow-md">
                  <Check className="w-5 h-5" />
                </div>
              </div>
              <span className="text-emerald-400 font-extrabold text-sm tracking-wide mt-3 animate-pulse">
                Plated, Ghee Glazed & Ready!
              </span>
            </motion.div>
          )}
        </div>

        {/* Current Cooking Timeline indicators */}
        <div className="flex items-center justify-between px-2 mb-6">
          {["Prep", "Mix", "Cook", "Plated"].map((stage, idx) => {
            const isDone =
              (idx === 0) ||
              (idx === 1 && ["combining", "cooking", "plated"].includes(cookingStage)) ||
              (idx === 2 && ["cooking", "plated"].includes(cookingStage)) ||
              (idx === 3 && cookingStage === "plated");
            return (
              <div key={stage} className="flex flex-col items-center flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter ${isDone ? "bg-[#FF6B35] text-white" : "bg-white/10 text-white/40"}`}>
                  {idx + 1}
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isDone ? "text-white" : "text-white/40"}`}>{stage}</span>
              </div>
            );
          })}
        </div>

        {/* Actions button controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Re-cook</span>
          </button>

          <button
            onClick={() => {
              onAddToCartDirect(item);
              onClose();
            }}
            disabled={cookingStage !== "plated"}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black transition-all ${cookingStage === "plated" ? "bg-[#FF6B35] text-white active:scale-98 shadow-lg shadow-[#FF6B35]/25" : "bg-white/5 text-white/30 cursor-not-allowed"}`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart (Rs. {item.price})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
