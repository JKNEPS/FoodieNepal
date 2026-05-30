import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, X, MessageSquare, AlertCircle, ShoppingCart, User, ExternalLink, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatbotProps {
  onAddToCartDirect: (itemName: string) => void;
  lastOrderId?: string;
  userLocation?: string;
}

export default function Chatbot({
  onAddToCartDirect,
  lastOrderId,
  userLocation
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init_1",
      sender: "bot",
      text: "Namaste! 🏔️ I am **FoodieNepal AI Custom Assistant** with real-time Google Maps grounding.\n\nI can recommend traditional dishes, detail ingredients (momo, samay baji), check your tracker status, find top yummy local dishes, or process complaints.\n\nType down what you feel like eating today!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const newUserMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          lat: 27.7042, // Basantapur coordinates
          lng: 85.3072
        })
      });
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: data.text || "Pardon, can you rephrase that for me?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingLinks: data.links || []
      };

      setMessages((prev) => [...prev, botMsg]);

      // Check if bot recommendation contains direct triggers for quick buy/add to cart helper
      if (userText.toLowerCase().includes("add") || userText.toLowerCase().includes("momo")) {
        // Can add momo automatically
      }

    } catch (err) {
      console.error("Failed to query chatbot api:", err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "bot",
        text: "I am having temporary trouble connecting to the Himalayan satellite server. However, our kitchen staff is at hand! Please try asking again in a few seconds.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (text: string) => {
    setInput(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating expand trigger circle */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#FF6B35] hover:bg-[#2D6A4F] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group border-2 border-white flex items-center gap-2 relative"
          id="btn-open-chatbot"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
          <span className="text-xs font-bold font-sans max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 ease-out whitespace-nowrap">
            Ask AI Food Expert
          </span>
          {/* Active notification ping green dot */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-semibold bg-[#2D6A4F] rounded-full ring-2 ring-white animate-bounce" />
        </button>
      )}

      {/* Expanded Chat Dialog Panel box */}
      {isOpen && (
        <div className="bg-white w-[350px] sm:w-[380px] h-[520px] rounded-3xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col justify-between anim-float">
          
          {/* Header custom title tags */}
          <div className="bg-gradient-to-r from-[#8B1A1A] to-[#FF6B35] p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="bg-white/10 p-2 rounded-xl border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-[#FFF8F0] leading-none text-sm flex items-center gap-1.5">
                  FoodieNepal AI Guru
                </h3>
                <span className="text-[9px] text-orange-200 mt-1 block">● Grounded in Real Google Maps data</span>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 bg-black/10 hover:bg-black/25 rounded-lg text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Core scroll chat items section */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end text-right" : "items-start text-left"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#FF6B35] text-white font-semibold rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none whitespace-pre-wrap"
                  }`}
                >
                  <p>{msg.text}</p>
                  
                  {/* Rendering Google Maps grounding citation chips inside Chat item */}
                  {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 text-[10px] text-gray-500 flex flex-col gap-1.5 text-left">
                      <span className="font-bold text-[#2D6A4F] flex items-center gap-1">🌐 Cited Location Links:</span>
                      {msg.groundingLinks.map((link) => (
                        <a
                          key={link.uri}
                          href={link.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline truncate flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span>{link.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                
                <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2.5 text-gray-400 text-xs px-2 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF6B35]" />
                <span>AI is searching Google Maps citations...</span>
              </div>
            )}
          </div>

          {/* Lower Quick Prompts Shortcuts selector */}
          <div className="p-2 border-t border-gray-100 flex gap-1.5 overflow-x-auto bg-white whitespace-nowrap scrollbar-hide">
            <button
              onClick={() => handleQuickPrompt("Recommend yummy popular spicy momo")}
              className="px-2.5 py-1 text-[10px] font-bold bg-[#FF6B35]/5 text-[#FF6B35] hover:bg-[#FF6B35]/15 border border-[#FF6B35]/20 rounded-lg transition-all"
            >
              🥟 Spicy MoMo Pick
            </button>
            <button
              onClick={() => handleQuickPrompt("What goes inside Newari Samay Baji?")}
              className="px-2.5 py-1 text-[10px] font-bold bg-[#2D6A4F]/5 text-[#2D6A4F] hover:bg-[#2D6A4F]/15 border border-[#2D6A4F]/20 rounded-lg transition-all"
            >
              🥩 Samay Baji Details
            </button>
            <button
              onClick={() => handleQuickPrompt("Where is my active placed order at?")}
              className="px-2.5 py-1 text-[10px] font-bold bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all"
            >
              🔍 Order Tracker
            </button>
          </div>

          {/* Form input messaging drawer */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input
              id="chatbot-msg-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask: 'show me Thakali sets' or 'refund'"
              className="flex-1 bg-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            />
            
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white rounded-xl transition-all shadow shadow-[#FF6B35]/15 disabled:opacity-40 disabled:hover:bg-[#FF6B35]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
