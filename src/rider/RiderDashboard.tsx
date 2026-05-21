import React, { useState, useEffect } from "react";
import { Bike, DollarSign, Navigation, ShieldCheck, MapPin, CheckCircle, RefreshCw, MessageSquare, Phone } from "lucide-react";
import { Order } from "../types";
import RiderMap from "../components/RiderMap";

export default function RiderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
  const [typedOtp, setTypedOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [walletTotal, setWalletTotal] = useState(480); // Accumulated commissions in Rupees

  // Fetch pending ready coordinates on intervals
  const fetchDeliveries = () => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        // Sync active claimed delivery if rider has one
        const claimed = data.find((o: Order) => o.riderName === "Niranjan" && o.status !== "delivered");
        if (claimed) {
          setActiveDelivery(claimed);
        } else {
          setActiveDelivery(null);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 5000);
    return () => clearInterval(interval);
  }, []);

  // Claim a delivery
  const handleClaim = async (orderId: string) => {
    try {
      const res = await fetch("/api/rider/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, riderName: "Niranjan", riderPhone: "+9779841804100" })
      });
      const data = await res.json();
      if (data.success) {
        fetchDeliveries();
        
        // Simulating immediate client status updates
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.setValueAtTime(650, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Progress transit state to show moving indicator
  const handleTransit = async (orderId: string) => {
    try {
      await fetch("/api/vendor/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "on_the_way" })
      });
      fetchDeliveries();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit delivery verify OTP
  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery) return;
    setOtpError("");

    try {
      const res = await fetch(`/api/orders/${activeDelivery.id}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: typedOtp })
      });
      const data = await res.json();
      if (data.success) {
        setActiveDelivery(null);
        setTypedOtp("");
        setWalletTotal((val) => val + activeDelivery.deliveryFee);
        fetchDeliveries();
        
        // Success noise
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.frequency.setValueAtTime(700, audioCtx.currentTime);
          osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.25);
        } catch (e) {}

      } else {
        setOtpError(data.error || "Incorrect Customer OTP. Code mismatch!");
      }
    } catch (err) {
      setOtpError("Verify failed");
    }
  };

  // Unassigned orders that are either "ready" or "preparing"
  const poolDeliveries = orders.filter((o) => !o.riderName && ["preparing", "ready"].includes(o.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-150 pb-5 mb-8">
        <div>
          <span className="text-[10px] bg-[#2D6A4F]/10 text-[#2D6A4F] font-black px-2.5 py-1 rounded-full uppercase">
            Rider Node: Active (Kathmandu Valley)
          </span>
          <h1 className="text-2xl font-black mt-1 text-gray-900 tracking-tight">RIDER PORTAL</h1>
        </div>

        {/* Balance summaries */}
        <div className="flex items-center gap-3 bg-white border border-gray-150 rounded-2xl p-3 shadow-xs mt-3 sm:mt-0">
          <div className="bg-[#2D6A4F]/10 p-2 rounded-xl text-[#2D6A4F]">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold leading-none">RIDER WALLET</p>
            <p className="text-sm font-black text-gray-800 mt-1">NPR Rs. {walletTotal}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT TWO-THIRDS: Active claimed delivery map OR job postings */}
        <div className="lg:col-span-2 space-y-6">
          {activeDelivery ? (
            <div className="space-y-6">
              <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-850 font-bold px-2 py-0.5 rounded border border-emerald-250">
                      Claimed Assignment
                    </span>
                    <h2 className="font-extrabold text-sm text-gray-900 mt-1">Diner ID: {activeDelivery.id}</h2>
                  </div>
                  <span className="font-black text-[#8B1A1A] text-sm">Delivery Fee: Rs. {activeDelivery.deliveryFee}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold">RESTAURANT KITCHEN</p>
                    <p className="font-extrabold text-[#8B1A1A] mt-0.5">{activeDelivery.restaurantName}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Basantapur Tole, Kathmandu</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold">CUSTOMER DROP LOCATION</p>
                    <p className="font-extrabold text-gray-800 mt-0.5">{activeDelivery.address}</p>
                    <p className="text-[11px] text-gray-500 mt-1 font-bold">Contact: +977 980 4400222</p>
                  </div>
                </div>

                {/* Tracking maps projection */}
                <RiderMap
                  riderLat={activeDelivery.riderLat || 27.6801}
                  riderLng={activeDelivery.riderLng || 85.3122}
                  restaurantLat={27.6801}
                  restaurantLng={85.3122}
                  restaurantName={activeDelivery.restaurantName}
                  customerAddress={activeDelivery.address}
                />

                {/* Active Milestones Controls for active claimed delivery */}
                <div className="pt-3 border-t border-gray-50 flex items-center gap-3">
                  {activeDelivery.status === "ready" && (
                    <button
                      onClick={() => handleTransit(activeDelivery.id)}
                      className="flex-1 py-3 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white font-bold rounded-xl text-xs transition-all text-center"
                    >
                      🏍️ Click to Start Transit on Ring Road
                    </button>
                  )}

                  {activeDelivery.status === "on_the_way" && (
                    <div className="flex-1 bg-yellow-50 border border-yellow-200 p-3.5 rounded-xl text-center">
                      <p className="text-xs text-yellow-800 font-bold">Rider is actively on-route to location...</p>
                      <p className="text-[11px] text-yellow-700 mt-1">Proceed to drop-off point, retrieve the 4-digit code from client, and submit on right panel.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-gray-400 tracking-wider uppercase mb-2">Available Delivery Jobs Feed (KTM/Lalitpur Region)</h2>
              
              {poolDeliveries.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <RefreshCw className="w-12 h-12 text-gray-300 mx-auto animate-spin-slow" />
                  <h3 className="font-bold text-gray-700 mt-3">No pending unassigned delivery packages</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Kitchen orders appear in real-time instantly as soon as diners submit checkouts!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {poolDeliveries.map((job) => (
                    <div key={job.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-[#8B1A1A]/15 text-[#8B1A1A] font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                            NPR Rs. {job.deliveryFee} fee
                          </span>
                          <span className="text-gray-400 font-bold uppercase">{job.status}</span>
                        </div>
                        
                        <p className="font-bold text-gray-900 text-sm">Pick: <strong className="text-[#8B1A1A]">{job.restaurantName}</strong></p>
                        <p className="text-gray-400 font-medium mt-0.5">Drop: <strong className="text-gray-700 font-medium">{job.address}</strong></p>
                      </div>

                      <button
                        onClick={() => handleClaim(job.id)}
                        className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1a3d2e] text-white font-bold rounded-lg whitespace-nowrap"
                      >
                        Claim order delivery (+Rs. {job.deliveryFee})
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: OTP validation panel or profile dashboard summaries */}
        <div className="space-y-6">
          {activeDelivery ? (
            <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
                <h3 className="font-extrabold text-gray-900 tracking-tight text-sm">Delivery Verification OTP</h3>
              </div>

              <p className="text-gray-500 font-medium leading-relaxed">
                As a standard security protocol to release local merchant revenues, you must input the 4-digit token generated on the user's tracking screen.
              </p>

              <form onSubmit={handleSubmitOtp} className="space-y-3 pt-2">
                <input
                  id="rider-otp-verify-field"
                  type="text"
                  maxLength={4}
                  value={typedOtp}
                  onChange={(e) => setTypedOtp(e.target.value)}
                  placeholder="Enter 4-Digit Customer OTP"
                  className="w-full bg-gray-50 border border-gray-150 px-3 py-3 rounded-xl text-center text-lg font-black tracking-widest text-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                />

                <button
                  type="submit"
                  disabled={!typedOtp || typedOtp.length < 4}
                  className="w-full py-3.5 bg-[#2D6A4F] hover:bg-[#1a3d2e] disabled:bg-gray-150 disabled:text-gray-400 text-white font-black rounded-xl transition-all"
                >
                  ✓ Complete & Close Delivery
                </button>
              </form>

              {otpError && <p className="text-[10px] text-rose-600 font-bold text-center">⚠️ {otpError}</p>}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#121620] to-[#1e2330] p-5 rounded-3xl text-white space-y-4">
              <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2.5">
                Rider Perks & Loyalty Points
              </h3>

              <div className="space-y-3.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Completed Rides:</span>
                  <span className="font-bold text-emerald-400">14 runs</span>
                </div>
                <div className="flex justify-between">
                  <span>Perfect 5-Star Rating:</span>
                  <span className="font-bold text-amber-400">92%</span>
                </div>
                <div className="flex justify-between">
                  <span>Today's Commissions:</span>
                  <span className="font-extrabold text-white">NPR 480</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
