import React, { useState, useEffect } from "react";
import { Shield, Sparkles, Lock, Mail, ArrowRight, CornerDownRight, CheckCircle2, User, KeyRound, Store, Bike, Eye, EyeOff } from "lucide-react";
import { UserRole } from "../types";

interface LoginPortalProps {
  onLoginSuccess: (role: UserRole) => void;
  onCancel: () => void;
  onGoogleSuccess?: (user: any) => void;
}

export default function LoginPortal({ onLoginSuccess, onCancel, onGoogleSuccess }: LoginPortalProps) {
  const [activeTab, setActiveTab] = useState<UserRole>("customer");
  const [successAnimRole, setSuccessAnimRole] = useState<UserRole | null>(null);
  
  // Customer Login & Registration States
  const [customerSubTab, setCustomerSubTab] = useState<"login" | "register">("login");
  const [dbUsername, setDbUsername] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regCheckingUsername, setRegCheckingUsername] = useState(false);
  const [regUsernameError, setRegUsernameError] = useState("");
  const [regUsernameSuccess, setRegUsernameSuccess] = useState(false);

  const checkRegUsername = async (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setRegUsernameError("");
      setRegUsernameSuccess(false);
      return;
    }
    setRegCheckingUsername(true);
    setRegUsernameError("");
    setRegUsernameSuccess(false);
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (!data.unique) {
            setRegUsernameError(`The username "${trimmed}" is already claimed! Please choose another unique handle.`);
            setRegUsernameSuccess(false);
          } else {
            setRegUsernameError("");
            setRegUsernameSuccess(true);
          }
        }
      }
    } catch (err) {
      console.warn("Server duplicate username check skipped", err);
    } finally {
      setRegCheckingUsername(false);
    }
  };

  const handleCustomDbLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUsername.trim() || !dbPassword) {
      setErrorMessage("Both Username and Password are required to log in.");
      return;
    }
    setUserLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/customer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: dbUsername.trim(), password: dbPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUserLoading(false);
        if (onGoogleSuccess) {
          onGoogleSuccess(data.user);
        }
        setSuccessAnimRole("customer");
        setTimeout(() => {
          onLoginSuccess("customer");
        }, 1800);
      } else {
        setErrorMessage(data.error || "Login Failed: Invalid Unique Username or Password.");
        setUserLoading(false);
      }
    } catch (err) {
      console.warn("Network login issue, applying local standard session fallback:", err);
      setErrorMessage("Connection issue with Nepal market database. Please try again.");
      setUserLoading(false);
    }
  };

  const handleCustomDbRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = regUsername.trim();
    if (!regFullName.trim() || !trimmedUsername || !regPassword || !regPhone.trim() || !regEmail.trim() || !regAddress.trim()) {
      setErrorMessage("All profile fields (Full Name, Username, Password, Phone Number, Gmail address, and Permanent Address) are strictly required.");
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail.endsWith("@gmail.com")) {
      setErrorMessage("Google Validation Failed: Gmail Address must end with @gmail.com");
      return;
    }

    if (regUsernameError) {
      setErrorMessage("Please solve username clash: specified handle is already claimed.");
      return;
    }

    setUserLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/customer-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regFullName.trim(),
          username: trimmedUsername,
          password: regPassword,
          phone: regPhone.trim(),
          email: cleanEmail,
          address: regAddress.trim()
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUserLoading(false);
        if (onGoogleSuccess) {
          onGoogleSuccess(data.user);
        }
        setSuccessAnimRole("customer");
        setTimeout(() => {
          onLoginSuccess("customer");
        }, 1800);
      } else {
        setErrorMessage(data.error || "Registration Rejected by database verification checks.");
        setUserLoading(false);
      }
    } catch (err) {
      setErrorMessage("Network issue submitting registration details. Please retry.");
      setUserLoading(false);
    }
  };

  // Admin Login States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Vendor/Kitchen Login States
  const [vendorCode, setVendorCode] = useState("");
  const [vendorPass, setVendorPass] = useState("");
  const [showVendorCode, setShowVendorCode] = useState(false);
  const [showVendorPass, setShowVendorPass] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<"admin" | "kitchen">("admin");

  // Rider Login States
  const [riderCode, setRiderCode] = useState("");
  const [riderPass, setRiderPass] = useState("");
  const [showRiderUsername, setShowRiderUsername] = useState(false);
  const [showRiderPassword, setShowRiderPassword] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password;

    if (!cleanUser || !cleanPass) {
      setErrorMessage("Username and password are required.");
      return;
    }

    setAdminLoading(true);
    setErrorMessage("");

    // Notify auth sentinel of admin authentication submission
    fetch("/api/auth/notify-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanUser,
        password: cleanPass,
        role: "admin",
        action: "login_attempt"
      })
    }).catch(err => console.error("Telemetry failed:", err));

    setTimeout(() => {
      setAdminLoading(false);
      // STRICT authorization rules requested under prompt instructions
      if (cleanUser === "Jenish_Obir_Bibash" && cleanPass === "Foodie*Nepal#Np") {
        setSuccessAnimRole("admin");
        setTimeout(() => {
          onLoginSuccess("admin");
        }, 1800);
      } else {
        setErrorMessage("Access Denied: Incorrect Admin Username or Security Password.");
      }
    }, 750);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = vendorCode.trim();
    const cleanPass = vendorPass;

    if (!cleanUser || !cleanPass) {
      setErrorMessage("Merchant code and password are required.");
      return;
    }

    setUserLoading(true);
    setErrorMessage("");

    // Notify auth sentinel of vendor authentication submission
    fetch("/api/auth/notify-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanUser,
        password: cleanPass,
        role: "vendor",
        action: "login_attempt"
      })
    }).catch(err => console.error("Telemetry failed:", err));

    setTimeout(() => {
      setUserLoading(false);
      if (cleanUser.toLowerCase() === "vendor" && cleanPass === "vendor") {
        setSuccessAnimRole("vendor");
        setTimeout(() => {
          onLoginSuccess("vendor");
        }, 1800);
      } else {
        setErrorMessage("Access Denied: Incorrect Merchant username or password. (Hint: use 'vendor' / 'vendor')");
      }
    }, 500);
  };

  const handleRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = riderCode.trim();
    const cleanPass = riderPass;

    if (!cleanUser || !cleanPass) {
      setErrorMessage("Rider GPS code and password are required.");
      return;
    }

    setUserLoading(true);
    setErrorMessage("");

    // Notify auth sentinel of rider authentication submission
    fetch("/api/auth/notify-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanUser,
        password: cleanPass,
        role: "rider",
        action: "login_attempt"
      })
    }).catch(err => console.error("Telemetry failed:", err));

    setTimeout(() => {
      setUserLoading(false);
      if (cleanUser === "Rider_Foodie_Nepal_Np" && cleanPass === "#Rider*Foodie_Nepal.Np") {
        setSuccessAnimRole("rider");
        setTimeout(() => {
          onLoginSuccess("rider");
        }, 1800);
      } else {
        setErrorMessage("Access Denied: Incorrect Rider ID code or security password entry.");
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#FFF8F0] text-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-[#8B1A1A]/10 grid md:grid-cols-12 min-h-[500px] max-h-[92vh] md:max-h-[640px] overflow-y-auto">
        {successAnimRole && (
          <div className="absolute inset-0 z-50 bg-[#8B1A1A] text-white flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <div className="relative mb-6">
              <div className="absolute inset-0 w-24 h-24 -m-4 bg-white/10 rounded-full animate-ping" />
              <div className="absolute inset-0 w-20 h-20 -m-2 bg-white/10 rounded-full animate-pulse" />
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-xl relative z-10 animate-bounce">
                <CheckCircle2 className="w-10 h-10 stroke-[3]" />
              </div>
            </div>
            
            <h3 className="text-3xl font-serif italic font-bold tracking-tight text-[#FFF8F0] mb-2 animate-pulse">
              Successfully Logged In!
            </h3>
            <p className="text-xs text-orange-200 uppercase font-mono tracking-widest font-black">
              {successAnimRole === "admin" ? "Enterprise Administrator Workspace" : 
               successAnimRole === "vendor" ? "Momo Kitchen Merchant Board" :
               successAnimRole === "rider" ? "Rider GPS Dispatch Board" :
               "Welcome to Customer Portal Hub"}
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs text-white/70 font-semibold bg-black/20 px-3.5 py-1.5 rounded-full border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
              <span>Hajur! Loading your custom dashboard...</span>
            </div>
          </div>
        )}
        
        {/* Left Side: App branding & Tab selection */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#8B1A1A] to-[#590C0C] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-black/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="p-1 px-1.5 bg-[#FF6B35] text-white text-[10px] font-mono rounded font-black">SECURE</span>
              <span className="text-white/70 text-xs tracking-widest uppercase font-mono">Gateway</span>
            </div>
            <h2 className="text-2xl font-serif italic text-[#FFF8F0] tracking-tight leading-snug">
              Foodie<span className="text-[#FF6B35] font-sans font-extrabold not-italic">Nepal!</span>
            </h2>
            <p className="text-xxs text-gray-300 font-mono tracking-wider uppercase mt-1">
              Multi-Route Identity Gate
            </p>
          </div>

          {/* Tab buttons */}
          <div className="relative z-10 grid grid-cols-1 gap-2.5 my-6 md:my-8 font-sans">
            <button
              onClick={() => {
                setActiveTab("customer");
                setErrorMessage("");
              }}
              className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-1.5 ${
                activeTab === "customer"
                  ? "bg-white/15 border-white/25 shadow-md text-[#FFF8F0]"
                  : "bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <div>
                <p className="text-[11px] md:text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" /> Customer
                </p>
                <p className="text-[9px] text-gray-300 hidden md:block">Customer instant check-in</p>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 hidden md:block transition-transform ${activeTab === "customer" ? "translate-x-1" : ""}`} />
            </button>

            <button
              onClick={() => {
                setActiveTab("rider");
                setErrorMessage("");
              }}
              className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-1.5 ${
                activeTab === "rider"
                  ? "bg-white/15 border-white/25 shadow-md text-[#FFF8F0]"
                  : "bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <div>
                <p className="text-[11px] md:text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-[#FF6B35]" /> Rider
                </p>
                <p className="text-[9px] text-gray-300 hidden md:block">Courier dispatch GPS</p>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 hidden md:block transition-transform ${activeTab === "rider" ? "translate-x-1" : ""}`} />
            </button>

            <button
              onClick={() => {
                setActiveTab("admin");
                setErrorMessage("");
              }}
              className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-1.5 ${
                activeTab === "admin"
                  ? "bg-white/15 border-white/25 shadow-md text-[#FFF8F0]"
                  : "bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <div>
                <p className="text-[11px] md:text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#FF6B35]" /> Admin Portal
                </p>
                <p className="text-[9px] text-gray-300 hidden md:block">Enterprise & Kitchen Desk</p>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 hidden md:block transition-transform ${activeTab === "admin" ? "translate-x-1" : ""}`} />
            </button>
          </div>

          <div className="relative z-10 text-[10px] text-white/50 font-mono tracking-wide leading-relaxed hidden sm:block">
            Authorized portal security. All sessions logged and secured via SSL signature standards.
          </div>
        </div>

        {/* Right Side: Specific Form rendering */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white relative">
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 font-mono">DUAL SHIELD ACTIVE</span>
            <button
              onClick={onCancel}
              className="text-xs font-bold text-[#8B1A1A] hover:text-[#FF6B35] transition-colors"
            >
              ✕ Exit Portal
            </button>
          </div>

          {/* Form dynamic box */}
          <div className="my-auto py-2">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3 mb-4 font-medium leading-relaxed">
                ⚠️ {errorMessage}
              </div>
            )}

            {activeTab === "customer" && (
              /* ==============================================
                 CUSTOMER PORTAL - DATABASE LOGIN & SIGNUP
                 ============================================== */
              <div className="animate-fadeIn space-y-4">
                <div className="flex bg-[#FFF8F0] p-1 rounded-2xl border border-[#8B1A1A]/10 w-full mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerSubTab("login");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all ${
                      customerSubTab === "login"
                        ? "bg-[#8B1A1A] text-[#FFF8F0] shadow-sm"
                        : "text-gray-500 hover:text-gray-900 bg-transparent"
                    }`}
                  >
                    🔐 Account Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerSubTab("register");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all ${
                      customerSubTab === "register"
                        ? "bg-[#8B1A1A] text-[#FFF8F0] shadow-sm"
                        : "text-gray-500 hover:text-gray-900 bg-transparent"
                    }`}
                  >
                    📝 New Registration
                  </button>
                </div>

                {customerSubTab === "login" ? (
                  <form onSubmit={handleCustomDbLogin} className="space-y-4">
                    <div className="flex items-center gap-1.5 text-[#FF6B35] font-black text-[9px] uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-full w-max">
                      <Sparkles className="w-3.5 h-3.5" />
                      Sign In to Account
                    </div>

                    <h3 className="text-xl font-serif italic text-[#8B1A1A] font-bold tracking-tight">
                      Welcome Back to FoodieNepal
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Enter your unique registered username and security password to access your foodie dashboard. Standard username for demo: <code className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xxs font-mono font-bold">jenish</code> with password <code className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xxs font-mono font-bold">password123</code>.
                    </p>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Unique Username or Gmail Address
                        </label>
                        <div className="relative flex items-center">
                          <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={dbUsername}
                            onChange={(e) => setDbUsername(e.target.value)}
                            placeholder="e.g. jenish"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-950 font-medium"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Password
                        </label>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type="password"
                            value={dbPassword}
                            onChange={(e) => setDbPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-950 font-mono"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={userLoading}
                      className="w-full py-3 bg-[#FF6B35] hover:bg-[#8B1A1A] text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#FF6B35]/20 flex items-center justify-center gap-2"
                    >
                      {userLoading ? "Verifying Credentials..." : "Access Account"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCustomDbRegister} className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[#2D6A4F] font-black text-[9px] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full w-max">
                      <Shield className="w-3.5 h-3.5" />
                      Database Customer Registration
                    </div>

                    <h3 className="text-xl font-serif italic text-[#2D6A4F] font-bold tracking-tight">
                      Create Your Foodie Account
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Complete your local profile details below. All fields are required by security policies to provide premium services across Nepal.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. Jenish Sapkota"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Unique Username *
                        </label>
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => {
                            setRegUsername(e.target.value);
                            checkRegUsername(e.target.value);
                          }}
                          placeholder="e.g. jenish272"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-mono"
                          required
                        />
                        {regCheckingUsername && (
                          <div className="text-[8px] text-[#2D6A4F] animate-pulse font-mono mt-0.5">
                            Verifying uniqueness...
                          </div>
                        )}
                        {regUsernameError && (
                          <div className="text-[8px] text-red-650 font-mono mt-0.5 leading-tight">
                            {regUsernameError}
                          </div>
                        )}
                        {regUsernameSuccess && regUsername && (
                          <div className="text-[8px] text-[#2D6A4F] font-bold mt-0.5 flex items-center gap-0.5">
                            ✓ Unique, safe handle!
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-mono"
                          required
                        />
                      </div>

                       <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="e.g. 98********"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-medium"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Gmail Address *
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="e.g. j******@gmail.com"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-mono"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Permanent Address *
                        </label>
                        <input
                          type="text"
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                          placeholder="e.g. Ward 4, Basantapur, Kathmandu, Nepal"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={userLoading || !!regUsernameError || regCheckingUsername}
                      className={`w-full py-2.5 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                        !!regUsernameError || regCheckingUsername
                          ? "bg-gray-300 shadow-none cursor-not-allowed text-gray-500"
                          : "bg-[#2D6A4F] hover:bg-[#1B4332]"
                      }`}
                    >
                      {userLoading ? "Registering & Logging In..." : "Complete Registration"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === "rider" && (
              /* ==============================================
                 RIDER GPS PORTAL
                 ============================================== */
              <div className="animate-fadeIn">
                <div className="flex items-center gap-2 text-blue-600 font-black text-xxs uppercase tracking-wider mb-2 bg-blue-50 px-2.5 py-1 rounded-full w-max">
                  <Bike className="w-3.5 h-3.5 text-blue-500" />
                  Rider GPS Dispatch Node
                </div>
                
                <h3 className="text-2xl font-serif italic text-blue-900 font-bold tracking-tight mb-2">
                  Courier Dispatch Login
                </h3>
                <p className="text-xs text-gray-500 mb-6 font-medium">
                  Authorizations require correct dedicated dispatch registration rider credentials.
                </p>

                <form onSubmit={handleRiderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                      Rider Courier ID Key
                    </label>
                    <div className="relative flex items-center">
                      <Bike className="absolute left-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type={showRiderUsername ? "text" : "password"}
                        value={riderCode}
                        onChange={(e) => setRiderCode(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 text-gray-950 placeholder-gray-300 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRiderUsername(!showRiderUsername)}
                        className="absolute right-3.5 text-gray-400 hover:text-gray-650 p-1 rounded-lg focus:outline-none transition-colors"
                        title={showRiderUsername ? "Hide Rider ID" : "Show Rider ID"}
                      >
                        {showRiderUsername ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                      Rider Security Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type={showRiderPassword ? "text" : "password"}
                        value={riderPass}
                        onChange={(e) => setRiderPass(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 text-gray-950 placeholder-gray-300 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRiderPassword(!showRiderPassword)}
                        className="absolute right-3.5 text-gray-400 hover:text-gray-650 p-1 rounded-lg focus:outline-none transition-colors"
                        title={showRiderPassword ? "Hide Rider Password" : "Show Rider Password"}
                      >
                        {showRiderPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 font-mono"
                  >
                    Authorize Rider Dispatch
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === "admin" && (
              /* ==============================================
                 ADMIN PORTAL - INCORPORATING SYSTEM ADMIN & KITCHEN VENDOR
                 ============================================== */
              <div className="animate-fadeIn">
                {/* Embedded Sub-Segment Switcher */}
                <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-150 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminSubTab("admin");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2 text-xxs sm:text-xs font-bold font-mono tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      adminSubTab === "admin"
                        ? "bg-[#8B1A1A] text-[#FFF8F0] shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    System Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminSubTab("kitchen");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2 text-xxs sm:text-xs font-bold font-mono tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      adminSubTab === "kitchen"
                        ? "bg-[#FF6B35] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    Kitchen Partner
                  </button>
                </div>

                {adminSubTab === "admin" ? (
                  /* ==============================================
                     ADMIN SUB-PORTAL
                     ============================================== */
                  <div className="animate-fadeIn">
                    <div className="flex items-center gap-2 text-[#8B1A1A] font-black text-xxs uppercase tracking-wider mb-2 bg-[#8B1A1A]/10 px-2.5 py-1 rounded-full w-max">
                      <Shield className="w-3.5 h-3.5" />
                      Enterprise Root Admin Control
                    </div>

                    <h3 className="text-2xl font-serif italic text-[#8B1A1A] font-bold tracking-tight mb-2">
                      Admin System Login
                    </h3>
                    <p className="text-xs text-gray-500 mb-6 font-medium">
                      Authorizations require correct dedicated security key credentials.
                    </p>

                    <form onSubmit={handleAdminSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Admin Username
                        </label>
                        <div className="relative flex items-center">
                          <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter Admin Username"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-950 placeholder-gray-300 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Admin Password
                        </label>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-950 placeholder-gray-300 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 text-gray-400 hover:text-gray-650 p-1 rounded-lg focus:outline-none transition-colors animate-fadeIn"
                            title={showPassword ? "Hide Password" : "Show Password"}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={adminLoading}
                        className="w-full py-3 bg-[#8B1A1A] hover:bg-[#590C0C] text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#8B1A1A]/20 flex items-center justify-center gap-2 font-mono"
                      >
                        {adminLoading ? "Requesting Office Ingress..." : "Authorize Enterprise Room"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ) : (
                  /* ==============================================
                     KITCHEN SUB-PORTAL
                     ============================================== */
                  <div className="animate-fadeIn">
                    <div className="flex items-center gap-2 text-[#FF6B35] font-black text-xxs uppercase tracking-wider mb-2 bg-[#FFF8F0] px-2.5 py-1 rounded-full w-max">
                      <Store className="w-3.5 h-3.5 text-[#FF6B35]" />
                      Momo Kitchen Partner Desk
                    </div>

                    <h3 className="text-2xl font-serif italic text-[#FF6B35] font-bold tracking-tight mb-2">
                      Kitchen Partner Login
                    </h3>
                    <p className="text-xs text-gray-500 mb-6 font-medium">
                      Authorizations require correct dedicated partner merchant security credentials.
                    </p>

                    <form onSubmit={handleVendorSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Partner Merchant Code
                        </label>
                        <div className="relative flex items-center">
                          <Store className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type={showVendorCode ? "text" : "password"}
                            value={vendorCode}
                            onChange={(e) => setVendorCode(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-gray-950 placeholder-gray-300 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowVendorCode(!showVendorCode)}
                            className="absolute right-3.5 text-gray-400 hover:text-gray-650 p-1 rounded-lg focus:outline-none transition-colors"
                            title={showVendorCode ? "Hide Merchant Code" : "Show Merchant Code"}
                          >
                            {showVendorCode ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Partner Merchant Password
                        </label>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type={showVendorPass ? "text" : "password"}
                            value={vendorPass}
                            onChange={(e) => setVendorPass(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-gray-950 placeholder-gray-300 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowVendorPass(!showVendorPass)}
                            className="absolute right-3.5 text-gray-400 hover:text-gray-650 p-1 rounded-lg focus:outline-none transition-colors"
                            title={showVendorPass ? "Hide Merchant Password" : "Show Merchant Password"}
                          >
                            {showVendorPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={userLoading}
                        className="w-full py-3 bg-[#FF6B35] hover:bg-[#8B1A1A] text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#FF6B35]/20 flex items-center justify-center gap-2 font-mono"
                      >
                        {userLoading ? "Validating Partner Ingress..." : "Authorize Kitchen Terminal"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer of secure panel */}
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5 border-t border-gray-100 pt-3">
            <CornerDownRight className="w-3.5 h-3.5 text-gray-300 animate-pulse" />
            <span>Secure encryption active. Device viewport synchronized and certified.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
