import React, { useState, useEffect } from "react";
import { Shield, Users, UtensilsCrossed, Calendar, TicketPercent, Check, X, Plus, Trash2, TrendingUp, HandCoins, MessageSquare, AlertTriangle, FileText, CheckCircle, Clock } from "lucide-react";
import GoogleFormsHub from "./GoogleFormsHub";

export default function AdminPortalPanel() {
  // Complaints and resolution states
  const [complaints, setComplaints] = useState<any[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "Submitted" | "Resolved">("all");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState("");

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.warn("Failed to load complaints in admin", err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolveComplaint = async (id: string) => {
    if (!resolutionText.trim()) return;
    try {
      const res = await fetch(`/api/complaints/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminResponse: resolutionText })
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(prev => prev.map(c => c.id === id ? data.complaint : c));
        setResolvingId(null);
        setResolutionText("");
      }
    } catch (err) {
      console.warn("Failed to resolve complaint", err);
    }
  };

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

      {/* 🚨 CUSTOMER COMPLAINTS AND DISPUTES INTERACTIVE MANAGEMENT HUB */}
      <div className="mt-8 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
          <div className="text-left">
            <span className="text-xxs bg-red-50 border border-red-200 text-red-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              Sentinel Dispute Center
            </span>
            <h2 className="text-xl font-serif italic text-gray-950 font-bold mt-1">
              Active Customer Complaints & Appeals
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Review and resolve platform disputes, rider delays, transaction problems, or partner kitchen issues live.
            </p>
          </div>

          {/* Filtering controls */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {(["all", "Submitted", "Resolved"] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterStatus(tab)}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterStatus === tab ? "bg-white text-slate-900 shadow-sm" : "text-gray-500 hover:text-slate-800"
                }`}
              >
                {tab === "all" ? "All Issues" : tab}
              </button>
            ))}
          </div>
        </div>

        {complaintsLoading ? (
          <div className="py-12 text-center text-xs text-gray-400 font-mono">
            <Clock className="w-8 h-8 text-[#8B1A1A] animate-spin mx-auto mb-2" />
            Loading live customer complaint records from remote database...
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 font-mono">
            No customer complaints filed in the system database yet.
          </div>
        ) : (
          <div className="space-y-4">
            {complaints
              .filter(c => filterStatus === "all" || c.status === filterStatus)
              .map(comp => (
                <div key={comp.id} className="border border-gray-150 rounded-2xl p-5 hover:bg-slate-50/50 transition-all text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-gray-900">#{comp.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                          comp.urgency === "Emergency" ? "bg-red-100 text-red-800 border-red-200 animate-pulse border-2" :
                          comp.urgency === "High" ? "bg-orange-100 text-orange-850 border-orange-200 font-extrabold" :
                          comp.urgency === "Medium" ? "bg-amber-100 text-amber-850 border-amber-200" : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {comp.urgency}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                          comp.status === "Resolved" ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold" : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}>
                          {comp.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                        Submitted by: <strong className="text-gray-700">{comp.userName}</strong> ({comp.userEmail}) • Contact: {comp.userPhone || "N/A"}
                      </p>
                    </div>

                    <div className="text-right text-[10px] text-gray-400 font-mono">
                      {new Date(comp.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#8B1A1A] bg-[#FFF8F0]/40 px-3 py-1.5 rounded-xl border border-orange-100/30">
                      <span>Classification: <strong>{comp.issueType}</strong></span>
                      {comp.orderId && <span>• Order ID: <strong>#{comp.orderId}</strong></span>}
                      {comp.restaurantName && <span>• Restaurant Partner: <strong>{comp.restaurantName}</strong></span>}
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                      {comp.description}
                    </p>

                    {comp.screenshot && (
                      <div className="pt-1">
                        <span className="text-[9px] text-gray-400 font-bold block mb-1">Customer Screenshot / Receipt Evidence:</span>
                        <a href={comp.screenshot} target="_blank" rel="noreferrer" className="inline-block border border-gray-200 rounded-lg overflow-hidden hover:opacity-90 max-w-[120px]">
                          <img src={comp.screenshot} alt="Screenshot evidence" className="max-h-20 object-cover" />
                        </a>
                      </div>
                    )}

                    {comp.status === "Resolved" ? (
                      <div className="bg-emerald-50/50 border border-emerald-250 p-4 rounded-xl space-y-1.5">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Resolution dispatch response
                        </span>
                        <p className="text-xs text-emerald-950 font-medium italic">
                          "{comp.adminResponse}"
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                        {resolvingId === comp.id ? (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wider block font-mono">
                              Draft Custom Resolution Text & Compensation Actions
                            </label>
                            <textarea
                              rows={3}
                              value={resolutionText}
                              onChange={(e) => setResolutionText(e.target.value)}
                              placeholder="Hajur! We are extremely sorry for the inconvenience... [Advise customer on points auto-credited safely]"
                              className="w-full text-xs p-3 bg-white border border-gray-250 rounded-xl focus:outline-none"
                            />
                            <div className="flex justify-end gap-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setResolvingId(null);
                                  setResolutionText("");
                                }}
                                className="px-3.5 py-1.5 border border-gray-200 text-slate-700 rounded-lg text-xxs font-bold hover:bg-slate-100 transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResolveComplaint(comp.id)}
                                className="px-4 py-1.5 bg-[#2D6A4F] hover:bg-emerald-700 text-white rounded-lg text-xxs font-extrabold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Dispatch Resolution & Credit Points
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-[10px] text-slate-500 font-medium font-mono">
                              Needs Human Customer Resolution Assistance
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setResolvingId(comp.id);
                                setResolutionText(
                                  comp.urgency === "High" || comp.urgency === "Emergency"
                                    ? "Hajur, we are deeply concerned about this incident context. A senior Support Sentinel has resolved your dispute, and Rs. 150 loyalty points have been auto-credited back to your FoodiePoints! Thank you."
                                    : "Thank you for your valuable feedback. Our customer support sentinel has investigated and resolved the issue context successfully. Please let us know if anything remains!"
                                );
                              }}
                              className="px-4.5 py-2 bg-slate-800 hover:bg-[#8B1A1A] border border-transparent rounded-xl text-xxs font-black uppercase text-white hover:text-white hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Resolve Appeal
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Dynamic Google Workspace Forms Hub */}
      <div className="mt-8">
        <GoogleFormsHub />
      </div>

    </div>
  );
}
