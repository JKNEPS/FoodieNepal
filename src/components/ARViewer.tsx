import React, { useState, useEffect, useRef } from "react";
import { Camera, RefreshCw, X, ShoppingCart, Plus, Minus, Move, Check } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!item) return;
    setArStage("tutorial");
  }, [item]);

  if (!item) return null;

  // Simulate mark-less table surface scanning
  const triggerScan = () => {
    setArStage("scanning");
    setTimeout(() => {
      setArStage("placed");
    }, 2500);
  };

  // Mouse drag handlers to control simulated 3D plate rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    setRotation((prev) => (prev + dx * 0.8) % 360);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      {/* Absolute Simulated Camera Feed with moving green grids */}
      <div className="absolute inset-0 bg-[#121214] overflow-hidden flex items-center justify-center">
        {/* Background grid representation */}
        <div className="absolute inset-0 bg-[radial-gradient(#18482f_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />
        
        {/* Green Laser scanning line in scanning screen */}
        {arStage === "scanning" && (
          <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-bounce top-1/4" />
        )}

        {/* Real camera watermark */}
        <div className="absolute top-5 left-5 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 text-white/80">
          <Camera className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Device Camera Active (WebAR)</span>
        </div>
      </div>

      {/* Main interface frame overlay */}
      <div className="relative w-full max-w-lg aspect-[3/4] rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between p-6 z-10">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between">
          <div className="bg-black/80 backdrop-blur px-3 py-1 bg-gradient-to-r from-[#FF6B35] to-[#2D6A4F] text-white rounded-full text-[10px] font-bold">
            Dish Scale: 1:1 Actual size
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/70 hover:bg-black text-white hover:scale-110 rounded-full transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STAGE 1: INSTRUCTION TUTORIALS */}
        {arStage === "tutorial" && (
          <div className="bg-black/85 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center text-white my-auto mx-4 shadow-xl">
            <div className="w-16 h-16 bg-[#2D6A4F]/20 border-2 border-[#2D6A4F] text-white flex items-center justify-center rounded-2xl mx-auto mb-4 animate-bounce">
              <Camera className="w-8 h-8 text-[#2D6A4F]" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-white mb-2">Simulate table placement</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Position your phone towards a flat surface or tabletop, keeping details illuminated. FoodieNepal renders the standard visual portion in exactly 1:1 physical real-world margins.
            </p>
            <button
              onClick={triggerScan}
              className="w-full py-3 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white font-bold rounded-xl transition-all shadow-md text-sm"
            >
              Scan Table
            </button>
          </div>
        )}

        {/* STAGE 2: LIVE SURFACE SCANNING GRID */}
        {arStage === "scanning" && (
          <div className="bg-black/90 p-5 rounded-2xl border border-white/10 text-center text-white my-auto mx-4">
            <RefreshCw className="w-10 h-10 stroke-2 text-[#FF6B35] animate-spin mx-auto mb-3" />
            <h4 className="text-sm font-bold tracking-wide">Detecting flat surfaces...</h4>
            <p className="text-[11px] text-gray-400 mt-1">Keep holding still while A-frame triggers spatial mesh mapping</p>
          </div>
        )}

        {/* STAGE 3: PLACED STATE WITH ROTATION / ZOOM ENGINE */}
        {arStage === "placed" && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {/* Interactive Object canvas rendering */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-grab active:cursor-grabbing p-4 touch-none flex flex-col items-center justify-center"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.15s ease-out"
              }}
            >
              {/* Table shadows */}
              <div className="w-40 h-8 bg-black/55 rounded-full blur-md absolute bottom-2" />
              
              <div className="relative flex flex-col items-center">
                {/* 3D simulated plate wrapper */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-8 border-white object-cover shadow-2xl relative z-10 ring-4 ring-orange-500/20"
                />
                
                {/* 3D direction indicator */}
                <div className="absolute -bottom-8 flex items-center gap-1.5 text-white bg-black/75 px-3 py-1 rounded-full text-[9px] font-semibold border border-white/10 z-20">
                  <Move className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>Drag left/right to rotate</span>
                </div>
              </div>
            </div>

            {/* Bottom Floating scale modifiers */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-20">
              <button
                onClick={() => setScale((s) => Math.min(s + 0.1, 1.5))}
                className="bg-black/85 hover:bg-black text-white p-2.5 rounded-xl border border-white/10 justify-center flex items-center"
                title="Zoom in"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale((s) => Math.max(s - 0.1, 0.6))}
                className="bg-black/85 hover:bg-black text-white p-2.5 rounded-xl border border-white/10 justify-center flex items-center"
                title="Zoom out"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Panel bar */}
        <div className="z-20">
          {arStage === "placed" && (
            <div className="flex flex-col gap-3 bg-black/85 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-white border-b border-white/5 pb-2.5">
                <div>
                  <h4 className="font-extrabold text-sm text-white truncate max-w-[200px]">{item.name}</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                    Portion: Standard Single Serving
                  </span>
                </div>
                <span className="text-lg font-black text-[#FF6B35]">Rs. {item.price}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onAddToCartDirect(item);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white font-bold rounded-xl text-xs transition-all shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add To Cart & Close</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
