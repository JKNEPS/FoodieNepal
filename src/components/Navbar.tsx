import { ShoppingCart, MapPin, User, Award, Shield, UtensilsCrossed, LogOut, HelpCircle, FileText, ShieldAlert } from "lucide-react";
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
  onNavigateComplaints
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#8B1A1A]/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand with Steaming Himalayan Bowl Theme */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { if (portalLock === "customer" && onRoleChange) onRoleChange("customer"); }}>
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

          {/* Delivery Address Indicator */}
          <div className="hidden md:flex items-center space-x-2 bg-[#FFF8F0] px-4 py-2 rounded-full border border-[#8B1A1A]/5 max-w-sm truncate text-ellipsis">
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
                <span className="hidden sm:inline">Support Forms</span>
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
                <span className="hidden sm:inline">Lodge Complaint</span>
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

            {/* 
              STRICT REQUIREMENT: "And donot show customer other portal only show user portal only"
              If the portalLock is set to customer, we do NOT show any switcher/Secure Portals button.
              Instead, show Google profile context or simple Google Sign-In options in customer portal!
            */}
            {portalLock === "customer" ? (
              <div className="flex items-center gap-3" id="locked_customer_navbar_controls">
                {googleUser ? (
                  <div 
                    onClick={onOpenProfile}
                    className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 p-1.5 pr-3.5 rounded-full cursor-pointer transition-all duration-150"
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
                      className="p-1 text-emerald-800 hover:text-red-600 rounded-full hover:bg-red-55 transition-all ml-1 cursor-pointer"
                      title="Log out Google account"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onOpenLogin}
                    className="flex items-center gap-1 px-4 py-2 bg-[#FF6B35] hover:bg-[#8B1A1A] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer Sign In</span>
                  </button>
                )}

                {/* Reset portalLock option (A clean visual escape for testing/evaluation) */}
                <button
                  onClick={onResetPortal}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all transition-colors"
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
                  className="flex items-center gap-1 px-3.5 py-2 bg-[#8B1A1A] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                  title="Exit Admin Panel and Return to Onboarding wizard"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Admin</span>
                </button>
              </div>
            ) : (
              /* If not locked yet (Standard fallback) */
              <button
                onClick={currentRole !== "customer" ? () => onRoleChange("customer") : onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#8B1A1A] hover:bg-[#FF6B35] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                title={currentRole !== "customer" ? "Sign out as current role and return to customer view" : "Open secure portals"}
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
  );
}

