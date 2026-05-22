import { useState } from "react";
import { Bike, MapPin, Navigation, Compass, Shield, Map as MapIcon, Globe, Maximize2, Minimize2, X } from "lucide-react";

interface RiderMapProps {
  riderLat: number;
  riderLng: number;
  restaurantLat: number;
  restaurantLng: number;
  restaurantName: string;
  customerAddress: string;
  customerLat?: number;
  customerLng?: number;
}

export default function RiderMap({
  riderLat,
  riderLng,
  restaurantLat,
  restaurantLng,
  restaurantName,
  customerAddress,
  customerLat,
  customerLng
}: RiderMapProps) {
  const [mapMode, setMapMode] = useState<"google" | "vector">("google");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-detect Pokhara vs Kathmandu bounding coordinates for the vector layout grids
  const isPokhara = (customerAddress || "").toLowerCase().includes("pokhara") || restaurantLat > 28;

  // Kathmandu boundary defaults: lat 27.6750 to 27.7250, lng 85.3000 to 85.3500
  // Pokhara boundary defaults: lat 28.1800 to 28.2400, lng 83.9500 to 84.0200
  const latMin = isPokhara ? 28.1800 : 27.6750;
  const latMax = isPokhara ? 28.2400 : 27.7250;
  const lngMin = isPokhara ? 83.9500 : 85.3000;
  const lngMax = isPokhara ? 84.0200 : 85.3550;

  const getSvgCoordinates = (lat: number, lng: number) => {
    const width = 450;
    const height = 300;

    // Direct linear interpolation mapping inside our visual dimensions
    const x = ((lng - lngMin) / (lngMax - lngMin)) * width;
    const y = height - ((lat - latMin) / (latMax - latMin)) * height;

    return { 
      x: Math.max(15, Math.min(x, width - 15)), 
      y: Math.max(15, Math.min(y, height - 15)) 
    };
  };

  // Resolve Customer Destination coordinates
  const resolvedCustLat = customerLat || (isPokhara ? 28.2096 : 27.7042);
  const resolvedCustLng = customerLng || (isPokhara ? 83.9856 : 85.3072);

  const riderPos = getSvgCoordinates(riderLat, riderLng);
  const restPos = getSvgCoordinates(restaurantLat, restaurantLng);
  const customerPos = getSvgCoordinates(resolvedCustLat, resolvedCustLng);

  const mapContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Header HUD Details */}
      <div className="flex items-center justify-between pointer-events-auto mb-3 gap-2 flex-wrap">
        <div className="bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gray-800 flex items-center gap-2 shadow-xl">
          <Compass className="w-4 h-4 text-[#FF6B35] animate-spin-slow" />
          <span className="text-[10px] uppercase font-mono tracking-widest text-orange-400 font-extrabold">
            RADAR: {isPokhara ? "POKHARA GRID" : "KATHMANDU GRID"} (LIVE_GPS)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Map Mode Button */}
          <button
            onClick={() => setMapMode(mapMode === "google" ? "vector" : "google")}
            className="bg-[#FF6B35]/25 hover:bg-[#FF6B35]/45 cursor-pointer backdrop-blur-md px-3 py-2 rounded-xl border border-[#FF6B35]/40 text-[11px] font-extrabold text-[#FFF8F0] flex items-center gap-1.5 transition-all active:scale-95"
          >
            {mapMode === "google" ? <MapIcon className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
            <span>{mapMode === "google" ? "Grid Vector" : "Google Map"}</span>
          </button>

          {/* Fullscreen Expansion Triggers */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-black/90 hover:bg-gray-950 cursor-pointer backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-800 text-[11px] font-extrabold text-white flex items-center gap-1.5 transition-all active:scale-95"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>Fullscreen Map</span>
              </>
            )}
          </button>

          <div className="bg-[#2D6A4F]/30 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#2D6A4F]/40 text-[11px] font-extrabold text-emerald-400 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>ACTIVE STATUS</span>
          </div>
        </div>
      </div>

      {/* Embedded IFrame or Custom Dynamic Vector Grid Canvas */}
      <div className="relative flex-1 min-h-[300px] w-full bg-[#161a25] rounded-3xl border border-gray-800 overflow-hidden shadow-inner font-sans">
        {mapMode === "google" ? (
          <div className="absolute inset-0 w-full h-full">
            {/* Embedded maps routing showing the rider position live */}
            <iframe
              title="Rider Real-Time Google Maps Tracking"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${riderLat},${riderLng}&z=17&t=m&hl=en&output=embed`}
              allowFullScreen
              className="w-full h-full filter brightness-95 contrast-101"
              referrerPolicy="no-referrer"
            />
            {/* Overlaid Legend */}
            <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gray-800 text-[10px] space-y-1 font-bold text-gray-200 shadow-2xl text-left">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <span>Rider Moto: {riderLat.toFixed(4)}, {riderLng.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Dropoff: {customerAddress.split(",")[0]}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <svg viewBox="0 0 450 300" className="w-full h-full select-none" preserveAspectRatio="xMidYMid slice">
              {/* Grids background network */}
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Major arterial simulated pathways */}
              <path d="M 50,40 L 180,60 L 320,100 L 400,220 L 300,270 L 100,240 Z" fill="none" stroke="#1f2638" strokeWidth="8" strokeLinecap="round" />
              <path d="M 50,40 L 180,60 L 320,100 L 400,220 L 300,270 L 100,240 Z" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeDasharray="3,4" strokeOpacity="0.25" />

              <line x1="180" y1="60" x2="160" y2="150" stroke="#1f2638" strokeWidth="5" />
              <line x1="160" y1="150" x2="100" y2="240" stroke="#1f2638" strokeWidth="5" />
              <line x1="320" y1="100" x2="160" y2="150" stroke="#1f2638" strokeWidth="5" />

              {/* Real Dotted Route linking restaurant to custom delivery spot */}
              <line
                x1={restPos.x}
                y1={restPos.y}
                x2={customerPos.x}
                y2={customerPos.y}
                stroke="#2D6A4F"
                strokeWidth="4"
                strokeLinecap="round"
                strokeOpacity="0.35"
              />
              <line
                x1={restPos.x}
                y1={restPos.y}
                x2={customerPos.x}
                y2={customerPos.y}
                stroke="#FF6B35"
                strokeWidth="2"
                strokeDasharray="4,5"
                className="animate-pulse"
              />

              {/* 1. RESTAURANT SPOT PIN */}
              <circle cx={restPos.x} cy={restPos.y} r="16" fill="#FF6B35" fillOpacity="0.1" />
              <circle cx={restPos.x} cy={restPos.y} r="6" fill="#FF6B35" className="animate-pulse" />
              <g transform={`translate(${restPos.x}, ${restPos.y - 14})`}>
                <rect x="-40" y="-14" width="80" height="15" rx="4" fill="black" fillOpacity="0.8" />
                <text fill="#FF6B35" fontSize="7.5" fontWeight="bold" textAnchor="middle" y="-4">
                  🏪 {restaurantName}
                </text>
              </g>

              {/* 2. CUSTOMER GPS PIN */}
              <circle cx={customerPos.x} cy={customerPos.y} r="16" fill="#2D6A4F" fillOpacity="0.15" />
              <circle cx={customerPos.x} cy={customerPos.y} r="6" fill="#2D6A4F" />
              <g transform={`translate(${customerPos.x}, ${customerPos.y - 14})`}>
                <rect x="-35" y="-14" width="70" height="15" rx="4" fill="black" fillOpacity="0.8" />
                <text fill="#2D6A4F" fontSize="7.5" fontWeight="black" textAnchor="middle" y="-4">
                  📍 User (Home)
                </text>
              </g>

              {/* 3. MOVING RIDER TRUCKER */}
              <g transform={`translate(${riderPos.x}, ${riderPos.y})`}>
                <circle cx="0" cy="0" r="16" fill="#2D6A4F" fillOpacity="0.3" className="animate-ping" />
                <rect x="-9" y="-9" width="18" height="18" rx="5" fill="#2D6A4F" stroke="#ffffff" strokeWidth="2" className="shadow-2xl" />
                <foreignObject x="-6" y="-7" width="12" height="12">
                  <div className="text-[10px] text-white font-extrabold flex items-center justify-center">🏍️</div>
                </foreignObject>
              </g>
            </svg>

            {/* Vector Legend details overlay */}
            <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur px-3.5 py-2 rounded-2xl border border-gray-800 text-[10px] flex items-center gap-3.5 font-bold text-gray-300 shadow-2xl">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />
                <span>Kitchen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Rider Unit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" />
                <span>Destination GPS</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lower Coordinates and OTP Indicators */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 mt-4 pt-3 flex-wrap gap-2 text-left bg-black/10 px-0.5 rounded-b-3xl">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#FF6B35] animate-pulse" />
          <div>
            <p className="text-[9px] text-gray-500 font-extrabold leading-none uppercase tracking-wider">LIVE MOTO-COORDINATES</p>
            <p className="font-mono text-gray-300 text-[11px] mt-0.5 font-black">{riderLat.toFixed(5)}°N, {riderLng.toFixed(5)}°E</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 px-3.5 py-1.5 rounded-xl">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-extrabold text-gray-300 font-mono">OTP Verified Handover Armed</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Regular Inline Map Module */}
      <div className="bg-[#121620] p-4 sm:p-5 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden text-white flex flex-col h-full justify-between">
        {mapContent}
      </div>

      {/* FULL SCREEN VIEWPORT MODAL OVERLAY */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#121620]/95 backdrop-blur-md p-4 sm:p-6 md:p-8 flex flex-col justify-between text-white animate-fadeIn pointer-events-auto">
          {/* Upper Floating Close Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 sm:p-2.5 bg-[#FF6B35]/15 border border-[#FF6B35]/25 rounded-2xl">
                <Bike className="w-5 h-5 text-[#FF6B35] animate-bounce" />
              </span>
              <div className="text-left font-serif">
                <h3 className="text-lg font-serif italic font-bold tracking-tight text-white leading-tight">Expanded Satellite Dispatcher Control Center</h3>
                <p className="text-[10px] text-gray-400 font-sans tracking-wide">Tracking: {restaurantName} 🚀 {customerAddress}</p>
              </div>
            </div>

            <button
              onClick={() => setIsFullscreen(false)}
              className="p-3 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white rounded-2xl border border-red-500/10 cursor-pointer shadow-lg transition-all flex items-center gap-1.5 font-sans text-xs font-bold active:scale-95"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Fullscreen Map</span>
            </button>
          </div>

          {/* Full Height Map Body */}
          <div className="flex-1 flex flex-col">
            {mapContent}
          </div>
        </div>
      )}
    </>
  );
}
