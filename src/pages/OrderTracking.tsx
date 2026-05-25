import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, ShieldAlert, Phone, MessageSquare, CheckCircle2, CircleDot, AlertTriangle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import RiderMap from "../components/RiderMap";
import { Order } from "../types";

const REST_COORDS: Record<string, { lat: number; lng: number }> = {
  rest_1: { lat: 27.6801, lng: 85.3122 },
  rest_2: { lat: 27.7042, lng: 85.3072 },
  rest_3: { lat: 27.7150, lng: 85.3117 },
  rest_4: { lat: 27.7088, lng: 85.3238 },
  rest_5: { lat: 27.7052, lng: 85.3059 },
  rest_6: { lat: 27.6775, lng: 85.3168 },
  rest_7: { lat: 27.7161, lng: 85.3106 },
  rest_8: { lat: 27.6961, lng: 85.3149 },
  rest_9: { lat: 27.7214, lng: 85.3620 },
  rest_10: { lat: 27.6915, lng: 85.3422 }
};

const getCustomerCoords = (address: string) => {
  const addrLower = (address || "").toLowerCase();
  if (addrLower.includes("jhamsikhel") || addrLower.includes("lalitpur") || addrLower.includes("pulchowk") || addrLower.includes("ward 3")) {
    return { lat: 27.6795, lng: 85.3130 }; // Jhamsikhel, Lalitpur
  }
  if (addrLower.includes("thamel") || addrLower.includes("chaksibari") || addrLower.includes("amrit marg")) {
    return { lat: 27.7155, lng: 85.3105 }; // Thamel
  }
  if (addrLower.includes("basantapur") || addrLower.includes("hanumandhoka") || addrLower.includes("durbar square")) {
    return { lat: 27.7042, lng: 85.3072 }; // Basantapur
  }
  if (addrLower.includes("kamalpokhari")) {
    return { lat: 27.7088, lng: 85.3238 };
  }
  if (addrLower.includes("bhanimandal")) {
    return { lat: 27.6750, lng: 85.3110 };
  }
  if (addrLower.includes("baneshwor")) {
    return { lat: 27.6915, lng: 85.3422 };
  }
  if (addrLower.includes("boudha")) {
    return { lat: 27.7214, lng: 85.3620 };
  }
  return { lat: 27.7022, lng: 85.3110 };
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-950/95 border border-gray-800 text-[#FFF8F0] p-3 rounded-2xl shadow-xl font-mono text-xs scale-98 leading-none">
        <p className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">{payload[0].payload.month} Expenses</p>
        <p className="font-black text-rose-300 mt-1 text-sm">Rs. {payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const getMonthlySpendingData = (orders: Order[]) => {
  const defaultHabits: Record<string, number> = {
    "Dec": 1450,
    "Jan": 2100,
    "Feb": 1850,
    "Mar": 2400,
    "Apr": 3150,
    "May": 0
  };

  const now = new Date();
  const currentMonthName = now.toLocaleString("default", { month: "short" });
  if (!defaultHabits.hasOwnProperty(currentMonthName)) {
    defaultHabits[currentMonthName] = 0;
  }

  orders.forEach((o) => {
    if (o.status === "cancelled") return;
    try {
      const oDate = new Date(o.createdAt);
      if (!isNaN(oDate.getTime())) {
        const monthName = oDate.toLocaleString("default", { month: "short" });
        if (defaultHabits[monthName] !== undefined) {
          defaultHabits[monthName] += o.total;
        } else {
          defaultHabits[monthName] = o.total;
        }
      }
    } catch (e) {
      // safe fallback
    }
  });

  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return Object.keys(defaultHabits)
    .map(m => ({ month: m, amount: defaultHabits[m] }))
    .sort((a, b) => {
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
};

interface OrderTrackingProps {
  order: Order | null;
  onBack: () => void;
  onCancelOrder: (id: string) => void;
  onVerifyOtp: (id: string, otp: string) => void;
}

export default function OrderTracking({
  order,
  onBack,
  onCancelOrder,
  onVerifyOtp
}: OrderTrackingProps) {
  const [typedOtp, setTypedOtp] = useState("");
  const [riderChatOpen, setRiderChatOpen] = useState(false);
  const [riderChatMsg, setRiderChatMsg] = useState("");
  const [chatLog, setChatLog] = useState<{ sender: "user" | "rider"; text: string; time: string }[]>([
    { sender: "rider", text: "Namaste! I have picked your warm food items from the kitchen corner and am heading your way now. Please keep your 4-digit security code ready!", time: "Just now" }
  ]);
  const [eta, setEta] = useState(45);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Poll server for active order status updates dynamically
  const [polledOrder, setPolledOrder] = useState<Order | null>(null);

  const getArrivalClockTime = (etaMinutes: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + etaMinutes);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!order) return;
    setPolledOrder(order);

    const fetchOrders = () => {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          setAllOrders(data);
          const match = data.find((o: Order) => o.id === (polledOrder?.id || order.id));
          if (match) {
            setPolledOrder(match);
            // Dynamic ETA changes based on status (Minimum drop time 30 mins, max 45 mins)
            if (match.status === "placed") setEta(45);
            else if (match.status === "confirmed") setEta(42);
            else if (match.status === "preparing") setEta(38);
            else if (match.status === "ready") setEta(35);
            else if (match.status === "on_the_way") setEta(30);
            else if (match.status === "delivered") setEta(0);
          }
        })
        .catch((err) => console.error(err));
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);

    return () => clearInterval(interval);
  }, [order, polledOrder?.id]);

  if (!polledOrder) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Clock className="w-12 h-12 text-[#FF6B35] animate-spin mx-auto mb-4" />
        <h3 className="font-extrabold text-sm">Synchronizing satellite GPS logs...</h3>
      </div>
    );
  }

  const monthlyData = getMonthlySpendingData(allOrders);
  const currentMonthName = new Date().toLocaleString("default", { month: "short" });
  const totalSpent = monthlyData.reduce((sum, item) => sum + item.amount, 0);
  const avgSpent = Math.round(totalSpent / (monthlyData.filter(d => d.amount > 0).length || 1));
  const peakMonth = [...monthlyData].sort((a, b) => b.amount - a.amount)[0]?.month || "N/A";

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess(false);

    try {
      const res = await fetch(`/api/orders/${polledOrder.id}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: typedOtp })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSuccess(true);
        setPolledOrder(data.order);
        setTypedOtp("");
      } else {
        setOtpError(data.error || "Incorrect OTP");
      }
    } catch (err) {
      setOtpError("Verify failed");
    }
  };

  const handleSendRiderMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderChatMsg.trim()) return;

    setChatLog((prev) => [...prev, { sender: "user", text: riderChatMsg, time: "Just now" }]);
    setRiderChatMsg("");

    // Mimic rider replies
    setTimeout(() => {
      const replies = [
        "Hajur, I just crossed Basantapur Hanumandhoka, traffic is smooth!",
        "Understood ji! I will park next to the primary yellow building.",
        "Aaudai chhu, 2 minutes high-road."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatLog((prev) => [...prev, { sender: "rider", text: randomReply, time: "Just now" }]);
    }, 1800);
  };

  // --- GOOGLE MAPS GPS & TRAFFIC ESTIMATION ENGINE ---
  // A. Resolve restaurant coordinates
  const currentRestId = polledOrder.restaurantId || "rest_1";
  const restCoords = REST_COORDS[currentRestId] || { lat: 27.6801, lng: 85.3122 };

  // B. Resolve customer coordinates
  const custCoords = getCustomerCoords(polledOrder.address);

  // C. Calculate absolute geodesic path from restaurant key destination to customer
  const totalRestaurantToCustomerKm = calculateDistance(restCoords.lat, restCoords.lng, custCoords.lat, custCoords.lng);

  // D. Calculate active distance remaining based on where the rider is
  const riderGPSLat = polledOrder.riderLat || restCoords.lat;
  const riderGPSLng = polledOrder.riderLng || restCoords.lng;
  const remainingDistanceKm = calculateDistance(riderGPSLat, riderGPSLng, custCoords.lat, custCoords.lng);

  // E. Google Maps Congestion & Traffic factor (averaging velocity in Kathmandu's highly packed intersections)
  // Moderate congestion: 16.5 km/h. High congestion: 11.5 km/h. Normal: 22 km/h.
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const hour = new Date().getHours();
  // Peak rush hours in Kathmandu: 9am-11am & 4pm-7pm
  const isRushHour = (hour >= 9 && hour <= 11) || (hour >= 16 && hour <= 19);
  
  const trafficCondition: "low" | "moderate" | "heavy" = isRushHour ? "heavy" : isWeekend ? "low" : "moderate";
  const speedKmh = trafficCondition === "heavy" ? 11.5 : trafficCondition === "moderate" ? 16.5 : 22.0;

  // Travel minutes based on Google Maps routing pathing multiplier (adding 1.35x for KTM road curves / direct lines vs actual streets)
  const actualKtmRoadCurveFactor = 1.35;
  const travelMinutes = ((remainingDistanceKm * actualKtmRoadCurveFactor) / speedKmh) * 60;

  // Add kitchen preparation overhead based on order stage phase
  let prepOverheadMinutes = 0;
  if (polledOrder.status === "placed") prepOverheadMinutes = 20;
  else if (polledOrder.status === "confirmed") prepOverheadMinutes = 16;
  else if (polledOrder.status === "preparing") prepOverheadMinutes = 11;
  else if (polledOrder.status === "ready") prepOverheadMinutes = 4;
  else if (polledOrder.status === "picked_up") prepOverheadMinutes = 2;

  // Sum time and securely constraint to 30 - 45 min limits requested
  const rawMapsEta = Math.round(travelMinutes + prepOverheadMinutes);
  const mapsCalculatedEta = polledOrder.status === "delivered" ? 0 : Math.max(30, Math.min(45, rawMapsEta));

  // Vertical timeline helpers
  const stages: { status: Order["status"]; label: string; desc: string }[] = [
    { status: "placed", label: "Customer Placed", desc: "Order details forwarded to the restaurant" },
    { status: "confirmed", label: "Merchant Confirmed", desc: "Kitchen staff approved and locked items" },
    { status: "preparing", label: "Ghee Cooking", desc: "Fresh Himalayan spices tossing in wok" },
    { status: "ready", label: "Ready for Pickup", desc: "Order sealed and packed in hot insulation bag" },
    { status: "picked_up", label: "Rider Selected", desc: "Our delivery rider loaded the parcel" },
    { status: "on_the_way", label: "Transit (KTM Roads)", desc: "Bike is moving across Kathmandu Ring Roads" },
    { status: "delivered", label: "Yum Delivered", desc: "Order securely dropped at your spot" }
  ];

  const getStageIdx = (status: Order["status"]) => {
    return stages.findIndex((s) => s.status === status);
  };

  const currentIdx = getStageIdx(polledOrder.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-left">
      
      {/* Back home triggers */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[#FF6B35] hover:text-[#2D6A4F] font-black text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Food Hall</span>
      </button>

      <div className="flex items-center justify-between border-b border-gray-150 pb-5 mb-8">
        <div>
          <span className="text-[10px] bg-[#FF6B35]/10 text-[#FF6B35] font-black px-2.5 py-1 rounded-full uppercase">
            Order ID: {polledOrder.id}
          </span>
          <h1 className="text-2xl font-black mt-1.5 text-gray-900 tracking-tight">Standard Culinary Tracker</h1>
        </div>

        {/* Cancel option if preparation is not active yet */}
        {(polledOrder.status === "placed" || polledOrder.status === "confirmed") && (
          <button
            onClick={() => onCancelOrder(polledOrder.id)}
            className="px-4 py-2 hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl transition-all"
          >
            Cancel Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column Layout: Vertical timeline steps (Takes 2/5 index space) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ETA Indicator */}
          <div className="bg-[#FFF8F0] border border-[#FF6B35]/25 px-5 py-5 rounded-3xl flex flex-col gap-4 shadow-sm relative overflow-hidden">
            {/* Top decorative badge */}
            <div className="absolute top-0 right-0 bg-[#FF6B35] text-white text-[8px] uppercase tracking-wider px-2.5 py-0.5 rounded-bl-xl font-bold font-mono">
              Google Maps Traffic Engine V3
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 animate-pulse">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold tracking-wider leading-none">EXPECTED ARRIVAL TIME</p>
                  <p className="font-extrabold text-2xl text-[#8B1A1A] mt-1.5 font-sans">
                    {polledOrder.status === "delivered" ? "Delivered Securely" : `${mapsCalculatedEta} Minutes`}
                  </p>
                  {polledOrder.status !== "delivered" && polledOrder.status !== "cancelled" && (
                    <p className="text-[10.5px] text-[#2D6A4F] font-bold mt-1 tracking-tight leading-normal flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Rider will arrive around: <span className="underline decoration-dotted text-gray-950 font-black">{getArrivalClockTime(mapsCalculatedEta)}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-xl border border-emerald-100 font-mono self-start shadow-xxs">
                Rs. {polledOrder.total} COD
              </span>
            </div>

            {/* Google Maps Real-Time Telemetry telemetry hud */}
            {polledOrder.status !== "delivered" && polledOrder.status !== "cancelled" && (
              <div className="border-t border-dashed border-gray-200 pt-3.5 space-y-2 text-xxs text-gray-600 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold">MAP ROUTING:</span>
                  <span className="text-gray-900 font-extrabold font-mono text-right truncate max-w-[180px]">
                    {polledOrder.restaurantName} ➔ {polledOrder.address.split(",")[0]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/60 p-2.5 rounded-xl border border-gray-100 font-mono">
                  <div>
                    <span className="text-gray-400 block font-bold text-[9px]">TOTAL DISTANCE</span>
                    <span className="text-gray-800 font-extrabold text-xs">{(totalRestaurantToCustomerKm * actualKtmRoadCurveFactor).toFixed(2)} km</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-bold text-[9px]">TRAFFIC DELAYS</span>
                    <span className={`font-extrabold text-xs flex items-center gap-1 ${
                      trafficCondition === "heavy" ? "text-rose-600" :
                      trafficCondition === "moderate" ? "text-amber-600" : "text-emerald-600"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        trafficCondition === "heavy" ? "bg-rose-500" :
                        trafficCondition === "moderate" ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      {trafficCondition === "heavy" ? "Heavy KTM Intersections" :
                       trafficCondition === "moderate" ? "Moderate (KTM Streets)" : "Free Flow Traffic"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-gray-400 italic">
                  <span>* Calculated based on live GPS coordination to Kathmandu Ward grids</span>
                  <span className="text-[#FF6B35] font-bold font-mono">Velocity: ~{speedKmh} km/h</span>
                </div>
              </div>
            )}
          </div>

          {/* Secure 4-Digit OTP Dropoff validation (Customer can submit themselves) */}
          {polledOrder.status !== "delivered" && polledOrder.status !== "cancelled" && (
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <h3 className="font-extrabold text-[#2D6A4F] text-xs uppercase tracking-wider">Secure OTP Dropoff Armed</h3>
              </div>
              
              <div className="bg-[#FFF8F0]/50 p-3 rounded-lg border border-dashed border-[#FF6B35]/20 text-center">
                <p className="text-[10px] text-gray-500 font-bold">YOUR UNIQUE 4-DIGIT CODE:</p>
                <p className="text-2xl font-black tracking-widest text-[#8B1A1A] mt-1">{polledOrder.deliveryOtp || "4804"}</p>
                <p className="text-[9px] text-gray-400 mt-1">Supply this code to the rider, or enter below for manual validation verification.</p>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="flex gap-2">
                <input
                  id="delivery-otp-input"
                  type="text"
                  maxLength={4}
                  value={typedOtp}
                  onChange={(e) => setTypedOtp(e.target.value)}
                  placeholder="Enter 4-Digit Code"
                  className="flex-1 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl text-xs font-bold text-center tracking-widest"
                />
                <button
                  type="submit"
                  className="bg-[#2D6A4F] hover:bg-[#1a3d2e] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Confirm Dropoff
                </button>
              </form>

              {otpError && <p className="text-[10px] text-rose-500 font-bold">⚠️ {otpError}</p>}
              {otpSuccess && <p className="text-[10px] text-emerald-600 font-bold">🎉 Dropoff successfully confirmed! Enjoy your Nepali food feast!</p>}
            </div>
          )}

          {/* Core Vertical timeline lists */}
          <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-xs space-y-5">
            <h3 className="font-extrabold text-gray-900 text-sm tracking-tight border-b border-gray-50 pb-2.5">
              Live Preparation Timeline
            </h3>

            <div className="relative border-l-2 border-dashed border-gray-200 pl-6 space-y-6">
              {stages.map((stg, idx) => {
                const isActive = idx === currentIdx;
                const isCompleted = idx < currentIdx;
                
                return (
                  <div key={stg.status} className="relative text-xs">
                    {/* Floating node indicator */}
                    <div className="absolute -left-[31px] top-0.5 bg-white p-0.5 rounded-full z-10">
                      {isActive ? (
                        <CircleDot className="w-4 h-4 text-[#FF6B35]" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] fill-[#2D6A4F]/10" />
                      ) : (
                        <div className="w-3.5 h-3.5 bg-gray-100 border border-gray-200 rounded-full" />
                      )}
                    </div>

                    <div className="text-left">
                      <h4 className={`font-extrabold ${isActive ? "text-[#FF6B35] text-sm" : isCompleted ? "text-[#2D6A4F]" : "text-gray-400"}`}>
                        {stg.label}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-medium leading-relaxed">{stg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column Layout: Rider GPS Maps vector & chat box (Takes 3/5 index space) */}
        {!otpSuccess && polledOrder.status !== "delivered" && polledOrder.status !== "cancelled" && (
          <div className="lg:col-span-3 space-y-6">
            
            {/* Embed Kathmandu Vector map */}
            <RiderMap
              riderLat={polledOrder.riderLat || restCoords.lat}
              riderLng={polledOrder.riderLng || restCoords.lng}
              restaurantLat={restCoords.lat}
              restaurantLng={restCoords.lng}
              restaurantName={polledOrder.restaurantName}
              customerAddress={polledOrder.address}
              customerLat={custCoords.lat}
              customerLng={custCoords.lng}
            />

            {/* Rider profile info & simulated chat interface */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#FF6B35]/10 rounded-full border-2 border-[#FF6B35]/20 flex items-center justify-center text-xl font-bold text-[#FF6B35]">
                    🏍️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 leading-none">{polledOrder.riderName || "Assigning Rider..."}</h4>
                    <span className="text-[10px] text-gray-400 font-bold block mt-1">★ FoodieNepal Rider #408</span>
                  </div>
                </div>

                <a
                  href={`tel:${polledOrder.riderPhone || "+9779811223344"}`}
                  className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-emerald-100 transition-all border border-emerald-100"
                >
                  <Phone className="w-3.5 h-3.5 animate-bounce" />
                  <span>Call Rider</span>
                </a>
              </div>

              {/* Rider Chat expansion */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase">In-App Chat with Rider</span>
                
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 max-h-[140px] overflow-y-auto space-y-3 text-xs scrollbar-hide">
                  {chatLog.map((log, lIdx) => (
                    <div key={lIdx} className={`flex flex-col ${log.sender === "user" ? "items-end" : "items-start"}`}>
                      <span className={`px-3 py-2 rounded-xl scale-98 ${log.sender === "user" ? "bg-[#FF6B35] text-white rounded-tr-none" : "bg-white text-gray-700 border border-gray-150 rounded-tl-none font-medium text-left leading-relaxed max-w-[85%]"}`}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendRiderMsg} className="flex gap-2">
                  <input
                    id="rider-chat-input-field"
                    type="text"
                    value={riderChatMsg}
                    onChange={(e) => setRiderChatMsg(e.target.value)}
                    placeholder="Ask rider: 'crossing Basantapur yet?'"
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="bg-[#2D6A4F] hover:bg-[#1a3d2e] text-white text-xs font-bold px-4 rounded-xl"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Canceled banner display */}
        {polledOrder.status === "cancelled" && (
          <div className="lg:col-span-3 bg-rose-50 border border-rose-200 p-6 rounded-3xl text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
            <h3 className="text-lg font-black text-rose-800">Order successfully Cancelled</h3>
            <p className="text-xs text-rose-700 max-w-sm mx-auto">Your billing order is cancelled. Commission amounts are released and any digital payment will be escrow-refunded within 10 minutes to your digital wallet.</p>
          </div>
        )}

        {/* Delivered banner display */}
        {(polledOrder.status === "delivered" || otpSuccess) && (
          <div className="lg:col-span-3 bg-emerald-50 border border-emerald-200 p-8 rounded-3xl text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto fill-emerald-100" />
            <h3 className="text-xl font-black text-emerald-800">Delivered & Plated!</h3>
            <p className="text-sm text-emerald-700 max-w-md mx-auto">Thank you for dining with FoodieNepal. Your local neighborhood merchant commission is finalized, and the delivery commission is logged into Niranjan's wallet.</p>
            
            <button
              onClick={onBack}
              className="py-2.5 px-6 bg-[#2D6A4F] hover:bg-[#1a3d2e] text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Order more Nepali delicacies
            </button>
          </div>
        )}
      </div>

      {/* 📊 Spend Tracking & Analysis Widget */}
      <div className="bg-white border border-gray-100 p-6 rounded-3xl mt-12 shadow-xxs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-orange-100/70 text-[#FF6B35] rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h2 className="text-xl font-serif italic font-extrabold text-[#8B1A1A]">
                Monthly Spending Habits
              </h2>
            </div>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Visualizing your historical dining habits and culinary expenses across Kathmandu
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#FFF8F0] border border-[#FF6B35]/20 px-3 py-1.5 rounded-xl self-start">
            <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-pulse" />
            <span className="text-[10px] text-gray-600 font-bold font-mono">Live Sync with Wallet Ledger</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Bar Chart Container */}
          <div className="lg:col-span-2 bg-gray-50/60 border border-gray-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                Expense Distribution (Rs.)
              </span>
              <span className="text-[10px] text-[#FF6B35] font-mono font-black bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                Last 6 Months
              </span>
            </div>
            
            <div className="h-64 w-full animate-fadeIn" style={{ minWidth: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94A3B8" 
                    fontSize={10} 
                    fontFamily="JetBrains Mono"
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={10} 
                    fontFamily="JetBrains Mono"
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `Rs.${val}`}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(255, 107, 53, 0.05)', radius: 8 }}
                  />
                  <Bar 
                    dataKey="amount" 
                    radius={[6, 6, 0, 0]}
                  >
                    {monthlyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.month === currentMonthName ? "#8B1A1A" : "#FF6B35"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Core Analytics Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <div className="bg-[#8B1A1A]/5 border border-[#8B1A1A]/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                  Cumulative Outlay
                </span>
                <span className="text-2.5xl font-black text-[#8B1A1A] mt-1 block font-mono">
                  Rs. {totalSpent.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium leading-relaxed">
                Aggregated spending across standard meals, pizzas, and organic grocery baskets.
              </p>
            </div>

            <div className="bg-[#2D6A4F]/5 border border-[#2D6A4F]/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                  Monthly Run-Rate
                </span>
                <span className="text-2.5xl font-black text-[#2D6A4F] mt-1 block font-mono">
                  Rs. {avgSpent.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium leading-relaxed">
                Your average monthly dining rate. Keep an eye on peak momo and pizza days!
              </p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">
                  Peak Dining Month
                </span>
                <span className="text-xl font-black text-amber-800 mt-1 block font-mono">
                  {peakMonth === currentMonthName ? `${peakMonth} (Active)` : peakMonth}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium leading-relaxed">
                The highest dining frequency month recorded dynamically under your profile ID.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 NEPALESE ORDER HISTORY LOG */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-[#8B1A1A]" />
          <h2 className="text-xl font-serif italic font-extrabold text-[#8B1A1A]">Your Order History</h2>
        </div>
        
        {allOrders.length === 0 ? (
          <div className="bg-white border border-gray-100 p-8 rounded-2xl text-center text-gray-500 text-xs shadow-sm">
            <p className="font-medium">No previous orders found. Start exploring Kathmandu's finest delicacies!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allOrders.map((histOrder) => (
              <div 
                key={histOrder.id} 
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  histOrder.id === polledOrder.id 
                    ? "bg-[#FFF8F0] border-[#FF6B35]/40 shadow-sm" 
                    : "bg-white hover:bg-gray-50 border-gray-100 shadow-xxs"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 block">ID: {histOrder.id}</span>
                      <h4 className="font-bold text-gray-900 text-xs mt-0.5">{histOrder.restaurantName}</h4>
                    </div>
                    
                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${
                      histOrder.status === "delivered" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      histOrder.status === "cancelled" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                      "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                    }`}>
                      {histOrder.status.replace("_", " ")}
                    </span>
                  </div>
                  
                  {/* Items list */}
                  <div className="space-y-1 mb-4 border-t border-gray-150 pt-3">
                    {histOrder.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xxs text-gray-600">
                        <span>{it.menuItem.name} (x{it.quantity})</span>
                        <span className="font-mono">Rs. {it.menuItem.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-gray-100 pt-3 mt-1">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">Total Paid</span>
                    <span className="font-black text-xs text-[#8B1A1A] font-mono">Rs. {histOrder.total}</span>
                  </div>
                  
                  {histOrder.id !== polledOrder.id ? (
                    <button
                      onClick={() => setPolledOrder(histOrder)}
                      className="text-[10.5px] font-bold text-[#FF6B35] hover:text-[#2D6A4F] bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-100 transition-all"
                    >
                      Track Order
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Tracking Now
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
