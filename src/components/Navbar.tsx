import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingCart, MapPin, User, Award, Shield, UtensilsCrossed, 
  LogOut, HelpCircle, FileText, ShieldAlert, Menu, X, 
  Search, Compass, Flame, Gamepad2, Sparkles, Activity, 
  ChevronRight, Laptop, Info, Tag
} from "lucide-react";
import { UserRole, User as UserType } from "../types";

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  cartCount: number;
  onCartToggle: () => void;
  foodiePoints: number;
  currentAddress: string;
  onOpenLogin: () => void;
  portalLock: "customer" | "admin" | null;
  googleUser: UserType | null;
  onGoogleSignOut: () => void;
  onResetPortal: () => void;
  onOpenProfile: () => void;
  currentView?: string;
  onNavigateForms?: () => void;
  onNavigateComplaints?: () => void;
  onNavigateHome?: () => void;
  onOpenAR?: () => void;
  onOpenCookGame?: () => void;
  onToggleCyberHub?: () => void;
}

export default function Navbar({
  currentRole,
  onRoleChange,
  cartCount,
  onCartToggle,
  foodiePoints,
  currentAddress,
  onOpenLogin,
  portalLock,
  googleUser,
  onGoogleSignOut,
  onResetPortal,
  onOpenProfile,
  currentView,
  onNavigateForms,
  onNavigateComplaints,
  onNavigateHome,
  onOpenAR,
  onOpenCookGame,
  onToggleCyberHub
}: NavbarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when drawer opens
  useEffect(() => {
    if (isDrawerOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isDrawerOpen]);

  // Comprehensive master app directory & indexes (matches all features of app)
  const featuresDirectory = [
    { 
      id: "feat_home",
      name: "🏠 Home Main feed", 
      type: "view", 
      target: "home", 
      tags: ["main", "feed", "dashboard", "explore"], 
      description: "Return to the main page to search restaurant food menus." 
    },
    { 
      id: "feat_trending",
      name: "🔥 Trending Dishes Near You", 
      type: "scroll", 
      target: "trending-dishes-section", 
      tags: ["maps", "popular", "trending", "gps", "dishes", "momo", "thali"], 
      description: "Google Maps-grounded trending local food with live distance tracking." 
    },
    { 
      id: "feat_restaurants",
      name: "🏪 Partner Restaurants & Kitchens", 
      type: "scroll", 
      target: "restaurant-cards", 
      tags: ["partner", "restaurants", "rating", "kitchen", "vendors"], 
      description: "Browse certified neighborhood kitchens and their authentic menus." 
    },
    { 
      id: "feat_popular",
      name: "🔥 Popular Food Delicacies", 
      type: "scroll", 
      target: "popular-deals", 
      tags: ["popular", "best seller", "top", "dishes", "momo", "sel roti", "jalebi"], 
      description: "High-demand local delicacies loved by standard foodies." 
    },
    { 
      id: "feat_bazaar",
      name: "🎁 Points Rewards & Prize Bazaar", 
      type: "scroll", 
      target: "loyalty-bazaar", 
      tags: ["redeem", "rewards", "prizes", "bazaar", "points", "free momo"], 
      description: "Redeem zero-price delicacies using accumulated brand loyalty points." 
    },
    { 
      id: "feat_leaderboard",
      name: "🏆 Top Foodies Leaderboard", 
      type: "scroll", 
      target: "loyalty-leaderboard", 
      tags: ["leaderboard", "rank", "standings", "points", "king", "queen"], 
      description: "Local community leaderboard. Watch the topmost food sovereign scores." 
    },
    { 
      id: "feat_cuisines",
      name: "🥣 Interactive Cuisines Bar", 
      type: "scroll", 
      target: "cuisine-bar", 
      tags: ["momo", "newari", "thakali", "chowmein", "bakery", "street food"], 
      description: "Browse specific horizontal category filters with beautiful icons." 
    },
    { 
      id: "feat_ar",
      name: "🕶️ 3D AR Live Food Viewer", 
      type: "action", 
      action: "ar", 
      tags: ["ar", "3d", "augmented reality", "preview", "momo model"], 
      description: "Inspect dishes in your room using high-fidelity spatial 3D simulations." 
    },
    { 
      id: "feat_cook",
      name: "🍳 Himalayan Kitchen Cook Game", 
      type: "action", 
      action: "cook", 
      tags: ["game", "play", "cooking", "simulation", "points boost"], 
      description: "Play cooking challenge game to learn traditional recipes and boost points." 
    },
    { 
      id: "feat_cyber",
      name: "⚡ Cyberpunk Telemetry Stats HUD", 
      type: "action", 
      action: "cyber", 
      tags: ["cyber", "tech", "stats", "telemetry", "dev", "logs"], 
      description: "Toggle developer operations stats and raw real-time telemetry." 
    },
    { 
      id: "feat_forms",
      name: "📋 Support Form Survey Hub", 
      type: "action", 
      action: "forms", 
      tags: ["google forms", "support", "forms", "survey", "academic", "feedback"], 
      description: "Connect to Google forms support feedback & academic spreadsheets." 
    },
    { 
      id: "feat_complaints",
      name: "⚖️ Dispute & Complaints Lodger", 
      type: "action", 
      action: "complaints", 
      tags: ["complaint", "dispute", "refund", "ticket", "admin", "chat"], 
      description: "Register complaints directly to our grievance portal for quick refunds." 
    },
    { 
      id: "feat_rider",
      name: "🛵 Courier Rider Panel", 
      type: "role", 
      role: "rider", 
      tags: ["rider", "driver", "courier", "deliver", "tracking"], 
      description: "Simulate rider dashboard with interactive map routing, payouts and tips." 
    },
    { 
      id: "feat_vendor",
      name: "🥘 Partner Cook Vendor Panel", 
      type: "role", 
      role: "vendor", 
      tags: ["vendor", "cook", "chef", "merchant", "dishes"], 
      description: "Simulate kitchen dashboard, update inventories, and adjust pricing." 
    },
    { 
      id: "feat_profile",
      name: "👤 Customer Profile Hub", 
      type: "action", 
      action: "profile", 
      tags: ["profile", "settings", "username", "account", "address"], 
      description: "Edit your name, contact phone, default delivery address information." 
    },
    { 
      id: "feat_delivery_charges",
      name: "📋 Official Delivery Charges Guide", 
      type: "action", 
      action: "delivery-charges", 
      tags: ["delivery", "charge", "fee", "cost", "distance", "rates", "tariffs"], 
      description: "View full structural delivery rates for Fresh Mandi, Onemart, and restaurant zones." 
    }
  ];

  // Search filtering logic
  const filteredNavigations = searchQuery.trim() === "" 
    ? featuresDirectory 
    : featuresDirectory.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // Navigation click dispatcher
  const handleFeatureSelection = (feat: typeof featuresDirectory[0]) => {
    setIsDrawerOpen(false);
    setSearchQuery("");

    // Verify first that view switches to home if scrolling local sections
    if (feat.type === "scroll") {
      if (onNavigateHome) {
        onNavigateHome();
      }
      // Delay slightly to give time for view rendering state to commit, then scroll
      setTimeout(() => {
        const targetElement = document.getElementById(feat.target);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
          // Highlight target briefly
          targetElement.classList.add("ring-4", "ring-[#FF6B35]/30", "transition-all");
          setTimeout(() => {
            targetElement.classList.remove("ring-4", "ring-[#FF6B35]/30");
          }, 1500);
        }
      }, 250);
    } 
    else if (feat.type === "view") {
      if (feat.target === "home" && onNavigateHome) {
        onNavigateHome();
      }
    } 
    else if (feat.type === "action") {
      if (feat.action === "ar" && onOpenAR) {
        onOpenAR();
      } else if (feat.action === "cook" && onOpenCookGame) {
        onOpenCookGame();
      } else if (feat.action === "cyber" && onToggleCyberHub) {
        onToggleCyberHub();
      } else if (feat.action === "forms" && onNavigateForms) {
        onNavigateForms();
      } else if (feat.action === "complaints" && onNavigateComplaints) {
        onNavigateComplaints();
      } else if (feat.action === "profile") {
        onOpenProfile();
      } else if (feat.action === "delivery-charges") {
        window.dispatchEvent(new CustomEvent("foodienepal_show_delivery_charges"));
      }
    } 
    else if (feat.type === "role") {
      if (portalLock && portalLock !== feat.role) {
        // Prevent if strictly locked in other roles by admin settings
        alert(`Cannot switch! This evaluation sandbox is pre-locked to ${portalLock.toUpperCase()}`);
      } else {
        onRoleChange(feat.role as UserRole);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#8B1A1A]/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Hamburger (3 Line) & Brand Trigger Block */}
            <div className="flex items-center space-x-3.5">
              {/* Menu (3 line) trigger */}
              <button
                id="global-hamburger-menu-trigger"
                onClick={() => setIsDrawerOpen(true)}
                className="p-2.5 text-gray-700 hover:text-[#FF6B35] hover:bg-[#FFF8F0] active:scale-95 border border-gray-150 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-xs"
                title="Open Navigation Menu & App Feature Search"
              >
                <Menu className="w-5.5 h-5.5 text-gray-700" />
              </button>

              {/* Logo Brand with Steaming Himalayan Bowl Theme */}
              <div 
                className="flex items-center space-x-3 cursor-pointer" 
                onClick={() => { 
                  if (portalLock === "customer" && onRoleChange) {
                    onRoleChange("customer");
                  }
                  if (onNavigateHome) {
                    onNavigateHome();
                  }
                }}
              >
                <div className="relative p-2.5 bg-[#8B1A1A] rounded-xl text-white shadow-md shadow-[#8B1A1A]/10">
                  <UtensilsCrossed className="w-5 h-5 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF6B35] rounded-full animate-ping" />
                </div>
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="font-extrabold text-2xl tracking-tight text-[#8B1A1A]">
                      Foodie<span className="text-[#FF6B35]">Nepal</span>
                    </span>
                    <span className="text-[10px] text-[#2D6A4F] font-bold tracking-widest hidden sm:inline">NPR</span>
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#2D6A4F] leading-none hidden sm:block">
                    Your Local Flavor, Delivered
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address Indicator */}
            <div className="hidden lg:flex items-center space-x-2 bg-[#FFF8F0] px-4 py-2 rounded-full border border-[#8B1A1A]/5 max-w-sm truncate text-ellipsis">
              <MapPin className="w-4 h-4 text-[#FF6B35] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#8B1A1A] truncate">
                {currentAddress && currentAddress.toLowerCase().includes("pokhara") ? "Pokhara, Nepal" : (currentAddress || "Pokhara, Nepal")}
              </span>
            </div>

            {/* User Status Block */}
            <div className="flex items-center space-x-4">
              {/* Loyalty Points Panel */}
              <div className="flex items-center space-x-1 bg-[#2D6A4F]/10 px-3 py-2 rounded-full border border-[#2D6A4F]/20 text-[#2D6A4F]">
                <Award className="w-4 h-4 text-[#2D6A4F]" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider">{googleUser ? googleUser.foodiePoints : foodiePoints} pts</span>
              </div>

              {/* Google Forms Support Hub Trigger */}
              {portalLock === "customer" && onNavigateForms && (
                <button
                  onClick={onNavigateForms}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    currentView === "forms" 
                      ? "bg-purple-55 border-purple-200 text-purple-700 font-extrabold" 
                      : "text-slate-600 border-gray-200 hover:bg-[#FFF8F0]/30 hover:border-purple-200 hover:text-purple-700"
                  }`}
                  title="Google Forms Complaint Hub"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Support Forms</span>
                </button>
              )}

              {/* Native Customer Complaints Portal Trigger */}
              {portalLock === "customer" && onNavigateComplaints && (
                <button
                  onClick={onNavigateComplaints}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    currentView === "complaints" 
                      ? "bg-red-50 border-red-200 text-[#8B1A1A] font-extrabold" 
                      : "text-slate-600 border-gray-200 hover:bg-[#FFF8F0]/30 hover:border-red-200 hover:text-[#8B1A1A]"
                  }`}
                  title="File a Dispute or Complaint"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span className="hidden md:inline">Lodge Complaint</span>
                </button>
              )}

              {/* Shopping Cart Button Tag */}
              {currentRole === "customer" && (
                <button
                  id="navbar-cart-btn"
                  onClick={onCartToggle}
                  className="relative p-2.5 text-gray-700 hover:text-[#FF6B35] hover:bg-[#FFF8F0] rounded-xl transition-all border border-transparent hover:border-[#8B1A1A]/5"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-[#FF6B35] rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {portalLock === "customer" ? (
                <div className="flex items-center gap-2" id="locked_customer_navbar_controls">
                  {googleUser ? (
                    <div 
                      onClick={onOpenProfile}
                      className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 p-1.5 pr-3 rounded-full cursor-pointer transition-all duration-150"
                      title="View & Edit User Profile"
                    >
                      <img 
                        src={googleUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                        alt="Google avatar" 
                        className="w-7 h-7 rounded-full object-cover border border-emerald-500 hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left hidden sm:block">
                        <p className="text-[10px] font-bold text-emerald-900 leading-none truncate max-w-[80px]" title={googleUser.name}>
                          {googleUser.name}
                        </p>
                        <span className="text-[8px] font-mono text-emerald-600 tracking-wider font-semibold block mt-0.5">MY PROFILE</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGoogleSignOut();
                        }}
                        className="p-1 text-emerald-800 hover:text-red-600 rounded-full hover:bg-red-55 transition-all ml-1 cursor-pointer font-sans"
                        title="Log out Google account"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={onOpenLogin}
                      className="flex items-center gap-1 px-4 py-2 bg-[#FF6B35] hover:bg-[#8B1A1A] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span className="whitespace-nowrap">Sign In</span>
                    </button>
                  )}

                  {/* Reset portalLock option (A clean visual escape for testing/evaluation) */}
                  <button
                    onClick={onResetPortal}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                    title="Switch Role Portal (Evaluation & Demo)"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : portalLock === "admin" ? (
                <div className="flex items-center gap-2" id="locked_admin_navbar_controls">
                  <span className="px-3 py-1 bg-[#8B1A1A]/10 text-[#8B1A1A] border border-[#8B1A1A]/20 font-bold text-[10px] uppercase tracking-wider rounded-full font-mono">
                    Admin Active
                  </span>
                  <button
                    onClick={onResetPortal}
                    className="flex items-center gap-1 px-3.5 py-2 bg-[#8B1A1A] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Exit Admin Panel"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit Admin</span>
                  </button>
                </div>
              ) : (
                /* standard fallback switcher */
                <button
                  onClick={currentRole !== "customer" ? () => onRoleChange("customer") : onOpenLogin}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#8B1A1A] hover:bg-[#FF6B35] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {currentRole !== "customer" ? (
                    <>
                      <Shield className="w-3.5 h-3.5 text-[#FF6B35]" />
                      <span>Log Out ({currentRole.toUpperCase()})</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5" />
                      <span>Secure Portals</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer Menu with full global search */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black z-50 transition-opacity"
            />

            {/* Sidebar content container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col justify-between overflow-hidden border-r border-[#8B1A1A]/10"
              id="sidebar-navigation-drawer"
            >
              {/* Drawer Header context */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#8B1A1A] to-[#6b1414] text-white">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-white/10 rounded-lg text-[#FFF8F0]"><Compass className="w-5 h-5 animate-spin-slow" /></span>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight">FoodieNepal Direct Directory</h3>
                    <p className="text-[9px] text-[#FF6B35] font-black uppercase tracking-wider font-mono">Simulate & Navigate</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setSearchQuery("");
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition"
                  title="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Master Feature Search Input tool */}
              <div className="p-4 bg-gray-50 border-b border-gray-100 uppercase text-xs">
                <div className="relative flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-500 shadow-inner focus-within:border-[#FF6B35] transition-all">
                  <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search feature, code route, or section..."
                    className="w-full bg-transparent border-none text-xs focus:outline-none text-gray-800 placeholder-gray-400 py-0.5"
                  />
                  {searchQuery.trim() !== "" && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600 font-extrabold text-xs ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Drawer Navigation List with filtered indexes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredNavigations.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-2 px-4">
                    <p className="text-xs font-bold text-gray-700">No match for "{searchQuery}"</p>
                    <p className="text-[10px] text-gray-400 leading-normal">
                      Try general tags like "Momo", "Thakali", "Complaints", "Game", "Dashboard", or "Rider"!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono mb-2">
                      {searchQuery.trim() === "" ? "🌐 Complete Features Catalog" : `🔎 Matched Features (${filteredNavigations.length})`}
                    </p>
                    {filteredNavigations.map((feat) => {
                      const isActive = currentView === feat.target;
                      return (
                        <button
                          key={feat.id}
                          onClick={() => handleFeatureSelection(feat)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl text-left border transition-all cursor-pointer ${
                            isActive 
                              ? "bg-orange-50/70 border-orange-200 text-[#8B1A1A] shadow-xs" 
                              : "bg-white hover:bg-gray-50 border-gray-150 text-gray-800 hover:border-gray-250 hover:-translate-y-0.5 shadow-xs"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[11.5px] font-black tracking-tight">{feat.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-normal leading-snug">{feat.description}</p>
                            
                            {/* Visual pill trackers */}
                            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                                feat.type === "scroll" ? "bg-[#2D6A4F]/10 text-[#2D6A4F]" :
                                feat.type === "action" ? "bg-purple-100 text-purple-800" :
                                feat.type === "role" ? "bg-amber-100 text-amber-800" : "bg-blue-105 text-blue-800"
                              }`}>
                                {feat.type}
                              </span>
                              {feat.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[7.5px] bg-gray-100 text-gray-400 px-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drawer Footer panel details */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-[#8B1A1A]" />
                  <span className="text-[10px] font-black font-serif italic text-gray-700">FoodieNepal Express Sandbox</span>
                </div>
                <p className="text-[8.5px] text-gray-400 font-mono tracking-wide mt-1">Authorized Evaluation Version - 2026</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
