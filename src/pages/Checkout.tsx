import { useState } from "react";
import { ShieldCheck, ArrowLeft, Trash2, ShoppingBag, Plus, Minus, Tag, MapPin, Ticket } from "lucide-react";
import { CartItem } from "../types";

interface CheckoutProps {
  cartItems: CartItem[];
  onBack: () => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateCartItemSpice: (id: string, spice: string) => void;
  onUpdateCartItemNote: (id: string, note: string) => void;
  customerAddress: string;
  onPlaceOrder: (paymentMethod: "cod" | "esewa" | "khalti" | "imepay", promoCode?: string, discountAmount?: number) => void;
}

export default function Checkout({
  cartItems,
  onBack,
  onUpdateQty,
  onRemoveItem,
  onUpdateCartItemSpice,
  onUpdateCartItemNote,
  customerAddress,
  onPlaceOrder
}: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "esewa" | "khalti" | "imepay">("cod");
  const [promoInput, setPromoInput] = useState("");
  const [activePromo, setActivePromo] = useState<{ code: string; discountPercent?: number; discountValue?: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [scheduling, setScheduling] = useState<"now" | "later">("now");

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-bounce" />
        <h3 className="font-extrabold text-gray-700 text-lg">Your Culinary Cart is Empty</h3>
        <p className="text-xs text-gray-400 mt-1 mb-6">Explore our restaurant marketplace to add hot momos and traditional sets.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white font-bold rounded-xl text-xs transition-all"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  // Calculate bill totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
  const deliveryFee = 40; // Flat-rate delivery fee for Kathmandu
  const platformFee = 10;
  const tax = Math.round(subtotal * 0.05); // 5% VAT tax
  
  let discountAmount = 0;
  if (activePromo) {
    if (activePromo.discountPercent) {
      discountAmount = Math.round(subtotal * (activePromo.discountPercent / 100));
    } else if (activePromo.discountValue) {
      discountAmount = activePromo.discountValue;
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee + platformFee + tax - discountAmount);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError("");
    setPromoSuccess("");

    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setActivePromo(data.promo);
        setPromoSuccess(`Promo Code "${data.promo.code}" applied! You saved Rs. ${data.promo.discountPercent ? `${data.promo.discountPercent}%` : `Rs. ${data.promo.discountValue}`}`);
        setPromoInput("");
      } else {
        setPromoError(data.error || "Invalid coupon code");
      }
    } catch (err) {
      setPromoError("Verification failed");
    }
  };

  const handleRemovePromo = () => {
    setActivePromo(null);
    setPromoSuccess("");
    setPromoError("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-left">
      
      {/* Back to Home layout */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[#FF6B35] hover:text-[#2D6A4F] font-black text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shopping</span>
      </button>

      <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Culinary Cart Summary</h1>

      {/* Two Column Layout: Cart Items and Billing Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Cart list items */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
            <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase">Cart Items</span>
            
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-4 last:border-none last:pb-0">
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />

                <div className="flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{item.menuItem.name}</h4>
                        <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{item.restaurantName}</span>
                      </div>
                      
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 hover:text-rose-600 text-gray-400"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Spice levels modifiers dropdown */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold text-gray-400">Spice:</span>
                      <select
                        id={`spice-select-${item.id}`}
                        value={item.selectedSpice || item.menuItem.spiceLevel}
                        onChange={(e) => onUpdateCartItemSpice(item.id, e.target.value)}
                        className="bg-gray-100 text-[9px] font-bold rounded-md py-0.5 px-2 border-none focus:outline-none"
                      >
                        <option value="Mild">Mild</option>
                        <option value="Medium">Medium</option>
                        <option value="Spicy">Spicy</option>
                        <option value="Himalayan Fire">Himalayan Fire</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-3">
                    <span className="font-black text-[#8B1A1A]">Rs. {item.menuItem.price * item.quantity}</span>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs px-1.5">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Coordinates & Schedule Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
            <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase">Delivery Coordinates</span>
            
            <div className="flex items-center gap-3 bg-[#FFF8F0]/30 p-3 rounded-xl border border-[#FF6B35]/10">
              <MapPin className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
              <div>
                <h4 className="font-bold text-xs text-[#8B1A1A]">Dropoff Location spot</h4>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5">{customerAddress}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={() => setScheduling("now")}
                className={`py-3 px-4 text-xs font-black rounded-xl border transition-all text-center ${scheduling === "now" ? "bg-[#2D6A4F]/10 border-[#2D6A4F] text-[#2D6A4F]" : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"}`}
              >
                🏍️ Express Delivery (Now)
              </button>
              
              <button
                onClick={() => setScheduling("later")}
                className={`py-3 px-4 text-xs font-black rounded-xl border transition-all text-center ${scheduling === "later" ? "bg-[#2D6A4F]/10 border-[#2D6A4F] text-[#2D6A4F]" : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"}`}
              >
                ⏱️ Schedule Dropoff
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Billing & Mock Wallet payments (Takes 2/5 columns) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Promo code application block */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase mb-3">Promotional Discount</span>
            
            <div className="flex gap-2">
              <input
                id="promo-input-field"
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter (FOODIE10, SABSE50)..."
                className="flex-1 bg-gray-100 px-3 py-2 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={handleApplyPromo}
                className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1a3d2e] text-white rounded-xl text-xs font-bold transition-all"
              >
                Apply
              </button>
            </div>

            {promoError && <p className="text-[10px] text-rose-500 font-bold mt-2">⚠️ {promoError}</p>}
            {promoSuccess && (
              <div className="flex items-center justify-between text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 p-2 rounded-xl mt-2 font-bold">
                <span>{promoSuccess}</span>
                <button onClick={handleRemovePromo} className="text-gray-400 hover:text-rose-600 font-bold">Remove</button>
              </div>
            )}
          </div>

          {/* Payment Methods selector (COD + Nepal Wallets) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase mb-3">Nepal Local Wallet Payment</span>
            
            <div className="grid grid-cols-2 gap-3.5">
              {/* Cash On Delivery option */}
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`p-3 text-xs font-black rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 ${paymentMethod === "cod" ? "border-[#FF6B35] bg-[#FFF8F0]" : "border-gray-100 bg-gray-50/50"}`}
              >
                <span className="text-xl">💵</span>
                <span className="text-gray-800">Cash on Delivery</span>
              </button>

              {/* mock eSewa option */}
              <button
                onClick={() => setPaymentMethod("esewa")}
                className={`p-3 text-xs font-black rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 ${paymentMethod === "esewa" ? "border-emerald-600 bg-emerald-50/30" : "border-gray-100 bg-gray-50/50"}`}
              >
                <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold rounded flex items-center justify-center leading-none text-[9px]">eS</div>
                <span className="text-emerald-700">eSewa Pay (NPR)</span>
              </button>

              {/* mock Khalti option */}
              <button
                onClick={() => setPaymentMethod("khalti")}
                className={`p-3 text-xs font-black rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 ${paymentMethod === "khalti" ? "border-purple-600 bg-purple-50/30" : "border-gray-100 bg-gray-50/50"}`}
              >
                <div className="w-5 h-5 bg-purple-600 text-white font-extrabold rounded flex items-center justify-center leading-none text-[9px]">Kh</div>
                <span className="text-purple-700">Khalti Wallet</span>
              </button>

              {/* mock IME Pay option */}
              <button
                onClick={() => setPaymentMethod("imepay")}
                className={`p-3 text-xs font-black rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-1.5 ${paymentMethod === "imepay" ? "border-rose-600 bg-rose-50/30" : "border-gray-100 bg-gray-50/50"}`}
              >
                <div className="w-5 h-5 bg-rose-600 text-white font-extrabold rounded flex items-center justify-center leading-none text-[9px]">IM</div>
                <span className="text-rose-700">IME Pay</span>
              </button>
            </div>
          </div>

          {/* Billing Breakdown receipt and CTA */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
            <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase border-b border-gray-50 pb-2.5">Receipt Receipt</span>
            
            <div className="text-xs space-y-2 text-gray-500 font-semibold mb-4">
              <div className="flex items-center justify-between">
                <span>Food Subtotal</span>
                <span className="text-gray-800">Rs. {subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Traditional Delivery Fee</span>
                <span className="text-gray-800">Rs. {deliveryFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Platform Commission Fee</span>
                <span className="text-gray-800">Rs. {platformFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Himalayan VAT (5% tax)</span>
                <span className="text-gray-800 font-bold">Rs. {tax}</span>
              </div>

              {activePromo && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Promo Saved Amount</span>
                  <span>- Rs. {discountAmount}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#8B1A1A] text-sm font-black border-t border-dashed border-gray-100 pt-3">
                <span>Total Bill (NPR)</span>
                <span>Rs. {grandTotal}</span>
              </div>
            </div>

            <button
              id="btn-place-order"
              onClick={() => onPlaceOrder(paymentMethod, activePromo?.code, discountAmount)}
              className="w-full py-4 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-black transition-all shadow-lg hover:shadow-none flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Place Order (NPR Rs. {grandTotal})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
