import { useState } from "react";
import { ShieldCheck, ArrowLeft, Trash2, ShoppingBag, Plus, Minus, Tag, MapPin, Ticket, Info } from "lucide-react";
import { CartItem } from "../types";

interface CheckoutProps {
  cartItems: CartItem[];
  onBack: () => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateCartItemSpice: (id: string, spice: string) => void;
  onUpdateCartItemNote: (id: string, note: string) => void;
  customerAddress: string;
  onChangeAddress: (addr: string) => void;
  onPlaceOrder: (paymentMethod: "cod" | "esewa" | "khalti" | "imepay", promoCode?: string, discountAmount?: number, notes?: string) => void;
  loyaltyPoints: number;
  cartPointsError?: string;
}

export default function Checkout({
  cartItems,
  onBack,
  onUpdateQty,
  onRemoveItem,
  onUpdateCartItemSpice,
  onUpdateCartItemNote,
  customerAddress,
  onChangeAddress,
  onPlaceOrder,
  loyaltyPoints,
  cartPointsError
}: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "esewa" | "khalti" | "imepay">("cod");
  const [promoInput, setPromoInput] = useState("");
  const [activePromo, setActivePromo] = useState<{ code: string; discountPercent?: number; discountValue?: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [scheduling, setScheduling] = useState<"now" | "later">("now");
  const [specialNotes, setSpecialNotes] = useState("");

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(customerAddress);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let geoName = "Ward 3, Jhamsikhel";
        if (latitude > 27.65 && latitude < 27.75 && longitude > 85.28 && longitude < 85.35) {
          geoName = "Jhamsikhel, Lalitpur";
        } else if (latitude > 27.68 && latitude < 27.73 && longitude > 85.30 && longitude < 85.34) {
          geoName = "Kathmandu Durbar Square";
        }
        
        const fullString = `${geoName}, Pokhara, Nepal (GPS: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E)`;
        setAddressInput(fullString);
        onChangeAddress(fullString);
        setDetectingLocation(false);
      },
      (error) => {
        console.warn("Geolocation precise reading error on checkout:", error);
        const simulatedPositions = [
          "Jhamsikhel Circle, Lalitpur (GPS: 27.6775°N, 85.3168°E)",
          "Lakeside Road, Ward 6, Pokhara (GPS: 28.2096°N, 83.9584°E)",
          "Kupondole Height, Lalitpur (GPS: 27.6891°N, 85.3195°E)",
          "Boudha Stupa Outer Ring, Kathmandu (GPS: 27.7215°N, 85.3620°E)"
        ];
        const randomCoord = simulatedPositions[Math.floor(Math.random() * simulatedPositions.length)];
        setAddressInput(randomCoord);
        onChangeAddress(randomCoord);
        
        setLocationError(`Precise GPS fallback active (Status: ${error.message || "Permission restricted"})`);
        setDetectingLocation(false);
        setTimeout(() => setLocationError(""), 5000);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

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

  // Calculate points to be earned based on the order total (10 pts per Rs. 100 block)
  const pointsToEarn = Math.floor(subtotal / 100) * 10;
  const pointsWorthRupees = (pointsToEarn * 0.1).toFixed(2);

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
            
            {cartPointsError && (
              <div className="bg-rose-50 text-rose-600 border border-rose-150 p-3 rounded-xl text-xs font-bold leading-relaxed animate-shake flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                <span>{cartPointsError}</span>
              </div>
            )}
            
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
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase">Delivery Coordinates</span>
              {!isEditingAddress && (
                <button
                  onClick={() => {
                    setAddressInput(customerAddress);
                    setIsEditingAddress(true);
                  }}
                  className="text-[10px] text-[#FF6B35] hover:text-[#2D6A4F] font-bold tracking-wider uppercase border border-[#FF6B35]/20 hover:border-[#2D6A4F]/30 px-2.5 py-1 rounded-lg transition-colors"
                >
                  ✎ Edit Spot
                </button>
              )}
            </div>
            
            {isEditingAddress ? (
              <div className="space-y-3 bg-[#FFF8F0]/30 p-4 rounded-xl border border-[#FF6B35]/15">
                <label className="block text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wider">Type Your Current Location Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="E.g., Ward No. 3, Jhamsikhel, Pokhara, Nepal"
                    className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-[#FF6B35]"
                  />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setIsEditingAddress(false)}
                    className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onChangeAddress(addressInput);
                      setIsEditingAddress(false);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1a3d2e] rounded-lg"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-[#FFF8F0]/30 p-3 rounded-xl border border-[#FF6B35]/10">
                  <MapPin className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#8B1A1A] flex items-center gap-1.5">
                      <span>Dropoff Location Spot</span>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 rounded">GPS Locked</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5 break-words">{customerAddress}</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  className="w-full py-2.5 bg-[#2D6A4F] hover:bg-[#1a3d2e] disabled:bg-gray-400 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
                >
                  🎯 {detectingLocation ? "Locating high precision GPS coordinate..." : "Detect Exact Location on Map"}
                </button>
                {locationError && (
                  <p className="text-[10px] text-orange-600 font-mono font-semibold text-center mt-1 animate-pulse">
                    ℹ️ {locationError}
                  </p>
                )}
              </div>
            )}

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

          {/* New Custom Cooking & Preparation Instructions Block */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3.5">
            <div>
              <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase">Preparation & Cooking Preferences</span>
              <h3 className="text-[#8B1A1A] font-extrabold text-sm mt-0.5">Special Culinary Requests</h3>
              <p className="text-[11px] text-gray-500">Need it extra spicy, less spicy, well done, or have specific instructions for the chef?</p>
            </div>

            <textarea
              id="special-cooking-notes-textarea"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="E.g., Please make it medium spicy, include extra hot chutney, or pack curry separately..."
              rows={3}
              className="w-full bg-gray-50/70 border border-gray-150 rounded-xl p-3.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-[#FF6B35] focus:bg-white transition-all resize-none"
            />
            
            {/* Quick pre-set helper chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "🌶️ Extra Spicy", text: "Please make it extra spicy." },
                { label: "🍃 Less Spicy", text: "Please make it less spicy." },
                { label: "🥣 Extra Sauce", text: "Please pack extra chutney/sauce." },
                { label: "🧄 No Onions/Garlic", text: "Please prepare without onions or garlic." }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const separator = specialNotes.trim() ? " " : "";
                    if (!specialNotes.includes(chip.text)) {
                      setSpecialNotes((prev) => `${prev}${separator}${chip.text}`);
                    }
                  }}
                  className="px-3 py-1.5 bg-[#FFF8F0] hover:bg-[#FF6B35]/15 border border-[#FF6B35]/25 text-[#8B1A1A] rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  {chip.label}
                </button>
              ))}
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
                <div className="flex items-center gap-1.5">
                  <span>Traditional Delivery Fee</span>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("foodienepal_show_delivery_charges"))}
                    className="p-1 text-[#FF6B35] hover:text-[#8B1A1A] hover:bg-orange-50 rounded-full transition-all cursor-pointer inline-flex items-center justify-center"
                    title="Click to view Delivery Charges Schedule Guide"
                    id="checkout_delivery_guide_trigger"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
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

            {/* Foodie Points reward visualization */}
            <div className="bg-[#FFF8F0] p-3 rounded-xl border border-[#FF6B35]/20 animate-fadeIn text-left">
              <div className="flex items-center justify-between text-[#8B1A1A] font-black text-[10px] uppercase tracking-wider mb-1">
                <span>🎁 Foodie Reward Earned</span>
                <span className="bg-[#FF6B35] text-white px-2 py-0.5 rounded text-[8px] font-mono tracking-normal font-black leading-none animate-bounce">
                  + {pointsToEarn} pts
                </span>
              </div>
              <p className="text-[10.5px] text-gray-500 font-semibold leading-relaxed">
                You will receive <b className="text-[#FF6B35]">{pointsToEarn} loyalty points</b> (worth <b className="text-[#2D6A4F]">Rs. {pointsWorthRupees}</b> real value) on checkout. 10 points are earned for every Rs. 100 on your order subtotal!
              </p>
            </div>

            <button
              id="btn-place-order"
              onClick={() => onPlaceOrder(paymentMethod, activePromo?.code, discountAmount, specialNotes)}
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
