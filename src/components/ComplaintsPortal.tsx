import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertOctagon, 
  Send, 
  History, 
  Upload, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  X, 
  MessageSquare, 
  FileText, 
  ArrowLeft,
  Coins,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { Complaint, Order, User } from "../types";

interface ComplaintsPortalProps {
  googleUser: User | null;
  onBack: () => void;
  onOpenLogin: () => void;
}

export default function ComplaintsPortal({ googleUser, onBack, onOpenLogin }: ComplaintsPortalProps) {
  // Local states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // New Complaint form states
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [issueType, setIssueType] = useState("Order Delayed ⏳");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"Low" | "Medium" | "High" | "Emergency">("Medium");
  const [screenshot, setScreenshot] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Tab control
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load complaints and orders on login
  useEffect(() => {
    if (googleUser) {
      fetchComplaints();
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [googleUser]);

  const fetchComplaints = async () => {
    if (!googleUser) return;
    try {
      const res = await fetch(`/api/complaints?userId=${googleUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.warn("Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.warn("Failed to fetch orders", err);
    }
  };

  // Prefill restaurant when order is selected
  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    if (!orderId) {
      setRestaurantName("");
      return;
    }
    const matched = orders.find(o => o.id === orderId);
    if (matched) {
      setRestaurantName(matched.restaurantName);
    }
  };

  // Convert uploaded image to base64 for embedding
  const processFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setScreenshot(e.target.result as string);
        setErrorMsg("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Submit Complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser) {
      onOpenLogin();
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Please enter a detailed description of your complaint.");
      return;
    }

    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        userId: googleUser.id,
        userEmail: googleUser.email,
        userName: googleUser.name,
        userPhone: googleUser.phone,
        orderId: selectedOrderId || undefined,
        restaurantName: restaurantName || undefined,
        issueType,
        description,
        urgency,
        screenshot
      };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Hajur! Complaint successfully filed with ID #${data.complaint.id}. Our customer support sentinel is on the way.`);
        setComplaints(prev => [data.complaint, ...prev]);
        
        // Reset fields
        setDescription("");
        setSelectedOrderId("");
        setRestaurantName("");
        setScreenshot("");
        
        // Stagger navigation to log history
        setTimeout(() => {
          setActiveTab("history");
          setSuccessMsg("");
        }, 3500);
      } else {
        setErrorMsg("Failed to lodge complaint on the server. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("A network timeout occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper values for styling Badges
  const getUrgencyBadge = (val: string) => {
    switch (val) {
      case "Low":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Medium":
        return "bg-amber-100 text-amber-850 border-amber-200";
      case "High":
        return "bg-orange-100 text-orange-850 border-orange-200 font-extrabold";
      case "Emergency":
        return "bg-red-100 text-red-800 border-red-200 font-extrabold animate-pulse border-2";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Under Investigation":
        return "bg-[#FFF8F0] text-amber-800 border-amber-200";
      case "Resolved":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (!googleUser) {
    return (
      <div className="max-w-xl mx-auto my-12 px-6 py-10 bg-white rounded-3xl border border-gray-150 shadow-sm text-center">
        <AlertOctagon className="w-16 h-16 text-[#8B1A1A] mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-serif italic text-gray-800 font-extrabold">Secure Complaint Portal</h3>
        <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Please log in with Google & Gmail authorization to file, track, and monitor complaints, rider alerts, or delivery disputes securely.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-slate-50 text-xs font-bold transition-all text-slate-700"
          >
            Go back
          </button>
          <button
            onClick={onOpenLogin}
            className="px-6 py-2.5 rounded-xl bg-[#8B1A1A] hover:bg-[#FF6B35] text-white text-xs font-bold transition-all shadow-md"
          >
            Authenticate Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 md:px-0">
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden" id="complaints-system-widget">
        
        {/* Banner with Himalayan aesthetic */}
        <div className="bg-slate-50 border-b border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#8B1A1A]/10 border border-[#8B1A1A]/20 rounded-full text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Customer Resolution Desk</span>
            </div>
            <h2 className="text-xl font-serif italic font-bold mt-1 text-slate-800 flex items-center gap-1.5">
              FoodieNepal Complaint Centre
            </h2>
            <p className="text-xs text-gray-500">
              Submit a support query, report vendor hygiene issue, or track rider delays. We resolve disputes instantly!
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("new")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "new" ? "bg-white text-[#8B1A1A] shadow-sm" : "text-gray-500 hover:text-slate-800"
              }`}
            >
              <Send className="w-3 h-3" />
              <span>File Dispute</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === "history" ? "bg-white text-[#8B1A1A] shadow-sm" : "text-gray-500 hover:text-slate-800"
              }`}
            >
              <History className="w-3 h-3" />
              <span>Log History</span>
              {complaints.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {complaints.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === "new" ? (
              <motion.form 
                key="new-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSubmit}
                className="space-y-5 text-left"
              >
                {/* Alert Toast notification inside workspace */}
                {successMsg && (
                  <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl flex items-start gap-2.5 text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium leading-relaxed">{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-4 bg-red-50 text-red-800 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Order */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Map to Order (Optional)
                    </label>
                    <select
                      value={selectedOrderId}
                      onChange={(e) => handleOrderChange(e.target.value)}
                      className="w-full text-xs font-medium border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]/10 bg-[#FFF8F0]/10"
                    >
                      <option value="">-- No Direct Order Reference --</option>
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>
                          #{o.id} - {o.restaurantName} (Rs. {o.total})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Restaurant Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Restaurant Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g. Momo House Patan"
                      className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]/10 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Issue Category */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Issue Classification
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full text-xs font-medium border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]/10 bg-white"
                    >
                      <option>Order Delayed ⏳</option>
                      <option>Incorrect or Missing Item 🍔</option>
                      <option>Rider Behavior 🚴</option>
                      <option>Payment/Billing Dispute 💸</option>
                      <option>App Bug / Technical Issue 💻</option>
                      <option>Other Custom Issue ⚙️</option>
                    </select>
                  </div>

                  {/* Urgency */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Urgency Level
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-gray-100">
                      {(["Low", "Medium", "High", "Emergency"] as const).map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUrgency(u)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            urgency === u
                              ? u === "Emergency"
                                ? "bg-red-800 text-white"
                                : u === "High"
                                ? "bg-orange-600 text-white"
                                : u === "Medium"
                                ? "bg-amber-500 text-slate-900"
                                : "bg-slate-700 text-white"
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          {u} {u === "Emergency" ? "🚨" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Detailed Explanation
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {description.length}/1000 char
                    </span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.substring(0, 1000))}
                    placeholder="Hajur! Please provide elaborate details of what occurred (time of incident, menu items missed, transaction numbers, etc.) so we can solve it instantly..."
                    rows={4}
                    className="w-full text-xs border border-gray-200 rounded-2xl p-3 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]/10 bg-white"
                  />
                </div>

                {/* Simulated File Upload Drag & Drop area */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Upload Screenshot / Receipt Evidence (PNG, JPG)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-150 cursor-pointer ${
                      isDragOver
                        ? "border-[#8B1A1A] bg-orange-50/50 scale-[0.99]"
                        : "border-gray-200 hover:border-orange-200 hover:bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {screenshot ? (
                      <div className="relative inline-block max-w-[200px] mx-auto border border-gray-150 rounded-xl overflow-hidden shadow-xs">
                        <img 
                          src={screenshot} 
                          alt="Screenshot upload preview" 
                          className="max-h-24 object-cover" 
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setScreenshot("");
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-all"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-semibold text-slate-650">
                          Drag and drop screenshot here, or <span className="text-[#8B1A1A] underline">click to browse</span>
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          Image payload will be synchronized directly to remote node
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prefilled Identity indicator */}
                <div className="bg-slate-50 p-3 rounded-xl border border-gray-150 text-[10px] text-gray-500 leading-normal">
                  <span className="font-bold text-slate-700">Submitter Credentials:</span> {googleUser.name} ({googleUser.email}) • Standard Contact: {googleUser.phone || "N/A"}. Submitting creates a real-time tracking token linked to your foodie profile.
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Close Portal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#FF6B35] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer focus:ring-2 focus:ring-[#8B1A1A]/20"
                  >
                    {submitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Filing Dispute...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>File Complaint</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="history-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 text-left"
              >
                {loading ? (
                  <div className="py-20 text-center">
                    <Clock className="w-10 h-10 text-[#8B1A1A] animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-400 font-mono">Loading your secure resolution history...</p>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl bg-slate-50/50">
                    <FileText className="w-12 h-12 text-[#8B1A1A]/30 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-slate-600">No Complaints filed yet</h4>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
                      All your lodged feedback and disputes regarding FoodieNepal orders will appear here. Enjoy your delicious food!
                    </p>
                    <button
                      onClick={() => setActiveTab("new")}
                      className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-900 border border-transparent rounded-lg text-[10px] font-bold text-white transition-all shadow-sm"
                    >
                      File first complaint
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white border border-gray-150 rounded-2.5xl overflow-hidden shadow-xs hover:shadow-sm transition-all p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 font-mono">#{item.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getUrgencyBadge(item.urgency)}`}>
                                {item.urgency}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono">
                              Filed on: {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Issue Details info block */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#8B1A1A] bg-[#FFF8F0]/30 px-3 py-1.5 rounded-xl border border-orange-100/30">
                            <div>
                              <span className="text-[9px] text-gray-400 font-normal uppercase block">Classification</span>
                              {item.issueType}
                            </div>
                            {item.orderId && (
                              <div>
                                <span className="text-[9px] text-gray-400 font-normal uppercase block">Mapped Order</span>
                                #{item.orderId}
                              </div>
                            )}
                            {item.restaurantName && (
                              <div>
                                <span className="text-[9px] text-gray-400 font-normal uppercase block">Restaurant Partner</span>
                                {item.restaurantName}
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-slate-650 leading-relaxed pt-1.5 whitespace-pre-line">
                            {item.description}
                          </p>

                          {/* Screenshot embed */}
                          {item.screenshot && (
                            <div className="pt-2">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Attached Exhibit</span>
                              <a href={item.screenshot} target="_blank" rel="noreferrer" className="inline-block border border-gray-250 rounded-lg overflow-hidden hover:opacity-90 max-w-[120px]">
                                <img src={item.screenshot} alt="Lodged complaint evidence" className="max-h-20 object-cover" />
                              </a>
                            </div>
                          )}

                          {/* Human resolver response block if resolved */}
                          {item.status === "Resolved" && (
                            <div className="mt-4 bg-[#2D6A4F]/5 border border-[#2D6A4F]/25 rounded-2xl p-4 space-y-2 animate-fadeIn relative">
                              <div className="absolute top-3 right-3 text-emerald-800">
                                <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                              </div>
                              <span className="text-[9px] bg-emerald-100 text-emerald-900 border border-emerald-250 font-extrabold uppercase px-2 py-0.5 rounded-md flex-shrink-0 tracking-widest inline-block">
                                Official Customer Care response
                              </span>
                              <p className="text-xs font-medium text-emerald-950 leading-relaxed italic">
                                "{item.adminResponse || "Hajur! We have investigated the delay/error and credited foodie loyalty points to compensate for the trouble. Thank you for making FoodieNepal great!"}"
                              </p>
                              
                              {(item.issueType.includes("Delay") || item.urgency === "High" || item.urgency === "Emergency") && (
                                <div className="pt-2 border-t border-emerald-200/50 flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold font-mono">
                                  <Coins className="w-3.5 h-3.5" />
                                  <span>🚀补偿 points: +150 FoodiePoints auto-added to loyalty register!</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
