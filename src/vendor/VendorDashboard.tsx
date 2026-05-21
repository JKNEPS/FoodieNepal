import React, { useState, useEffect } from "react";
import { Play, TrendingUp, DollarSign, Activity, ShoppingBag, CheckCircle, Ban, Clock, Layers, Star, Plus, EyeOff } from "lucide-react";
import { Order, MenuItem } from "../types";

export default function VendorDashboard() {
  const [vendorOrders, setVendorOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "menu">("orders");
  const [earnings, setEarnings] = useState({ today: 850, monthly: 14200, activePrep: 2 });
  
  // Custom new menu item fields
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodPrice, setNewFoodPrice] = useState("");
  const [newFoodDesc, setNewFoodDesc] = useState("");

  const fetchVendorData = () => {
    fetch("/api/vendor/orders")
      .then((res) => res.json())
      .then((data) => setVendorOrders(data))
      .catch((err) => console.error(err));

    // Also fetch items list
    fetch("/api/restaurants/rest_1")
      .then((res) => res.json())
      .then((data) => setMenuItems(data.menuItems || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchVendorData();
    const interval = setInterval(fetchVendorData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update order status
  const handleUpdateStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const res = await fetch("/api/vendor/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status })
      });
      const data = await res.json();
      if (data.success) {
        // Trigger simulated sound
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.frequency.setValueAtTime(status === "ready" ? 880 : 440, audioCtx.currentTime); // High double whistle tone
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
          // Ignore audio contexts in block frameworks
        }

        fetchVendorData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add menu item
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName || !newFoodPrice) return;

    const newItem: MenuItem = {
      id: `item_${Date.now()}`,
      name: newFoodName,
      price: Number(newFoodPrice),
      description: newFoodDesc || "Warm home-kitchen recipe cooked fresh in mustard oils.",
      category: "Momo",
      image: "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Medium",
      isVeg: true,
      ingredients: []
    };

    setMenuItems((prev) => [...prev, newItem]);
    setNewFoodName("");
    setNewFoodPrice("");
    setNewFoodDesc("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      <div className="flex items-center justify-between border-b border-gray-150 pb-5 mb-8">
        <div>
          <span className="text-[10px] bg-[#2D6A4F]/10 text-[#2D6A4F] font-black px-2.5 py-1 rounded-full uppercase">
            Momo House Lalitpur
          </span>
          <h1 className="text-2xl font-black mt-1 text-gray-900 tracking-tight">KITCHEN VENDOR HUB</h1>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "orders" ? "bg-white text-[#8B1A1A] shadow-md" : "text-gray-500 hover:text-gray-900"}`}
          >
            Orders Monitor {vendorOrders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length > 0 && (
              <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold ml-1 animate-pulse">
                {vendorOrders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "menu" ? "bg-white text-[#8B1A1A] shadow-md" : "text-gray-500 hover:text-gray-900"}`}
          >
            Menu Inventory
          </button>
        </div>
      </div>

      {/* Mini Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block leading-none">TODAY'S TURNOVER</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">Rs. {earnings.today}</span>
            <span className="text-[9px] text-[#2D6A4F] font-semibold mt-1 block">12% standard platform commission</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block leading-none">IN-COOKING ACTIVE ORDERS</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {vendorOrders.filter(o => o.status === "preparing" || o.status === "confirmed").length} Orders
            </span>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block leading-none">REVIEWS SCORE SUMMARY</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block flex items-center gap-1">
              4.8 <Star className="w-4 h-4 fill-amber-400 text-amber-500 leading-none" />
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Star className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {activeTab === "orders" ? (
        /* VENDOR ACTIVE ORDERS STREAMS */
        <div className="space-y-4">
          <h2 className="text-sm font-black text-gray-400 tracking-wider uppercase mb-2">Live Orders Stream (Simulating Audio ringtone)</h2>
          
          {vendorOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-700 mt-2">No active orders assigned to Momo House</h3>
              <p className="text-xs text-gray-400 mt-0.5">Orders placed by customers appear here with acoustic notification alerts!</p>
            </div>
          ) : (
            vendorOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#8B1A1A]/10 text-[#8B1A1A] font-bold px-2 py-0.5 rounded-md">ID: {ord.id}</span>
                    <span className="text-gray-400 font-bold">{new Date(ord.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded capitalize">{ord.status.replace("_", " ")}</span>
                  </div>

                  <div className="space-y-1 mb-3">
                    {ord.items.map((it) => (
                      <p key={it.id} className="font-extrabold text-gray-800 text-sm">
                        {it.quantity}x {it.menuItem.name} <span className="text-gray-400 font-normal">({it.selectedSpice || "Medium"} Spice)</span>
                      </p>
                    ))}
                  </div>

                  <p className="text-gray-400 font-medium">Deliver Address: <span className="text-gray-700 font-bold">{ord.address}</span></p>
                  <p className="text-gray-400 font-medium mt-0.5">Wallet: <span className="text-[#8B1A1A] font-bold capitalize">{ord.paymentMethod}</span></p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {ord.status === "placed" && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, "confirmed")}
                      className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1a3d2e] text-white font-bold rounded-xl"
                    >
                      ✓ Confirm Order
                    </button>
                  )}

                  {ord.status === "confirmed" && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, "preparing")}
                      className="px-4 py-2 bg-[#FF6B35] hover:bg-[#A83232] text-white font-bold rounded-xl"
                    >
                      🥘 Start Cooking
                    </button>
                  )}

                  {ord.status === "preparing" && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, "ready")}
                      className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1a3d2e] text-white font-bold rounded-xl animate-bounce"
                    >
                      📦 Seal & Mark Ready
                    </button>
                  )}

                  {ord.status === "ready" && (
                    <span className="text-gray-400 font-semibold italic flex items-center gap-1.5 border border-dashed border-gray-250 p-2.5 rounded-xl">
                      <Clock className="w-3.5 h-3.5" />
                      Waiting for Rider GPS Pickup
                    </span>
                  )}

                  {ord.status === "delivered" && (
                    <span className="text-[#2D6A4F] font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Delivered completed
                    </span>
                  )}

                  {ord.status === "cancelled" && (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <Ban className="w-4 h-4" /> Order cancelled
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* RESTAURANT MENU INVENTORY MANAGER */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Menu addition form */}
          <div className="bg-[#FFF8F0]/30 border border-[#FF6B35]/10 p-5 rounded-2xl shadow-xs">
            <h3 className="font-extrabold text-[#8B1A1A] text-sm tracking-tight border-b border-[#FF6B35]/15 pb-2.5 mb-4">
              Expand Kitchen Recipe (Add Menu)
            </h3>

            <form onSubmit={handleAddFood} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-600 block mb-1">Dish Name</label>
                <input
                  type="text"
                  value={newFoodName}
                  onChange={(e) => setNewFoodName(e.target.value)}
                  placeholder="e.g. Jhol Kuku ko Momo"
                  className="w-full bg-white border border-gray-150 rounded-xl p-2.5 text-gray-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Price NPR (Rs)</label>
                <input
                  type="number"
                  value={newFoodPrice}
                  onChange={(e) => setNewFoodPrice(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full bg-white border border-gray-150 rounded-xl p-2.5 text-gray-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Description</label>
                <textarea
                  value={newFoodDesc}
                  onChange={(e) => setNewFoodDesc(e.target.value)}
                  placeholder="Specify flavor hints and ingredients..."
                  rows={3}
                  className="w-full bg-white border border-gray-150 rounded-xl p-2.5 text-gray-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white font-bold rounded-xl"
              >
                + Save Recipe
              </button>
            </form>
          </div>

          {/* Existing recipes card inventory list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-[#8B1A1A] text-sm tracking-tight mb-4">Current Recipes Card Catalog</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-3 text-xs justify-between">
                  <div className="flex gap-2.5">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{item.name}</h4>
                      <p className="font-bold text-[#8B1A1A] mt-1">Rs. {item.price}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">Spice: {item.spiceLevel}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button className="flex items-center gap-1 py-1 px-2.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100">
                      <EyeOff className="w-3 h-3" />
                      <span>Stock Off</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
