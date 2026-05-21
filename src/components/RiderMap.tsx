import { Bike, MapPin, Navigation, Compass, Shield } from "lucide-react";

interface RiderMapProps {
  riderLat: number;
  riderLng: number;
  restaurantLat: number;
  restaurantLng: number;
  restaurantName: string;
  customerAddress: string;
}

export default function RiderMap({
  riderLat,
  riderLng,
  restaurantLat,
  restaurantLng,
  restaurantName,
  customerAddress
}: RiderMapProps) {
  // Translate latitude/longitude coordinate scopes to Kathmandu visual SVG width (400x300)
  // Kathmandu latitude boundaries: 27.6750 (South Jhamsikhel) - 27.7250 (North Thamel)
  // Kathmandu longitude boundaries: 85.3000 (West) - 85.3500 (East Kamalpokhari/Baneshwor)

  const getSvgCoordinates = (lat: number, lng: number) => {
    const latMin = 27.6750;
    const latMax = 27.7250;
    const lngMin = 85.3000;
    const lngMax = 85.3500;

    const width = 450;
    const height = 300;

    // Linear mapping
    const x = ((lng - lngMin) / (lngMax - lngMin)) * width;
    // SVG y-axis is inverted
    const y = height - ((lat - latMin) / (latMax - latMin)) * height;

    return { x: Math.max(10, Math.min(x, width - 10)), y: Math.max(10, Math.min(y, height - 10)) };
  };

  const riderPos = getSvgCoordinates(riderLat, riderLng);
  const restPos = getSvgCoordinates(restaurantLat, restaurantLng);
  const customerPos = getSvgCoordinates(27.7042, 85.3072); // Basantapur spot standard coordinates

  return (
    <div className="bg-[#121620] p-4 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden text-white">
      {/* Absolute Header HUD Details */}
      <div className="absolute top-4 left-4 z-10 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-800 flex items-center gap-2">
        <Compass className="w-4 h-4 text-[#FF6B35] animate-spin-slow" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFF8F0]">
          KTM City Map (GPS Active)
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-[#2D6A4F]/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2D6A4F]/40 text-xs font-bold text-[#2D6A4F] flex items-center gap-1.5">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        <span>Rider On-Route</span>
      </div>

      {/* Main GPS SVG Interactive Map */}
      <div className="relative w-full aspect-[45/30] bg-[#1a1f2c] rounded-2xl border border-gray-800 mb-4 overflow-hidden">
        <svg viewBox="0 0 450 300" className="w-full h-full">
          {/* Grids and roads lines */}
          <line x1="100" y1="0" x2="100" y2="300" stroke="#ffedde" strokeOpacity="0.03" strokeWidth="1" />
          <line x1="200" y1="0" x2="200" y2="300" stroke="#ffedde" strokeOpacity="0.03" strokeWidth="1" />
          <line x1="300" y1="0" x2="300" y2="300" stroke="#ffedde" strokeOpacity="0.03" strokeWidth="1" />
          <line x1="0" y1="100" x2="450" y2="100" stroke="#ffedde" strokeOpacity="0.03" strokeWidth="1" />
          <line x1="0" y1="200" x2="450" y2="200" stroke="#ffedde" strokeOpacity="0.03" strokeWidth="1" />

          {/* Core Kathmandu Ring Roads Network Vector Roads */}
          <path d="M 50,20 L 220,50 L 380,80 L 420,220 L 320,280 L 120,250 Z" fill="none" stroke="#2a3245" strokeWidth="6" strokeLinecap="round" />
          <path d="M 50,20 L 220,50 L 380,80 L 420,220 L 320,280 L 120,250 Z" fill="none" stroke="#4a5a78" strokeWidth="1.5" strokeDasharray="3,3" />
          
          {/* Arterial Connecting roads */}
          <line x1="220" y1="50" x2="150" y2="160" stroke="#2a3245" strokeWidth="4" /> {/* Thamel down to basantapur */}
          <line x1="150" y1="160" x2="120" y2="250" stroke="#2a3245" strokeWidth="4" /> {/* Basantapur down to Jhamsikhel */}
          <line x1="380" y1="80" x2="150" y2="160" stroke="#2a3245" strokeWidth="4" /> {/* Kamalpokhari to basantapur */}

          {/* Dotted Delivery Route Path line */}
          <line
            x1={restPos.x}
            y1={restPos.y}
            x2={customerPos.x}
            y2={customerPos.y}
            stroke="#2D6A4F"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />
          <line
            x1={restPos.x}
            y1={restPos.y}
            x2={customerPos.x}
            y2={customerPos.y}
            stroke="#FF6B35"
            strokeWidth="2"
            strokeDasharray="4,4"
            className="animate-pulse"
          />

          {/* Kathmandu Historic Landmarks Markers */}
          {/* Basantapur Landmark */}
          <g transform={`translate(${customerPos.x + 25}, ${customerPos.y - 10})`}>
            <text fill="#ffffff" stroke="#121620" strokeWidth="2.5" fontSize="8" fontWeight="bold" paintOrder="stroke" textAnchor="start">
              🕌 Basantapur Sq. (Home)
            </text>
          </g>

          {/* Thamel Label (North) */}
          <g transform="translate(220, 35)">
            <rect x="-35" y="-10" width="70" height="15" rx="4" fill="black" fillOpacity="0.4" />
            <text fill="#a8b2c6" fontSize="7" fontWeight="bold" textAnchor="middle" y="0">Amrit Marg, Thamel</text>
          </g>

          {/* Patan Label (South) */}
          <g transform="translate(120, 268)">
            <rect x="-30" y="-10" width="60" height="15" rx="4" fill="black" fillOpacity="0.4" />
            <text fill="#a8b2c6" fontSize="7" fontWeight="bold" textAnchor="middle" y="0">Jhamsikhel, Lalitpur</text>
          </g>

          {/* 1. RESTAURANT SPOT MARKER */}
          <circle cx={restPos.x} cy={restPos.y} r="14" fill="#FF6B35" fillOpacity="0.15" />
          <circle cx={restPos.x} cy={restPos.y} r="6" fill="#FF6B35" />
          <g transform={`translate(${restPos.x}, ${restPos.y - 12})`}>
            <text fill="#FF6B35" stroke="#121620" strokeWidth="2.5" fontSize="8" fontWeight="black" paintOrder="stroke" textAnchor="middle">
              🏪 {restaurantName}
            </text>
          </g>

          {/* 2. CUSTOMER PLACE MARKER */}
          <circle cx={customerPos.x} cy={customerPos.y} r="14" fill="#2D6A4F" fillOpacity="0.15" className="animate-pulse" />
          <circle cx={customerPos.x} cy={customerPos.y} r="6" fill="#2D6A4F" />

          {/* 3. ACTIVE RIDER BIKE VEHICLE */}
          <g transform={`translate(${riderPos.x}, ${riderPos.y})`}>
            {/* Pulsing indicator ring */}
            <circle cx="0" cy="0" r="12" fill="#2D6A4F" fillOpacity="0.25" className="animate-ping" />
            <rect x="-9" y="-9" width="18" height="18" rx="6" fill="#2D6A4F" stroke="#ffffff" strokeWidth="2" className="shadow-lg" />
          </g>
        </svg>

        {/* Legend overlays */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg border border-gray-800 text-[9px] flex items-center gap-1.5 font-semibold text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
          <span>Restaurant</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
          <span>Rider GPS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>User Spot</span>
        </div>
      </div>

      {/* GPS Text descriptions below panel */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-800 pt-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#FF6B35] animate-pulse" />
          <div>
            <p className="text-[10px] text-gray-500 font-bold leading-none">RIDER COORDINATES</p>
            <p className="font-mono text-white text-[11px] mt-0.5">{riderLat.toFixed(4)}°N, {riderLng.toFixed(4)}°E</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 px-3 py-1 rounded-xl">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-bold text-gray-300">OTP-Armed Dropoff</span>
        </div>
      </div>
    </div>
  );
}
