import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, ShieldAlert, Phone, MessageSquare, CheckCircle2, CircleDot, AlertTriangle } from "lucide-react";
import RiderMap from "../components/RiderMap";
import { Order } from "../types";

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
  const [eta, setEta] = useState(25);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Poll server for active order status updates dynamically
  const [polledOrder, setPolledOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!order) return;
    setPolledOrder(order);

    const interval = setInterval(() => {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          const match = data.find((o: Order) => o.id === order.id);
          if (match) {
            setPolledOrder(match);
            // Dynamic ETA changes based on status
            if (match.status === "placed") setEta(30);
            else if (match.status === "confirmed") setEta(25);
            else if (match.status === "preparing") setEta(20);
            else if (match.status === "ready") setEta(15);
            else if (match.status === "on_the_way") setEta(8);
            else if (match.status === "delivered") setEta(0);
          }
        })
        .catch((err) => console.error(err));
    }, 4000);

    return () => clearInterval(interval);
  }, [order]);

  if (!polledOrder) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Clock className="w-12 h-12 text-[#FF6B35] animate-spin mx-auto mb-4" />
        <h3 className="font-extrabold text-sm">Synchronizing satellite GPS logs...</h3>
      </div>
    );
  }

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

  // Vertical timeline helpers
  const stages: { status: Order["status"]; label: string; desc: string }[] = [
    { status: "placed", label: "Diner Placed", desc: "Order details forwarded to the restaurant" },
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
          <div className="bg-[#FFF8F0] border border-[#FF6B35]/15 px-5 py-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#FF6B35] animate-pulse" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold leading-none">EXPECTED ARRIVAL TIME</p>
                <p className="font-extrabold text-lg text-[#8B1A1A] mt-1">
                  {polledOrder.status === "delivered" ? "Delivered Securely" : `${eta} Minutes`}
                </p>
              </div>
            </div>
            
            <span className="text-xs bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold px-3 py-1.5 rounded-xl border border-[#2D6A4F]/10">
              Rs. {polledOrder.total} COD
            </span>
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
              riderLat={polledOrder.riderLat || 27.6801}
              riderLng={polledOrder.riderLng || 85.3122}
              restaurantLat={27.6801} // rest_1 coordinates
              restaurantLng={85.3122}
              restaurantName={polledOrder.restaurantName}
              customerAddress={polledOrder.address}
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
    </div>
  );
}
