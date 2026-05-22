import { ShoppingCart, MapPin, User, Award, Shield, UtensilsCrossed, Bike, Store } from "lucide-react";
import { UserRole } from "../types";

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  cartCount: number;
  onCartToggle: () => void;
  foodiePoints: number;
  currentAddress: string;
  onOpenLogin: () => void;
}

export default function Navbar({
  currentRole,
  onRoleChange,
  cartCount,
  onCartToggle,
  foodiePoints,
  currentAddress,
  onOpenLogin
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#8B1A1A]/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand with Steaming Himalayan Bowl Theme */}
          <div className="flex items-center space-x-3 cursor-pointer">
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
              <span className="text-xs font-bold font-mono uppercase tracking-wider">{foodiePoints} pts</span>
            </div>

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

            {/* Distinct Gateways Login Button */}
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
          </div>
        </div>
      </div>
    </header>
  );
}
