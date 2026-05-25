import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Bot, Mic, Camera, LayoutList, Navigation, 
  Layers, Fan, Zap, Sun, CloudRain, Snowflake, Rotate3d, 
  Compass, Eye, HeartHandshake, EyeOff, Radio, Dumbbell, 
  Award, RefreshCw, Smartphone, Play, Users, Landmark, 
  HelpCircle, CheckCircle, Flame, Battery, ShieldAlert, Cpu, Check, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MenuItem } from "../types";

interface CyberHubProps {
  onClose: () => void;
  onAddToCartDirect: (item: MenuItem, restId: string, restName: string) => void;
}

export default function CyberHub({ onClose, onAddToCartDirect }: CyberHubProps) {
  // 1. Core States & Custom Theme/Mood
  const [activeTab, setActiveTab] = useState<"ai" | "mood" | "ar" | "delivery" | "social">("ai");
  const [hudMood, setHudMood] = useState<"stressed" | "energetic" | "sleepy" | "romantic" | "gaming">("energetic");
  const [weatherTheme, setWeatherTheme] = useState<"rain" | "night" | "snow" | "traffic">("rain");
  
  // Custom theme colors for each mood
  const moodThemes = {
    stressed: { bg: "from-blue-950 via-slate-900 to-indigo-950", glow: "shadow-blue-500/20", border: "border-blue-500/30", accent: "text-blue-400", hex: "#3b82f6" },
    energetic: { bg: "from-rose-950 via-[#3a0a0a] to-[#250303]", glow: "shadow-rose-500/20", border: "border-rose-500/30", accent: "text-rose-400", hex: "#f43f5e" },
    sleepy: { bg: "from-purple-950 via-slate-900 to-[#120124]", glow: "shadow-purple-500/20", border: "border-purple-500/30", accent: "text-purple-400", hex: "#a855f7" },
    romantic: { bg: "from-pink-950 via-slate-900 to-red-950", glow: "shadow-pink-500/20", border: "border-pink-500/30", accent: "text-pink-400", hex: "#ec4899" },
    gaming: { bg: "from-emerald-950 via-slate-900 to-teal-950", glow: "shadow-emerald-500/20", border: "border-emerald-500/30", accent: "text-emerald-400", hex: "#10b981" }
  };

  const activeTheme = moodThemes[hudMood];

  // 2. AI Assistant state variables
  const [aiTypingText, setAiTypingText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [chatLog, setChatLog] = useState<{ sender: "user" | "jarvis"; text: string }[]>([
    { sender: "jarvis", text: "Namaste! Quantum Saffron Waitress online. Neural preference sensors suggest spicy local momos for your Monday energy levels. Tap speech synths to listen." }
  ]);
  const [detectedEmotion, setDetectedEmotion] = useState("Slightly exhausted - recommendation loaded");
  const [isChefGenerating, setIsChefGenerating] = useState(false);
  const [customChefInput, setCustomChefInput] = useState("Spicy Nepali-Korean fusion burger with yak cheese");
  const [generatedRecipe, setGeneratedRecipe] = useState<any | null>(null);

  // 3. Simulated Camera / AR Scanner States
  const [scanning, setScanning] = useState(false);
  const [scanItem, setScanItem] = useState("momo");
  const [rotateDeg, setRotateDeg] = useState(0);
  const [dishScale, setDishScale] = useState(1.5);
  const [nutritionReport, setNutritionReport] = useState<any | null>(null);
  const [arCalibrate, setArCalibrate] = useState(false);

  // 4. Autonomous logistics state variables
  const [droneAltitude, setDroneAltitude] = useState(48);
  const [droneBattery, setDroneBattery] = useState(94);
  const [twinKitchenTemp, setTwinKitchenTemp] = useState(210);
  const [cookingProgress, setCookingProgress] = useState(45);
  const [selectedFarmKey, setSelectedFarmKey] = useState("dhading");

  // 5. Gamification / Group Ordering
  const [wheelNames, setWheelNames] = useState("Ram, Shyam, Jenish, Preeti");
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [xpPoints, setXpPoints] = useState(1420);
  
  // Audio playback emulation (neon glow frequency visualizer)
  const [soundFrequency, setSoundFrequency] = useState<number[]>([12, 18, 40, 25, 60, 42, 10, 31, 55, 30, 20]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSoundFrequency(prev => prev.map(() => Math.floor(Math.random() * 80) + 10));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Sync kitchen stages automatically
  useEffect(() => {
    const stageTimer = setInterval(() => {
      setCookingProgress(p => (p >= 100 ? 5 : p + 5));
      setTwinKitchenTemp(prev => Math.floor(Math.random() * 10) + 205);
    }, 3000);
    return () => clearInterval(stageTimer);
  }, []);

  // Mock speech synthesis toggle
  const speakVoice = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setChatLog(prev => [...prev, { sender: "user", text: userText }]);
    setInputValue("");

    // Smart Concierge Simulation
    setTimeout(() => {
      let botResponse = "Simulating spatial intelligence analysis... I recommend locally-sourced spice varieties to boost endorphins.";
      const low = userText.toLowerCase();

      if (low.includes("momo") || low.includes("dumpling")) {
        botResponse = "Understood. Buff or Organic Veg steamed momo triggers are selected. Added with high-protein sesame tracking, estimated delivery 18 minutes by drone path J3.";
      } else if (low.includes("thakali") || low.includes("thali")) {
        botResponse = "Analyzing Thakali meal configurations. Dynamic database finds Dhading black lentil stew and Mustang buckwheat rotis will fulfill today's low fiber warnings.";
      } else if (low.includes("weather") || low.includes("rain")) {
        botResponse = "Chilly Kathmandu valley rain triggers active 15% discount for organic hot Thukpa soups nearby. Would you like me to reserve a smart lock space?";
      } else if (low.includes("calories") || low.includes("protein")) {
        botResponse = "Your Garmin smartwatch shows active recovery. Targeted metrics require 650 kcal with 35g protein. Steamed buff dumplings fit perfectly!";
      }

      setChatLog(prev => [...prev, { sender: "jarvis", text: botResponse }]);
      speakVoice(botResponse);
    }, 800);
  };

  // Jarvis Voice Ordering Simulation
  const toggleVoiceMode = () => {
    if (!voiceActive) {
      setVoiceActive(true);
      speakVoice("Listening, hajur. Ask for your favorite food or describe your gym routine.");
      setTimeout(() => {
        setChatLog(prev => [...prev, { sender: "user", text: "Order extra spicy buffalo momo from Momo House" }]);
        setTimeout(() => {
          const resText = "Voice decrypted. Initializing order for Steamed Buff MoMo from Momo House Jhamsikhel. Price: Rs.130. Drone flight validation succeeded. Say CONFIRM to dispatch.";
          setChatLog(prev => [...prev, { sender: "jarvis", text: resText }]);
          speakVoice(resText);
          setVoiceActive(false);
        }, 1200);
      }, 3000);
    } else {
      setVoiceActive(false);
    }
  };

  // Simulated AI Camera Smart Food Scanner
  const triggerScanFile = () => {
    setScanning(true);
    setNutritionReport(null);
    setTimeout(() => {
      setScanning(false);
      if (scanItem === "momo") {
        setNutritionReport({
          name: "Steamed Himalayan Buff Momo",
          calories: "380 kcal",
          protein: "24g",
          carbs: "42g",
          fat: "12g",
          warning: "Spicy Dip (Allergen: Sesame Seed seeds used)",
          gymMatch: "Perfect high-protein post-workout fuel! Boosts glycogen safely.",
          ethical: "Halal compliant & organically farmed in Dhading hills."
        });
      } else if (scanItem === "thakali") {
        setNutritionReport({
          name: "Mustang Thakali Organic Thali",
          calories: "620 kcal",
          protein: "18g",
          carbs: "88g",
          fat: "14g",
          warning: "None. Dairy trace detected if using Ghee.",
          gymMatch: "Excellent carbohydrate replenishment load for endurance days.",
          ethical: "Vegan substitute friendly. 100% locally farmed in Mustang district."
        });
      } else {
        setNutritionReport({
          name: "Organic Crispy Sel Roti Combo",
          calories: "290 kcal",
          protein: "4g",
          carbs: "50g",
          fat: "8g",
          warning: "High glycemic indices",
          gymMatch: "Quick pre-run energy spikes. Limit if cutting fat.",
          ethical: "100% gluten-free home-milled rice flour."
        });
      }
    }, 2000);
  };

  // Simulated AI Chef fusion creator
  const triggerChefCreator = () => {
    setIsChefGenerating(true);
    setGeneratedRecipe(null);
    setTimeout(() => {
      setIsChefGenerating(false);
      setGeneratedRecipe({
        title: "Spicy Himalayan-Seoul Fusion Royal Burger",
        prepTime: "22 mins",
        calories: "520 kcal",
        protein: "32g",
        ingredients: [
          "Minced local yak flank steak patties",
          "Fermented Nepalese-style dry mustard leaf (Gundruk-Kimchi hybrid)",
          "Artisanal yak cheese double-melted",
          "Spiced Himalayan Timur sesame oil drizzle",
          "Freshly baked buckwheat buns"
        ],
        steps: [
          "Sear the yak spice patties to 145°F on hot stone grill.",
          "Fold fermented warm kimchi-gundruk leaves on top.",
          "Melt the yak cheese using infrared culinary torch.",
          "Sandwich neatly with buckwheat buns brushed with timur berry fat."
        ],
        matchVendor: "Available nearby at 'Momo House Jhamsikhel' Custom Lab"
      });
    }, 2200);
  };

  // Group Spin Wheel Selector
  const spinGroupWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);
    let spinCount = 0;
    const items = wheelNames.split(",").map(t => t.trim()).filter(Boolean);
    if (items.length === 0) {
      setSpinResult("Nobody entered name");
      setIsSpinning(false);
      return;
    }

    const interval = setInterval(() => {
      spinCount += 1;
      const index = Math.floor(Math.random() * items.length);
      setSpinResult(items[index]);
      if (spinCount > 15) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 120);
  };

  const handleAddProjectedItem = () => {
    const projected: MenuItem = {
      id: "projected_101",
      name: "Smart Predicted Combo (Momo + Spicy Thakali Set)",
      price: 399,
      description: "AI calculated perfect optimal dinner combo based on your routine metrics.",
      category: "Momo",
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Spicy",
      isVeg: false,
      ingredients: []
    };
    onAddToCartDirect(projected, "rest_1", "Neural Saffron Concierge Recommended");
    alert("Quantum Saffron Combo placed inside your checkout cart!");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-5 text-gray-100 font-sans leading-relaxed">
      
      {/* Dynamic Rain Overlay or cyber particles depending on weather */}
      {weatherTheme === "rain" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute w-full h-full bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_40px] animate-pulse" />
        </div>
      )}

      {/* Main Holographic CRT Container */}
      <div className={`relative w-full max-w-5xl bg-gradient-to-b ${activeTheme.bg} border-2 ${activeTheme.border} rounded-3xl overflow-hidden shadow-2xl ${activeTheme.glow} min-h-[550px] flex flex-col md:flex-row transition-all duration-700`}>
        
        {/* Futuristic Laser grid background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        
        {/* Scan lines CRT effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04))] bg-[size:100%_4px,6px_100%] pointer-events-none" />

        {/* 1. Left Side Navigation HUD Info Panel + Avatar */}
        <div className="w-full md:w-80 bg-black/50 border-b md:border-b-0 md:border-r border-white/10 p-5 flex flex-col justify-between relative z-10">
          
          <div>
            {/* Holographic Header Title */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`p-2 bg-[${activeTheme.hex}]/10 ${activeTheme.accent} rounded-xl border border-white/10`}>
                <Cpu className="w-5 h-5 animate-spin-slow" />
              </span>
              <div>
                <h1 className="text-sm font-black tracking-widest text-white uppercase font-mono flex items-center gap-1.5">
                  Neural quantum hud <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-sans uppercase animate-pulse">active</span>
                </h1>
                <p className="text-[10px] text-gray-400 font-mono">Himalayan Cyber Core v2.26</p>
              </div>
            </div>

            {/* Saffron, the AI Hologram Waitress Avatar */}
            <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 mb-5 relative overflow-hidden group">
              <div className="absolute top-1 right-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[8px] font-mono pr-1 text-emerald-400">ONLINE</span>
              </div>

              {/* Glowing pulsing hollow rings */}
              <div className="relative w-20 h-20 mx-auto mb-3">
                <div className={`absolute inset-0 rounded-full border-2 border-dashed ${activeTheme.accent} animate-spin-slow opacity-60`} />
                <div className={`absolute inset-2 rounded-full border border-double ${activeTheme.accent} animate-pulse`} />
                
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                  alt="Saffron AI Assistant Waitress Avatar"
                  className="w-16 h-16 rounded-full object-cover absolute top-2 left-2 border-2 border-orange-500 relative z-10 grayscale group-hover:grayscale-0 transition-all duration-500 scale-98"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h2 className="text-xs font-black tracking-wide text-white uppercase font-mono">Saffron Avatar Console</h2>
              <p className="text-[9px] text-gray-400 font-mono mt-1 leading-relaxed">
                "Sparks from Himalayas. I remember your low protein indicators, fast-tracking your food challenges."
              </p>

              {/* Sound visualizer under Saffron's avatar */}
              <div className="flex items-end justify-center gap-0.5 h-6 mt-3 px-2">
                {soundFrequency.map((val, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-[#FF6B35] rounded-t-sm transition-all duration-150"
                    style={{ height: `${val / 3.5}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Interactive Module Categories Navigator */}
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveTab("ai")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                  activeTab === "ai"
                    ? `bg-white/10 ${activeTheme.accent} border-white/20 shadow-sm`
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>1. Saffron AI Waitress</span>
              </button>

              <button
                onClick={() => setActiveTab("mood")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                  activeTab === "mood"
                    ? `bg-white/10 ${activeTheme.accent} border-white/20 shadow-sm`
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>2. Moods & Weather Themes</span>
              </button>

              <button
                onClick={() => setActiveTab("ar")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                  activeTab === "ar"
                    ? `bg-white/10 ${activeTheme.accent} border-white/20 shadow-sm`
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <Rotate3d className="w-4 h-4" />
                <span>3. Holograms & AR Scanner</span>
              </button>

              <button
                onClick={() => setActiveTab("delivery")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                  activeTab === "delivery"
                    ? `bg-white/10 ${activeTheme.accent} border-white/20 shadow-sm`
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>4. Drone Tracking & twin Kitchen</span>
              </button>

              <button
                onClick={() => setActiveTab("social")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                  activeTab === "social"
                    ? `bg-white/10 ${activeTheme.accent} border-white/20 shadow-sm`
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>5. Splitting Wheel & XP Ranks</span>
              </button>
            </div>

          </div>

          {/* Quick HUD Close Trigger */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-4">
            <div className="text-[9px] text-gray-500 font-mono">
              SECURE SYNC: SSL 256
            </div>
            
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close HUD</span>
            </button>
          </div>

        </div>

        {/* 2. Right Side Main Dynamic Controller Screen viewport */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[650px] relative z-10 bg-black/30 font-sans">
          
          <AnimatePresence mode="wait">
            {/* TAB 1: Saffron AI Waitress & Custom Fusion Creator */}
            {activeTab === "ai" && (
              <motion.div
                key="ai-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Visualizer header metrics */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-serif italic font-extrabold text-[#FFF8F0] flex items-center gap-2">
                      Saffron Concierge Assistant <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                    </h2>
                    <p className="text-xs text-gray-400">Unified dialogue engine integrating wearable metrics & user behavior</p>
                  </div>
                  
                  {/* Biomarkers info capsule */}
                  <div className="bg-[#FFF8F0]/5 border border-white/10 p-2 rounded-xl text-[10px] font-mono space-y-0.5">
                    <p className="text-orange-400 font-bold">● BIO-DETECTION SYNCED</p>
                    <p className="text-gray-400">Heart rate: 74 bpm • Cal Recovery: low</p>
                  </div>
                </div>

                {/* Grid controls */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Dialogue simulation console */}
                  <div className="bg-black/40 border border-white/10 p-4 rounded-2xl flex flex-col justify-between h-[280px]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Holographic Live Output</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto pr-1 text-xs">
                      {chatLog.map((log, i) => (
                        <div key={i} className={`flex ${log.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                            log.sender === "user" 
                              ? "bg-rose-600 text-white rounded-tr-none text-right font-semibold"
                              : "bg-[#FFF8F0]/10 border border-white/5 text-gray-200 rounded-tl-none text-left"
                          }`}>
                            <p>{log.text}</p>
                            {log.sender === "jarvis" && (
                              <button 
                                onClick={() => speakVoice(log.text)} 
                                className="text-[9px] text-[#FF6B35] font-bold block mt-1 hover:underline cursor-pointer"
                              >
                                🔊 Voice Speak Out
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Text / Voice form */}
                    <form onSubmit={handleSendMessage} className="flex gap-1.5 mt-3 pt-3 border-t border-white/10">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type (e.g. momo, low protein diet alerts)..."
                        className="flex-1 bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-xl text-white focus:outline-none focus:border-orange-500"
                      />
                      
                      {/* Interactive simulated voice recorder */}
                      <button
                        type="button"
                        onClick={toggleVoiceMode}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                          voiceActive 
                            ? "bg-red-500 text-white border-red-400 animate-pulse" 
                            : "bg-[#FFF8F0]/5 border-white/10 text-orange-400 hover:bg-white/10"
                        }`}
                        title="Simulate Jarvis Voice-Ordering Mode"
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <button
                        type="submit"
                        className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Ask
                      </button>
                    </form>
                  </div>

                  {/* Right Half: AI Chef Fusion Creator */}
                  <div className="bg-black/40 border border-white/10 p-4 rounded-2xl flex flex-col justify-between h-[280px] overflow-y-auto">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">23. AI Chef Creator Laboratory</span>
                        <span className="text-[9px] text-[#FF6B35] font-mono">Quantum Recipe Synthesis</span>
                      </div>
                      
                      <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
                        Input custom recipe ideas and watch Saffron synthesize culinary steps, nutritional indicators, and locate cook-ready local vendors.
                      </p>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={customChefInput}
                          onChange={(e) => setCustomChefInput(e.target.value)}
                          placeholder="e.g. Spicy Nepali-Korean fusion burger..."
                          className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-xl text-white focus:outline-none focus:border-emerald-500 placeholder-gray-500"
                        />
                        <button
                          onClick={triggerChefCreator}
                          disabled={isChefGenerating}
                          className="w-full py-2 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-98"
                        >
                          {isChefGenerating ? "Synthesizing Molecular Compounds..." : "🔬 Synthesize Fusion Recipe"}
                        </button>
                      </div>
                    </div>

                    {isChefGenerating && (
                      <div className="p-4 text-center text-xs space-y-2">
                        <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400 font-mono text-[10px]">Assembling spices & mapping local grocery farms...</p>
                      </div>
                    )}

                    {!isChefGenerating && generatedRecipe && (
                      <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-[11px] space-y-2 mt-3 text-left">
                        <div className="flex items-center justify-between text-[#FF6B35] font-extrabold font-serif italic text-xs">
                          <span>{generatedRecipe.title}</span>
                          <span className="font-mono text-[10px] text-gray-400 pr-1">{generatedRecipe.prepTime}</span>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 font-bold block text-[10px] font-mono">MOLECULAR STAGES:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-gray-300 text-[10px]">
                            {generatedRecipe.ingredients.slice(0, 3).map((ing: string, idx: number) => (
                              <li key={idx} className="truncate">{ing}</li>
                            ))}
                            <li className="text-gray-500 italic pr-1">and 2 other hybrid spices...</li>
                          </ul>
                        </div>

                        <div className="pt-1.5 border-t border-white/5 text-[9px] text-[#2D6A4F] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{generatedRecipe.matchVendor}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tab Bottom Metrics Row (3. Smart Predictive Ordering) */}
                <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest block font-mono">3. Smart Predictive Ordering Active</span>
                    <h4 className="text-xs font-bold text-white">Friday 7:00 PM Pizza & Momo Special Combo Prediction Detected</h4>
                    <p className="text-[10px] text-gray-400">Based on past dining triggers recorded under profile ID</p>
                  </div>

                  <button
                    onClick={handleAddProjectedItem}
                    className="px-4 py-2 bg-[#FF6B35] hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shrink-0 shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 animate-bounce" />
                    <span>Instant Projected order (Rs. 399)</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: Mood Swapper & Dynamic Weather Control */}
            {activeTab === "mood" && (
              <motion.div
                key="mood-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xl font-serif italic font-extrabold text-[#FFF8F0]">
                    2 & 9. Ambient Synaptic Environment Controllers
                  </h2>
                  <p className="text-xs text-gray-400">Modulate application color overlays, neon glows, lighting metrics & smart sound frequencies</p>
                </div>

                {/* Mood Select Section */}
                <div className="space-y-3 bg-black/40 border border-white/10 p-5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Choose Neural Mood State</span>
                    <span className={`text-xs font-mono font-black ${activeTheme.accent} uppercase`}>Current: {hudMood}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-2">
                    {[
                      { key: "stressed", label: "Stressed 😣", query: "Comfort blue foods recommended, soothing wave audio synced", color: "hover:border-blue-500/50" },
                      { key: "energetic", label: "Energetic ⚡", query: "Saffron double spices active, heavy beat rhythm visuals loaded", color: "hover:border-rose-500/50" },
                      { key: "sleepy", label: "Sleepy 😴", query: "Caffeine boosters suggested, night mode theme triggered", color: "hover:border-purple-500/50" },
                      { key: "romantic", label: "Romantic 💖", query: "Candlelight ambience simulated, deluxe Newari dinners loaded", color: "hover:border-pink-500/50" },
                      { key: "gaming", label: "Gaming Night 🎮", query: "Instant snack box popups triggered, bright cyberpunk theme", color: "hover:border-emerald-500/50" }
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          setHudMood(m.key as any);
                          speakVoice(`Applying ${m.key} background preset. ${m.query}`);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 ${
                          hudMood === m.key
                            ? "bg-white/10 border-white text-white shadow-xl"
                            : `bg-white/5 border-white/10 text-gray-400 ${m.color}`
                        }`}
                      >
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-gray-400 italic font-mono pt-1 text-center">
                    *Changing state alters recommended items in food screens, lighting tempos, and Saffron Waitress voice pitch.*
                  </p>
                </div>

                {/* Weather controller emulator */}
                <div className="space-y-3 bg-black/40 border border-white/10 p-5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">9. Weather theme simulation</span>
                    <span className="text-[9px] bg-orange-600/20 text-orange-400 font-mono px-2 py-0.5 rounded border border-orange-500/30">Auto Location Sync</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                    {[
                      { key: "rain", label: "Rainy Kathmandu 🌧️", dText: "Cool misty rain, organic ramen and Thukpa soups are 15% off today." },
                      { key: "night", label: "Everest Midnight 🌌", dText: "Midnight cravings mode on. Hot bakeries, tea, and warm sel-roti tracking." },
                      { key: "snow", label: "Snowy Himalayas ❄️", dText: "Spicy momo combos recommended to restore optimal body thermal stats." },
                      { key: "traffic", label: "Traffic Rush-Hour 🚦", dText: "Traffic jam detected on Ring Road. Optimizing drone flight channels." }
                    ].map((w) => (
                      <button
                        key={w.key}
                        type="button"
                        onClick={() => {
                          setWeatherTheme(w.key as any);
                          setChatLog(prev => [...prev, { sender: "jarvis", text: `Weather update: ${w.label} triggered. ${w.dText}` }]);
                          speakVoice(`Weather update: ${w.label}`);
                        }}
                        className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-left space-y-1 cursor-pointer ${
                          weatherTheme === w.key
                            ? "bg-[#FF6B35]/20 border-orange-500/80 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {w.key === "rain" && <CloudRain className="w-4 h-4 text-sky-400" />}
                          {w.key === "night" && <Snowflake className="w-4 h-4 text-purple-400" />}
                          {w.key === "snow" && <Snowflake className="w-4 h-4 text-white" />}
                          {w.key === "traffic" && <Zap className="w-4 h-4 text-amber-400" />}
                          <span className="font-extrabold text-xs">{w.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: Holographic Project Preview & AR AI Scanner */}
            {activeTab === "ar" && (
              <motion.div
                key="ar-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xl font-serif italic font-extrabold text-[#FFF8F0]">
                    4, 11 & 13. Digital Holographic Menu Projection & AR Scanner
                  </h2>
                  <p className="text-xs text-gray-400">Scan dishes with simulated cameras to display real calorie/fat densities and rotate real-size 3D wireframes</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Box: 3D Holographic Model Rotator */}
                  <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-[360px] relative overflow-hidden text-center">
                    <div className="absolute top-2 left-2 text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black">
                      11. Hologram Space Calibration
                    </div>
                    
                    <div className="absolute top-2 right-2 flex items-center gap-1.1 bg--500/15 text-[#FF6B35] px-2 py-0.5 rounded font-mono text-[9px]">
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span>3D HUD PROJECTOR</span>
                    </div>

                    {/* Interactive wireframe grid item */}
                    <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
                      {/* Floating holographic rings */}
                      <div className="absolute w-44 h-44 rounded-full border border-dashed border-cyan-500/20 animate-spin-slow pointer-events-none" />
                      <div className="absolute w-36 h-36 rounded-full border border-[#FF6B35]/20 animate-pulse pointer-events-none" />
                      
                      <motion.div 
                        animate={{ rotateY: rotateDeg }} 
                        style={{ perspective: 300 }}
                        className="relative z-10 select-none cursor-grab"
                      >
                        {scanItem === "momo" ? (
                          <div className="relative p-4 rounded-full bg-cyan-500/10 border-2 border-cyan-500/40 shadow-2xl">
                            <span className="text-5xl block animate-bounce" style={{ transform: `scale(${dishScale})` }}>🥟</span>
                            <div className="absolute -inset-1 rounded-full border-2 border-dashed border-cyan-400/30 animate-pulse" />
                          </div>
                        ) : scanItem === "thakali" ? (
                          <div className="relative p-6 rounded-full bg-orange-500/10 border-2 border-orange-500/40 shadow-2xl">
                            <span className="text-5xl block animate-bounce" style={{ transform: `scale(${dishScale})` }}>🥣</span>
                            <div className="absolute -inset-1 rounded-full border-2 border-dashed border-orange-400/30 animate-pulse" />
                          </div>
                        ) : (
                          <div className="relative p-5 rounded-full bg-pink-500/10 border-2 border-pink-500/40 shadow-2xl">
                            <span className="text-5xl block animate-bounce" style={{ transform: `scale(${dishScale})` }}>🫓</span>
                            <div className="absolute -inset-1 rounded-full border-2 border-dashed border-pink-400/30 animate-pulse" />
                          </div>
                        )}
                      </motion.div>

                      {/* Rotating multi axis coordinate tag */}
                      <div className="mt-4 font-mono text-[9px] text-[#FF6B35] tracking-widest uppercase">
                        COORDINATES: X:{(rotateDeg * 1.5).toFixed(0)} Y:32 Z:{(15 * dishScale).toFixed(0)} • ALT LOCK
                      </div>
                    </div>

                    {/* Interactive Sliders */}
                    <div className="space-y-2 mt-2 pt-2 border-t border-white/5 text-left">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-400 block">Rotate Y-Axis ({rotateDeg}°)</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={rotateDeg}
                            onChange={(e) => setRotateDeg(parseInt(e.target.value))}
                            className="w-full accent-orange-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-400 block">AR Portion-Size ({dishScale.toFixed(1)}x)</label>
                          <input 
                            type="range" 
                            min="0.8" 
                            max="2.5" 
                            step="0.1"
                            value={dishScale}
                            onChange={(e) => setDishScale(parseFloat(e.target.value))}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-gray-400">
                        <span>SELECT AR SUBJECT:</span>
                        <select 
                          value={scanItem} 
                          onChange={(e) => setScanItem(e.target.value)}
                          className="bg-white/10 text-white rounded border border-white/20 px-2 py-0.5 focus:outline-none"
                        >
                          <option value="momo" className="bg-slate-900 text-white">Traditional Momo 🥟</option>
                          <option value="thakali" className="bg-slate-900 text-white">Thakali Thali Set 🥣</option>
                          <option value="selroti" className="bg-slate-900 text-white">Crispy Sel Roti Combo 🫓</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Box: Live AI Nutrition Scanner Emulator */}
                  <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-[360px] overflow-y-auto relative">
                    <div className="absolute top-2 left-2 text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black">
                      4 & 20. AI Nutrition & Substance Analyzer
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                        <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono">Live Camera Feed Scanner</h4>
                          <p className="text-[10px] text-gray-400">Flick a picture to run cryptographic bio-molecule audit</p>
                        </div>
                      </div>

                      <button
                        onClick={triggerScanFile}
                        disabled={scanning}
                        className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-mono uppercase text-xs font-black rounded-xl transition-all shadow-md active:scale-98"
                      >
                        {scanning ? "🚀 ANALYZING MOLECULAR SIGNATURES..." : "📷 INITIATE IMAGE SCAn SCANNER"}
                      </button>

                      {scanning && (
                        <div className="relative h-20 bg-[#FFF8F0]/5 rounded-xl border border-dashed border-cyan-500/30 overflow-hidden flex items-center justify-center">
                          {/* Moving futuristic laser line scan */}
                          <div className="absolute inset-x-0 h-0.5 bg-cyan-400 shadow-lg shadow-cyan-400 top-0 animate-bounce" />
                          <span className="text-xs font-mono text-cyan-400 pr-1 animate-pulse">Running Gundruk & MSG inspection...</span>
                        </div>
                      )}

                      {!scanning && nutritionReport && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-[11px] space-y-2 text-left animate-fadeIn font-mono">
                          <div className="flex items-center justify-between text-[#FF6B35] font-black border-b border-white/10 pb-1.5">
                            <span className="uppercase text-xs">{nutritionReport.name}</span>
                            <span className="text-[10px] text-emerald-400 uppercase">PASS LOG</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-center">
                            <div className="bg-white/5 p-1 rounded">
                              <p className="text-gray-400">Calories</p>
                              <p className="text-white font-bold">{nutritionReport.calories}</p>
                            </div>
                            <div className="bg-white/5 p-1 rounded">
                              <p className="text-gray-400">Protein</p>
                              <p className="text-emerald-400 font-bold">{nutritionReport.protein}</p>
                            </div>
                            <div className="bg-white/5 p-1 rounded">
                              <p className="text-gray-400">Carbs</p>
                              <p className="text-white font-bold">{nutritionReport.carbs}</p>
                            </div>
                            <div className="bg-white/5 p-1 rounded">
                              <p className="text-gray-400">Fat</p>
                              <p className="text-white font-bold">{nutritionReport.fat}</p>
                            </div>
                          </div>

                          <div className="space-y-1 pt-1">
                            <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>WARNINGS: {nutritionReport.warning}</span>
                            </p>
                            <p className="text-[10px] text-emerald-400 font-semibold leading-relaxed">
                              💪 GYM TRAINER: {nutritionReport.gymMatch}
                            </p>
                            <p className="text-[10px] text-gray-300">
                              🌱 ETHICAL STATUS: {nutritionReport.ethical}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: Drone Delivery tracking, twin kitchen logs */}
            {activeTab === "delivery" && (
              <motion.div
                key="delivery-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xl font-serif italic font-extrabold text-[#FFF8F0]">
                    5, 10 & 14. Intelligent Autonomous Logistics & Smart Twin Kitchens
                  </h2>
                  <p className="text-xs text-gray-400">Monitor live drone flight altitudes, smart lock storage temps, and view inside the restaurant's live digital kitchen</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Drone Delivery & Autonomy Simulator */}
                  <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-[360px] relative">
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black absolute top-2 left-2">
                      10 & 14. Cinematic Drone Delivery telemetry
                    </span>

                    <div className="absolute top-2 right-2 flex items-center gap-1.5 font-mono text-[9px] bg-sky-500/10 text-sky-400 px-2.2 py-0.5 rounded border border-sky-500/20">
                      <Battery className="w-3.5 h-3.5 animate-pulse text-sky-400" />
                      <span>{droneBattery}% CAPACITY</span>
                    </div>

                    <div className="mt-4 flex-1 flex flex-col justify-center relative bg-slate-950/60 rounded-xl border border-white/5 p-4 overflow-hidden">
                      {/* Grid Radar overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1)_0,transparent_75%)]" />
                      
                      {/* Interactive Drone animation icon */}
                      <div className="relative mx-auto text-center z-10 py-6">
                        <div className="relative w-16 h-16 mx-auto mb-2 text-sky-400">
                          <motion.div 
                            animate={{ rotate: 360 }} 
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute -inset-1 rounded-full border border-dashed border-sky-400/50"
                          />
                          <span className="text-4xl block animate-bounce">🛸</span>
                        </div>
                        
                        <p className="text-xs font-black font-mono text-white">DRONE CARRIER-A2</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">Route: Lalitpur Node • ETA: 7 mins</p>
                      </div>

                      {/* Flight specs */}
                      <div className="grid grid-cols-2 gap-4 font-mono text-[10px] border-t border-white/5 pt-3">
                        <div>
                          <p className="text-gray-400">ALTITUDE SCALE</p>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-black text-xs">{droneAltitude}m</span>
                            <span className="text-gray-500">(Safe clearance)</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-400">WIND RISK SPEED</p>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">12 km/h</span>
                            <span className="text-emerald-500">(LOW RISK)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Smart Lock Container Controls */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black font-mono text-white uppercase tracking-wide leading-none">16. Tempered Smart Lock Cabinet</h4>
                          <span className="text-[9px] text-orange-400 block mt-0.5">Heat-preserved at 55°C</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          speakVoice("Facial recognition pickup confirmed. Smart lock vault released. Enjoy hot momo!");
                          alert("Facial recognition validated successfully! Vault lock unlocked.");
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-mono text-[9px] font-black rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        🔒 FACE ID UNLOCK
                      </button>
                    </div>
                  </div>

                  {/* DIGITAL TWIN KITCHEN RADAR */}
                  <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-[360px] overflow-y-auto relative">
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black absolute top-2 left-2">
                      5 & 22. Digital Twin Kitchen Blueprint & Transparency
                    </span>

                    <div className="absolute top-2 right-2 text-[9px] text-[#2D6A4F] font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-black">
                      Live Video Stream
                    </div>

                    <div className="mt-4 space-y-4">
                      {/* Live cook status screen */}
                      <div className="bg-slate-900 border border-white/10 rounded-xl p-4 relative overflow-hidden font-mono text-[10px]">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                          <span className="text-gray-400 font-bold">KITCHEN SENSOR LOGS</span>
                          <span className="text-xs text-orange-400 font-bold">{twinKitchenTemp}°C Oven Active</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-gray-300">
                            <span>Stage: Wrapping Spiced Filling</span>
                            <span className="text-orange-400 text-[9px] font-bold">ACTIVE COOK</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${cookingProgress}%` }} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[9.5px] mt-2 pt-2 border-t border-white/5 text-gray-400">
                            <div>Chef name: Kaji Gurung</div>
                            <div>Oven exhaust: 98.4%</div>
                          </div>
                        </div>
                      </div>

                      {/* 22. Real time ingredient blockchain transparency */}
                      <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-left text-[11px] font-mono">
                        <span className="text-[9px] text-gray-400 font-black block tracking-widest uppercase">
                          22. Supply Chain Blockchain Transparency
                        </span>

                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between text-xs font-serif italic text-[#FFF8F0]">
                            <span>Dalle Chilli & Cabbage Farm Trace</span>
                            <span className="font-mono text-[9px] text-[#2D6A4F] font-bold">100% SECURE</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedFarmKey("dhading");
                                speakVoice("Farms based in Dhading hills, high nitrogen soils, harvested twenty six hours ago.");
                              }}
                              className={`flex-1 p-2 rounded-lg border text-left cursor-pointer transition-all ${
                                selectedFarmKey === "dhading"
                                  ? "bg-[#2D6A4F]/20 border-emerald-500/80 text-white"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                              }`}
                            >
                              <p className="font-bold text-[10px] leading-none">Dhading Fields</p>
                              <span className="text-[8px] text-gray-400 mt-0.5 block">Freshness: 98% • Carbon: -2%</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedFarmKey("mustang");
                                speakVoice("Mustang district local high-altitude wheat fields, pesticide-free secure tracking.");
                              }}
                              className={`flex-1 p-2 rounded-lg border text-left cursor-pointer transition-all ${
                                selectedFarmKey === "mustang"
                                  ? "bg-[#2D6A4F]/20 border-emerald-500/80 text-white"
                                  : "bg-white/5 border-white/15 text-gray-400 hover:bg-white/10"
                              }`}
                            >
                              <p className="font-bold text-[10px] leading-none">Mustang Valley</p>
                              <span className="text-[8px] text-gray-400 mt-0.5 block">Gluten status: Low glycemic</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 5: Splitting billing spin wheel, XP system, multi lobbies */}
            {activeTab === "social" && (
              <motion.div
                key="social-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xl font-serif italic font-extrabold text-[#FFF8F0]">
                    17 & 18. Gamification & Multiplayer Split-Billing Lobbies
                  </h2>
                  <p className="text-xs text-gray-400">Spin the high-fidelity holographic wheel to decide who settles the bill, and view daily food challenges</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Spend Split multiplayer spinning wheel */}
                  <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-[360px] relative">
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black absolute top-2 left-2">
                      18. Multiplayer Group Bill Spinner
                    </span>

                    <div className="mt-4 flex-1 flex flex-col items-center justify-center relative">
                      <div className="relative w-32 h-32 rounded-full border-4 border-dashed border-[#FF6B35]/40 flex items-center justify-center overflow-hidden bg-slate-950/20">
                        {/* Interactive Rotating wheel dial representation */}
                        <motion.div 
                          animate={isSpinning ? { rotate: 1080 } : { rotate: 0 }}
                          transition={{ duration: 2.2, ease: "easeOut" }}
                          className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#8B1A1A,#FF6B35,#2D6A4F,#a855f7)] opacity-20 pointer-events-none"
                        />
                        
                        <div className="text-center z-10 font-mono">
                          <p className="text-[10px] text-gray-400">DECISION DIAL</p>
                          <p className="text-sm font-black text-white mt-1 uppercase max-w-[100px] truncate">
                            {spinResult || "Waiting..."}
                          </p>
                        </div>
                      </div>

                      {/* Names inputs */}
                      <div className="space-y-1.5 w-full mt-3 font-mono text-[10px] text-left">
                        <label className="text-gray-400 block font-bold uppercase pb-0.5">Group lobby members (separated by commas)</label>
                        <input
                          type="text"
                          value={wheelNames}
                          onChange={(e) => setWheelNames(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 text-xs px-3 py-1.5 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={spinGroupWheel}
                      disabled={isSpinning}
                      className="w-full py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#8B1A1A] hover:from-orange-600 hover:to-rose-600 text-white font-mono text-xs font-black uppercase rounded-xl transition-all shadow-md active:scale-98"
                    >
                      {isSpinning ? "💫 SPINNING WHEEL..." : "🎯 SPIN DECISION WHEEL"}
                    </button>
                  </div>

                  {/* XP Ranks & Spicy tolerance badge tracker */}
                  <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-[360px] overflow-y-auto">
                    <div>
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black border-b border-white/5 pb-1 block">
                        17 & 19. XP Rank System & Daily AI Challenges
                      </span>

                      {/* Rank Profile specs */}
                      <div className="flex items-center gap-3 mt-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="w-10 h-10 bg-[#FF6B35]/15 border border-[#FF6B35]/40 text-[#FF6B35] rounded-xl flex items-center justify-center font-mono font-black text-sm">
                          LVL 8
                        </div>

                        <div className="flex-1 text-left">
                          <h4 className="text-xs font-black font-mono text-white flex items-center gap-1.5">
                            Momo Monarch Explorer <Award className="w-3.5 h-3.5 text-amber-400" />
                          </h4>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-1 max-w-[200px]">
                            <div className="bg-[#FF6B35] h-full" style={{ width: "72%" }} />
                          </div>
                          <span className="text-[9px] text-gray-400 block mt-0.5 font-mono">{xpPoints} / 2000 XP to next tier</span>
                        </div>
                      </div>

                      {/* Badges checklist */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-mono text-left">
                        <div className="bg-[#8B1A1A]/10 border border-red-500/20 p-2 rounded flex items-center gap-1.5 text-rose-300">
                          <Flame className="w-3.5 h-3.5 shrink-0" />
                          <span>🌶️ SPICE INSANE TOLERANCE</span>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded flex items-center gap-1.5 text-emerald-300 animate-pulse">
                          <Award className="w-3.5 h-3.5 shrink-0" />
                          <span>🏆 MIDNIGHT SAMAY BAJI HERO</span>
                        </div>
                      </div>

                      {/* 19. Dynamic Food Challenge Cards */}
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <span className="text-[9px] text-[#FF6B35] font-mono uppercase font-black">Daily Chef Challenges</span>
                        
                        <div className="space-y-2 mt-2 font-mono text-[10px] text-left">
                          <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-white leading-none">Spicy Boss Challenge</p>
                              <span className="text-[8.5px] text-gray-400 block mt-0.5">Order 3 extra spice momos this week</span>
                            </div>
                            <span className="text-emerald-400 font-bold">+150 XP</span>
                          </div>

                          <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-white leading-none">Healthy Green Streak</p>
                              <span className="text-[8.5px] text-gray-400 block mt-0.5">Add 2 certified Mandi organic veggies</span>
                            </div>
                            <span className="text-emerald-400 font-bold">+250 XP</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setXpPoints(prev => prev + 100);
                        speakVoice("Claimed 100 daily XP. Profile ranking updated successfully.");
                        alert("Claimed 100 XP successfully! Your ranking stats refreshed.");
                      }}
                      className="mt-3 w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-mono text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      🎁 CLAIM MY DAILY CHALLENGE BONUS
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
