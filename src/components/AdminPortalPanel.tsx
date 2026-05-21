import React, { useState } from "react";
import { Shield, Users, UtensilsCrossed, Calendar, TicketPercent, Check, X, Plus, Trash2, TrendingUp, HandCoins } from "lucide-react";

export default function AdminPortalPanel() {
  // Analytical stats
  const [stats, setStats] = useState({
    totalRevenue: 432300,
    commissionEarned: 43230,
    activeKitchens: 18,
    activeRiders: 24,
  });

  // Partner kitchen list
  const [kitchens, setKitchens] = useState([
    { id: "k-1", name: "Momo House Lalitpur", category: "Momo", status: "Approved", owner: "Raman Shrestha" },
    { id: "k-2", name: "Newari Khaja Ghar", category: "Newari", status: "Approved", owner: "Deepak Bajracharya" },
    { id: "k-3", name: "Boudha Thakali Stand", category: "Thakali", status: "Approved", owner: "Tashi Sherpa" },
    { id: "k-4", name: "Jhamsikhel Organic Dumpling", category: "Momo", status: "Pending", owner: "Sunita Tamang" },
    { id: "k-5", name: "Patan Traditional Chowmein", category: "Chowmein", status: "Pending", owner: "Prabin Joshi" },
  ]);

  // Dynamic promo codes list
  const [promoCodes, setPromoCodes] = useState([
    { code: "DOMESTICLOCAL", value: 15, type: "percent", desc: "15% off local foods" },
    { code: "NEPALBEST", value: 50, type: "flat", desc: "Rs. 50 off authentic dishes" },
    { code: "MOMO2026", value: 20, type: "percent", desc: "20% off all dumplings" },
  ]);

  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoValue, setNewPromoValue] = useState("");
  const [newPromoDesc, setNewPromoDesc] = useState("");

  const [newKitchenName, setNewKitchenName] = useState("");
  const [newKitchenOwner, setNewKitchenOwner] = useState("");
  const [newKitchenCategory, setNewKitchenCategory] = useState("Momo");

  // Approval handler
  const handleApproveKitchen = (id: string) => {
    setKitchens((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "Approved" } : k))
    );
    setStats((prev) => ({ ...prev, activeKitchens: prev.activeKitchens + 1 }));
  };

  // Reject/remove handler
  const handleRemoveKitchen = (id: string) => {
    setKitchens((prev) => prev.filter((k) => k.id !== id));
  };

  // Add promo code
  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode || !newPromoValue) return;
    setPromoCodes((prev) => [
      ...prev,
      {
        code: newPromoCode.trim().toUpperCase(),
        value: Number(newPromoValue),
        type: "flat",
        desc: newPromoDesc || "Special admin coupon offer",
      },
    ]);
    setNewPromoCode("");
    setNewPromoValue("");
    setNewPromoDesc("");
  };

  // Remove promo code
  const handleRemovePromo = (codeToRemove: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.code !== codeToRemove));
  };

  // Add kitchen partner record
  const handleAddNewKitchen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKitchenName || !newKitchenOwner) return;
    setKitchens((prev) => [
      ...prev,
      {
        id: `k-${Date.now()}`,
        name: newKitchenName.trim(),
        owner: newKitchenOwner.trim(),
        category: newKitchenCategory,
        status: "Approved",
      },
    ]);
    setStats((prev) => ({ ...prev, activeKitchens: prev.activeKitchens + 1 }));
    setNewKitchenName("");
    setNewKitchenOwner("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn text-left">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-[#8B1A1A] to-[#6E1010] p-8 rounded-3xl text-white shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold w-max mb-2">
            <Shield className="w-4 h-4 text-[#FF6B35]" />
            <span>Root System Administrator Authorization</span>
          </div>
          <h1 className="text-3xl font-serif italic font-bold">Admin Enterprise Control Desk</h1>
          <p className="text-xs text-white/80 mt-1 max-w-xl font-medium">
            Manage partner registrations, create promotional campaign codes, monitor collective platform metrics, and control system operations securely.
          </p>
        </div>
        <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/5 font-mono text-center">
          <span className="text-[10px] text-white/60 block font-semibold uppercase tracking-wider">Access Signature</span>
          <span className="text-xs font-black text-[#FF6B35]">@Jenish_Obir_Bibash</span>
        </div>
      </div>

      {/* Grid of Key Analytical KPI metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Gross App Sales</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1">Rs. {stats.totalRevenue.toLocaleString()}</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +12.4% this month
            </span>
          </div>
          <div className="p-3 bg-[#FFF8F0] rounded-xl text-[#8B1A1A]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">System Commission (10%)</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1">Rs. {stats.commissionEarned.toLocaleString()}</h3>
            <span className="text-[10px] text-gray-400 font-medium block mt-1">Net platform earnings</span>
          </div>
          <div className="p-3 bg-[#FFF8F0] rounded-xl text-yellow-600">
            <HandCoins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Authorized Kitchens</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.activeKitchens} Partners</h3>
            <span className="text-[10px] text-[#2D6A4F] font-bold block mt-1">● Fully registered & licensed</span>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-[#2D6A4F]">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Verified Active Riders</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.activeRiders} Enrolled</h3>
            <span className="text-[10px] text-blue-600 font-bold block mt-1">Active transit couriers</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Major Split: Kitchen Partners Approval Panel & Promotions Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Aspect: Kitchen Partners Approval HUD (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-150 shadow-sm h-max">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-serif italic text-[#8B1A1A] font-bold">Local Food Kitchen Endorsements</h2>
              <p className="text-xs text-gray-400 mt-0.5">Authorizations for neighborhood standard kitchens on the app</p>
            </div>
            <span className="bg-[#8B1A1A]/10 text-[#8B1A1A] text-xxs font-mono font-black px-2.5 py-1 rounded-full uppercase">
              Operational Gate
            </span>
          </div>

          {/* New Kitchen adding form */}
          <form onSubmit={handleAddNewKitchen} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="sm:col-span-3 pb-1">
              <span className="text-xxs font-bold text-gray-500 uppercase tracking-widest block mb-1">Onboard New Approved Partner Kitchen</span>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Kitchen Name</label>
              <input
                type="text"
                required
                value={newKitchenName}
                onChange={(e) => setNewKitchenName(e.target.value)}
                placeholder="e.g. Bhaktapur Newari Khaja"
                className="w-full text-xs px-3 py-2 bg-white border border-gray-250 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Owner Practitioner Name</label>
              <input
                type="text"
                required
                value={newKitchenOwner}
                onChange={(e) => setNewKitchenOwner(e.target.value)}
                placeholder="e.g. Anil Tamrakar"
                className="w-full text-xs px-3 py-2 bg-white border border-gray-250 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Primal Category</label>
              <select
                value={newKitchenCategory}
                onChange={(e) => setNewKitchenCategory(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-white border border-gray-250 rounded-xl focus:outline-none"
              >
                <option value="Momo"> dumpling (Momo)</option>
                <option value="Newari"> Traditional Newari</option>
                <option value="Thakali"> Traditional Thakali</option>
                <option value="Chowmein"> Fried Noodles</option>
                <option value="Bakery"> Sweet Desserts</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex justify-end mt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-[#8B1A1A] hover:bg-[#2D6A4F] text-white text-xxs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Approved Enroll
              </button>
            </div>
          </form>

          {/* Kitchens render table list */}
          <div className="space-y-3.5">
            {kitchens.map((kitchen) => (
              <div
                key={kitchen.id}
                className="p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#FFF8F0]/30 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-gray-900">{kitchen.name}</h4>
                    <span className="bg-[#FFF8F0] border border-[#8B1A1A]/10 text-[#8B1A1A] text-[9px] font-mono font-black px-2 py-0.5 rounded-md">
                      {kitchen.category}
                    </span>
                  </div>
                  <div className="text-xxs text-gray-400 mt-1 flex items-center gap-1.5 font-medium">
                    <span>Practitioner Owner: {kitchen.owner}</span>
                    <span>•</span>
                    <span>License Code: FDN-{kitchen.id.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {kitchen.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => handleApproveKitchen(kitchen.id)}
                        className="p-2 py-1.5 bg-[#2D6A4F]/10 hover:bg-[#2D6A4F] text-[#2D6A4F] hover:text-white rounded-xl text-xxs font-extrabold transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleRemoveKitchen(kitchen.id)}
                        className="p-2 py-1.5 bg-red-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-xxs font-extrabold transition-all flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-50 text-[#2D6A4F] text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-[#2D6A4F]" /> Active Verified
                      </span>
                      <button
                        onClick={() => handleRemoveKitchen(kitchen.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Remove Partner Kitchen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Aspect: Promotions & System Codes Desk (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-150 shadow-sm h-max">
          <div className="flex items-center gap-2 text-[#FF6B35] font-black text-xxs uppercase tracking-wider mb-2 bg-[#FFF8F0] px-2.5 py-1 rounded-full w-max">
            <TicketPercent className="w-4 h-4" />
            Promo Control Engine
          </div>

          <h2 className="text-lg font-serif italic text-gray-900 font-bold">National Campaign Coupons</h2>
          <p className="text-xs text-gray-500 mb-6">Create promotional discount code points usable during Checkout.</p>

          <form onSubmit={handleAddPromo} className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 font-mono">Campaign Voucher Code (e.g. DUMPLINGKTM)</label>
              <input
                type="text"
                required
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value)}
                placeholder="PROMOCODE100"
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-250 rounded-xl uppercase font-mono tracking-wider focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 font-mono">Value deduction (Rs)</label>
                <input
                  type="number"
                  required
                  value={newPromoValue}
                  onChange={(e) => setNewPromoValue(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-250 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 font-mono">Type of deduction</label>
                <select className="w-full text-xs px-3 py-2.5 bg-white border border-gray-250 rounded-xl focus:outline-none">
                  <option value="flat">Flat Cash Cut</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 font-mono">Coupon Human Description</label>
              <input
                type="text"
                value={newPromoDesc}
                onChange={(e) => setNewPromoDesc(e.target.value)}
                placeholder="Rs. 100 off authentic treats"
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-250 rounded-xl focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white text-xxs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Deploy New Campaign Coupon
            </button>
          </form>

          {/* Deployed code counters list */}
          <div className="space-y-3">
            {promoCodes.map((promo) => (
              <div
                key={promo.code}
                className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-black text-gray-950 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                    {promo.code}
                  </span>
                  <p className="text-[10px] text-gray-400 font-bold mt-1.5">{promo.desc}</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-[#8B1A1A]">
                    {promo.type === "flat" ? `Rs. ${promo.value}` : `${promo.value}% Off`}
                  </span>
                  <button
                    onClick={() => handleRemovePromo(promo.code)}
                    className="text-gray-300 hover:text-rose-600 transition-colors p-1"
                    title="Revoke Campaign Code"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
