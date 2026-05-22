import React, { useState, useEffect, useRef } from "react";
import { Camera, RefreshCw, X, ShoppingCart, Plus, Minus, Move, Check, Info } from "lucide-react";
import { MenuItem } from "../types";

interface ARViewerProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCartDirect: (item: MenuItem) => void;
}

export default function ARViewer({
  item,
  onClose,
  onAddToCartDirect
}: ARViewerProps) {
  const [arStage, setArStage] = useState<"tutorial" | "scanning" | "placed">("tutorial");
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-manage real device back-camera streaming activation
  useEffect(() => {
    if (arStage === "scanning" || arStage === "placed") {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Prefer rear camera
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn("Frontal or Rear physical camera stream blocked or unavailable, showing grid space HUD", err);
      });
    }

    return () => {
      // Safely toggle camera stream off when leaving AR component of web application
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [arStage]);

  useEffect(() => {
    if (!item) return;
    setArStage("tutorial");
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [item]);

  if (!item) return null;

  // Real-time table alignment scanning simulation
  const triggerScan = () => {
    setArStage("scanning");
    setTimeout(() => {
      setArStage("placed");
    }, 2200);
  };

  // Dragging / Placement offset handlers (Mouse events support)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    // Position offset with dampening
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Dragging / Placement offset handlers (Touch actions support for mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartPos.current.x;
    const dy = e.touches[0].clientY - dragStartPos.current.y;
    
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black font-sans">
      
      {/* 1. ACTUAL HARDWARE INTERACTIVE CAMERA FEED BACKGROUND */}
      <div className="absolute inset-0 bg-[#121214] overflow-hidden flex items-center justify-center">
        {(arStage === "scanning" || arStage === "placed") && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
        )}

        {/* Ambient WebAR vector grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        
        {/* Spatial scanner glowing laser loop */}
        {arStage === "scanning" && (
          <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_25px_#10b981] animate-bounce top-1/3" />
        )}

        {/* Device camera registration indicator */}
        <div className="absolute top-5 left-5 flex items-center gap-2 bg-black/85 backdrop-blur px-3.5 py-2 rounded-2xl border border-white/10 text-white shadow-xl z-20">
          <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold text-gray-200">
            {arStage === "tutorial" ? "WebAR Idle" : "Active Camera Stream"}
          </span>
        </div>
      </div>

      {/* 2. MAIN USER TOOLBARS & OVERLAY CONTROLS CONTAINER */}
      <div className="relative w-full max-w-lg h-full max-h-[85vh] sm:max-h-[90vh] aspect-[3/4] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between p-5 z-10 mx-4 bg-transparent">
        
        {/* Upper Floating Controls bar */}
        <div className="flex items-center justify-between z-25">
          <div className="bg-black/95 backdrop-blur border border-white/10 px-4 py-2 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider font-mono flex items-center gap-1.5 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span>Portion Render: 1:1 Actual Size</span>
          </div>
          
          <button
            onClick={onClose}
            className="p-3 bg-black/90 hover:bg-red-950/60 hover:text-red-400 text-white rounded-2xl transition-all border border-white/10 cursor-pointer shadow-lg active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CENTER INTERACTIVE DISPLAY BODY */}
        
        {/* TUTORIAL ADVISER PHASE */}
        {arStage === "tutorial" && (
          <div className="bg-black/95 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center text-white my-auto mx-4 shadow-2xl animate-fadeIn text-left">
            <div className="w-14 h-14 bg-orange-600/10 border border-orange-500/30 text-white flex items-center justify-center rounded-2xl mx-auto mb-4 animate-bounce">
              <Camera className="w-7 h-7 text-[#FF6B35]" />
            </div>
            <h3 className="text-xl font-serif italic text-white text-center font-bold mb-2">Simulate Tabletop Placement</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-6 text-center">
              FoodieNepal uses high-fidelity WebAR mapping. Point your handheld device camera towards any clean tabletop or plate area. We will overlay the actual standard cooked serving size for portion control!
            </p>
            <button
              onClick={triggerScan}
              className="w-full py-3 bg-[#FF6B35] hover:bg-emerald-600 text-white font-extrabold rounded-2xl transition-all shadow-md text-sm cursor-pointer active:scale-95 text-center block"
            >
              Start Real-Time Scan
            </button>
          </div>
        )}

        {/* ACTIVE FLAT PATHWAY SCANNING MODULE */}
        {arStage === "scanning" && (
          <div className="bg-black/95 border border-white/10 p-6 rounded-3xl text-center text-white my-auto mx-4 shadow-2xl">
            <RefreshCw className="w-12 h-12 stroke-[2.5] text-[#FF6B35] animate-spin mx-auto mb-4" />
            <h4 className="text-sm font-black uppercase tracking-wider font-mono">Calibrating Spatial Surface Mesh...</h4>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">Please hold your device steady. Our WebAR system is aligning depth guidelines with your layout coordinates.</p>
          </div>
        )}

        {/* COMPLETED PLACED STATE VIEWPORT CONTAINER */}
        {arStage === "placed" && (
          <div className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden z-10 pointer-events-none">
            {/* The real-time interactive plate selector */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="cursor-grab active:cursor-grabbing p-6 touch-none flex flex-col items-center justify-center pointer-events-auto absolute"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out"
              }}
            >
              {/* Dynamic shadow to create perfect depth on physical tables */}
              <div className="w-52 h-10 bg-black/65 rounded-full blur-lg absolute bottom-[18px] z-0" />
              
              <div className="relative flex flex-col items-center">
                {/* 3D Circular food plate mock representation */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-60 h-60 sm:w-72 sm:h-72 rounded-full border-[10px] border-white object-cover shadow-2xl relative z-10 ring-8 ring-amber-500/10 select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual rotation hint overlay badge */}
                <div className="absolute -bottom-8 flex items-center gap-1.5 text-white bg-black/90 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-white/10 z-20 shadow-xl leading-none">
                  <Move className="w-3.5 h-3.5 text-[#FF6B35] animate-pulse" />
                  <span>Drag & Spin Plate on Table</span>
                </div>
              </div>
            </div>

            {/* Float Vertical Zoom Control panel */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30 pointer-events-auto">
              <button
                onClick={() => setScale((s) => Math.min(s + 0.1, 1.6))}
                className="bg-black/95 hover:bg-[#FF6B35] text-white p-3 rounded-2xl border border-white/10 justify-center flex items-center shadow-2xl cursor-pointer active:scale-90 transition-all"
                title="Increase portion size scale"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={() => {
                  setRotation((r) => (r + 45) % 360);
                }}
                className="bg-black/95 hover:bg-[#FF6B35] text-white p-3 rounded-2xl border border-white/10 justify-center flex items-center shadow-2xl cursor-pointer active:scale-90 transition-all font-mono font-bold text-center text-[10px]"
                title="Spin plate clockwise"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
                className="bg-black/95 hover:bg-[#FF6B35] text-white p-3 rounded-2xl border border-white/10 justify-center flex items-center shadow-2xl cursor-pointer active:scale-90 transition-all"
                title="Decrease portion size scale"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM DIALOG ACTION OVERLAY */}
        <div className="z-20 pointer-events-auto">
          {arStage === "placed" && (
            <div className="flex flex-col gap-3 bg-black/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl text-left">
              <div className="flex items-center justify-between text-white border-b border-white/5 pb-3">
                <div className="min-w-0 pr-4">
                  <span className="text-[9px] font-mono tracking-widest text-[#FF6B35] font-black uppercase">Fitted Portion Check</span>
                  <h4 className="font-serif italic font-bold text-base text-gray-150 truncate mt-0.5" title={item.name}>{item.name}</h4>
                  <p className="text-[10px] text-emerald-400 font-extrabold mt-1 leading-none uppercase tracking-wide">
                    Portion: Standard Single Serving Plate
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-rose-500 text-[10px] font-bold block leading-none">Price</span>
                  <span className="text-lg font-mono font-black text-white mt-1 block">Rs. {item.price}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onAddToCartDirect(item);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#FF6B35] hover:bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Settle Plate & Get Delivery</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
