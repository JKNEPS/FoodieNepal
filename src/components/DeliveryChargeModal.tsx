import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowLeft, Bike, ShoppingBag, Store, MapPin, Info, HelpCircle } from "lucide-react";

interface DeliveryChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeliveryChargeModal({ isOpen, onClose }: DeliveryChargeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          id="delivery_charge_modal_root"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            id="delivery_charge_modal_backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative bg-[#FFF8F0] border-2 border-[#8B1A1A]/20 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-gray-800 flex flex-col max-h-[85vh]"
            id="delivery_charge_modal_content"
          >
            {/* Native Top Bar */}
            <div className="bg-[#8B1A1A] text-[#FFF8F0] px-4 py-3.5 flex items-center border-b border-[#8B1A1A]/10 sticky top-0 z-10 shadow-xs">
              <button 
                onClick={onClose}
                className="hover:bg-white/10 p-1.5 rounded-full transition-colors active:scale-90 text-[#FFF8F0] mr-2"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <h2 className="flex-1 text-center font-mono font-bold tracking-wider text-sm mr-7 uppercase">
                DELIVERY CHARGE
              </h2>

              <button 
                onClick={onClose}
                className="absolute right-3 hover:bg-white/10 p-1.5 rounded-full transition-colors text-white/80 hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Pane */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              
              {/* Screen Subtitle */}
              <div className="border-b border-[#8B1A1A]/10 pb-4">
                <h3 className="text-2xl font-serif italic font-black text-[#8B1A1A] tracking-tight">
                  Delivery Charges
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Standard distribution tariffs for our logistics network
                </p>
              </div>

              {/* Box 1: Onemart/Fresh Groceries */}
              <div className="space-y-4">
                
                {/* section block */}
                <div className="bg-white p-4.5 rounded-xl border border-[#8B1A1A]/5 shadow-xxs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center">
                      <ShoppingBag className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 font-sans tracking-tight">
                        FoodieNepal Fresh Orders:
                      </h4>
                      <p className="text-xs text-[#8B1A1A] font-extrabold font-mono mt-0.5">
                        Rs. 100 per order
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed pl-10.5">
                    Flat fee applied to fresh farm items, green handpicked organic groceries, high quality poultry, and wholesale Mandi listings.
                  </p>
                </div>

                {/* Box 2: Restaurants */}
                <div className="bg-white p-4.5 rounded-xl border border-[#8B1A1A]/5 shadow-xxs space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#8B1A1A]/10 text-[#8B1A1A] flex items-center justify-center">
                      <Store className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 font-sans tracking-tight">
                        Restaurants and other kitchens
                      </h4>
                      <p className="text-[10px] text-rose-700 font-mono font-bold mt-0.5">
                        Distance &amp; Bill Variable Rates
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed font-medium pl-10.5">
                    The delivery charge is calculated based on the restaurant bill total and the <b className="text-gray-900 font-bold">approximate road distance</b> between the selected restaurant and the delivery location.
                  </p>

                  <div className="bg-[#FFF8F0] rounded-lg p-3.5 border border-[#FF6B35]/15 space-y-2.5 ml-10.5">
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-[#8B1A1A] font-serif font-black text-sm select-none mt-0.5">•</span>
                      <div className="flex-1">
                        <span className="font-bold text-gray-900">Up to 2 Km:</span>{" "}
                        <span className="font-semibold text-gray-700">Rs. 50 flat</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-[#8B1A1A] font-serif font-black text-sm select-none mt-0.5">•</span>
                      <div className="flex-1">
                        <span className="font-bold text-gray-900">After 2 Km:</span>{" "}
                        <span className="font-semibold text-gray-750">Additional Rs. 25 / km</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 3: Onemart */}
                <div className="bg-white p-4.5 rounded-xl border border-[#8B1A1A]/5 shadow-xxs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Bike className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 font-sans tracking-tight">
                        FoodieNepal Onemart Orders:
                      </h4>
                      <p className="text-xs text-emerald-700 font-extrabold font-mono mt-0.5">
                        Rs. 50 per order
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed pl-10.5">
                    Convenient flat rate delivery fee for everyday household essentials, packaged dairy items, snacks, beverages, and pantry items.
                  </p>
                </div>

              </div>
              
              {/* Explanatory Info Card info */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-500/10 text-xs text-blue-800 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-blue-900">Hygienic Courier Delivery Guarantee</p>
                  <p className="leading-relaxed text-blue-700/90 text-[10.5px]">
                    All food items are packed in insulated thermofoil containers to preserve perfect warmth. Standard delivery limits cover Kathmandu, Lalitpur, Bhaktapur, and Pokhara.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50/80 px-6 py-4.5 border-t border-[#8B1A1A]/10 flex items-center justify-end sticky bottom-0 z-10">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#8B1A1A] hover:bg-[#721414] text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Understood, Close
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
