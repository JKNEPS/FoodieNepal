import { Heart, Compass, ShieldCheck, MapPin, Coffee, Globe } from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [mapType, setMapType] = useState<"standard" | "satellite">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("foodienepal_map_view_type") as "standard" | "satellite") || "standard";
    }
    return "standard";
  });

  const toggleMapView = () => {
    const nextType = mapType === "standard" ? "satellite" : "standard";
    setMapType(nextType);
    localStorage.setItem("foodienepal_map_view_type", nextType);
    window.dispatchEvent(
      new CustomEvent("foodienepal_map_view_type_changed", { detail: nextType })
    );
  };

  return (
    <footer id="global_application_footer" className="bg-[#FFF8F0] border-t border-[#8B1A1A]/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          
          {/* Brand/Identity block */}
          <div className="space-y-4 md:col-span-1" id="footer_brand_section">
            <div className="flex items-center gap-2">
              <span className="text-xl font-serif italic font-extrabold text-[#8B1A1A] tracking-tight">
                Foodie<span className="text-[#FF6B35]">Nepal</span>
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              Savoring the rich culinary heritage of Nepal. Order fresh MOMO, traditional Thakali sets, and gourmet farm ingredients delivered straight to your doorstep.
            </p>
          </div>

          {/* Quick links related to the App's actual capabilities */}
          <div className="space-y-3" id="footer_features_section">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#FF6B35] font-bold">
              Culinary Discoveries
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-1.5 hover:text-[#8B1A1A] transition-colors cursor-pointer">
                <Compass className="w-4 h-4 text-[#8B1A1A]/70" />
                <span>3D Augmented Reality Food</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-[#8B1A1A] transition-colors cursor-pointer">
                <Coffee className="w-4 h-4 text-[#8B1A1A]/70" />
                <span>Mandi & Fresh Groceries</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-[#8B1A1A] transition-colors cursor-pointer">
                <MapPin className="w-4 h-4 text-[#8B1A1A]/70" />
                <span>Real-Time Rider GPS Tracking</span>
              </li>
            </ul>
          </div>

          {/* Trust and Values */}
          <div className="space-y-3" id="footer_trust_section">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#FF6B35] font-bold">
              Our Hospitality
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Every package is handled with hygienic safety measures. Get 5% loyalty cashback points with every bite. Standard regional delivery in Kathmandu, Lalitpur, Bhaktapur & Pokhara.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Safe Gastronomy</span>
            </div>
          </div>

          {/* Developer Dedication Section */}
          <div className="space-y-3 p-5 rounded-2xl bg-[#8B1A1A]/5 border border-[#8B1A1A]/10" id="footer_developer_section">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#8B1A1A] font-extrabold">
              Platform Engineering
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed font-sans">
              Designed as a high-fidelity Nepalese catering portal. Developed to support interactive menu animations and AI chatbot assistance.
            </p>
            <div className="pt-2 text-sm text-gray-800 font-semibold flex items-center gap-1.5">
              <span>Developed By:</span>
              <span className="text-[#8B1A1A] hover:underline cursor-pointer">Jenish Sapkota</span>
            </div>
          </div>

        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-[#8B1A1A]/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left" id="footer_copyright_section">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-xs text-gray-500 font-sans">
              &copy; {currentYear} FoodieNepal. All rights reserved. Registered culinary delivery networks.
            </p>
            {/* Standard/Satellite toggle button */}
            <button
              onClick={toggleMapView}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 text-[#8B1A1A] text-xs font-bold transition-all shadow-xxs cursor-pointer active:scale-95"
              title="Switch standard or satellite map base layers"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF6B35] animate-spin-slow" />
              <span>
                Map Mode: <span className="text-[#FF6B35] underline">{mapType === "satellite" ? "Satellite View" : "Standard View"}</span>
              </span>
            </button>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> &amp; Dedication for Foodies in Nepal &bull; <span className="font-semibold text-gray-700">Developed By Jenish Sapkota</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
