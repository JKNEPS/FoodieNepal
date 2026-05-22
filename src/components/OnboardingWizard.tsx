import { useState } from "react";
import { Sparkles, UtensilsCrossed, ShieldCheck, ArrowRight, User, Settings, CheckCircle2, CloudLightning } from "lucide-react";
import { UserRole } from "../types";

interface OnboardingWizardProps {
  onComplete: (chosenRole: "customer" | "admin") => void;
  onGoogleSignIn: () => void;
}

export default function OnboardingWizard({ onComplete, onGoogleSignIn }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [primaryGoal, setPrimaryGoal] = useState<"customer" | "admin" | null>(null);
  const [accessPreference, setAccessPreference] = useState<string | null>(null);

  const handleStep1Select = (choice: "customer" | "admin") => {
    setPrimaryGoal(choice);
    setStep(2);
  };

  const handleStep2Select = (preference: string) => {
    setAccessPreference(preference);
    if (primaryGoal === "customer") {
      onComplete("customer");
      if (preference === "google") {
        setTimeout(() => {
          onGoogleSignIn();
        }, 300);
      }
    } else if (primaryGoal === "admin") {
      onComplete("admin");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FFF8F0]/95 md:bg-black/80 backdrop-blur-lg p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#FFF8F0] border-2 border-[#8B1A1A]/20 text-gray-900 rounded-[2.5rem] max-w-lg w-full shadow-2xl relative overflow-hidden my-auto p-8 md:p-12">
        {/* Top Decorative Himalayan Gradient border */}
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-orange-500 via-[#8B1A1A] to-[#2D6A4F]" />
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-[#8B1A1A] text-white rounded-2xl mb-4 shadow-[#8B1A1A]/10 shadow-lg">
            <UtensilsCrossed className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-3xl font-serif italic font-extrabold text-[#8B1A1A] tracking-tight">
            Foodie<span className="text-[#FF6B35]">Nepal</span>
          </h2>
          <p className="text-[10px] font-mono tracking-widest text-[#2D6A4F] uppercase font-bold mt-1">
            Regional Culinary Hub &amp; Gateways
          </p>
        </div>

        {/* STEP 1: Main Role Selection */}
        {step === 1 && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center">
              <span className="text-[11px] font-mono font-extrabold text-[#FF6B35] tracking-widest uppercase">
                Step 1 of 2 &bull; Workspace Initialization
              </span>
              <h3 className="text-xl font-bold font-sans text-gray-900 tracking-tight mt-1.5">
                Which FoodieNepal portal would you like to enter?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Select your primary engagement goal to customize your dashboard layout.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              {/* Customer Option Button */}
              <button
                onClick={() => handleStep1Select("customer")}
                className="group text-left p-5 bg-white hover:bg-[#8B1A1A]/5 rounded-2xl border border-gray-200 hover:border-[#8B1A1A]/30 transition-all shadow-xs cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#FF6B35]/10 text-[#FF6B35] rounded-xl group-hover:bg-[#FF6B35]/20 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-950 font-sans flex items-center gap-1.5">
                      Customer Experience Portal
                      <ArrowRight className="w-4 h-4 text-[#FF6B35] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      Browse standard menus, enjoy 3D AR previews, purchase gourmet groceries, and lock in tracked home deliveries.
                    </p>
                  </div>
                </div>
              </button>

              {/* Admin Option Button */}
              <button
                onClick={() => handleStep1Select("admin")}
                className="group text-left p-5 bg-white hover:bg-[#8B1A1A]/5 rounded-2xl border border-gray-200 hover:border-[#8B1A1A]/30 transition-all shadow-xs cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#8B1A1A]/10 text-[#8B1A1A] rounded-xl group-hover:bg-[#8B1A1A]/20 transition-colors">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-950 font-sans flex items-center gap-1.5">
                      Platform Administrator Panel
                      <ArrowRight className="w-4 h-4 text-[#8B1A1A] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      Manage menus, track driver location registers, dispatch order reports, and oversee general backend parameters.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Secondary Clarification */}
        {step === 2 && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center">
              <span className="text-[11px] font-mono font-extrabold text-[#FF6B35] tracking-widest uppercase">
                Step 2 of 2 &bull; Access Configuration
              </span>
              <h3 className="text-xl font-bold font-sans text-gray-900 tracking-tight mt-1.5">
                {primaryGoal === "customer" 
                  ? "Customize your Customer login preference:" 
                  : "Confirm your Admin security privilege:"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Tailor how you want the dashboard session initialized.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              {primaryGoal === "customer" ? (
                <>
                  {/* Option A1: Google Sign In */}
                  <button
                    onClick={() => handleStep2Select("google")}
                    className="group text-left p-5 bg-white hover:bg-orange-50/50 rounded-2xl border border-gray-200 hover:border-[#FF6B35]/30 transition-all shadow-xs cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#FF6B35]/15 text-[#FF6B35] rounded-xl">
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-950 font-sans flex items-center gap-1.5">
                          Log In with Real Google Account
                          <ArrowRight className="w-4 h-4 text-[#FF6B35] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          Securely link your personal Google profile to track order histories and accumulate foodie loyalty rewards points.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Option A2: Guest browse */}
                  <button
                    onClick={() => handleStep2Select("guest")}
                    className="group text-left p-5 bg-white hover:bg-[#8B1A1A]/5 rounded-2xl border border-gray-200 hover:border-[#8B1A1A]/30 transition-all shadow-xs cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-xl group-hover:bg-[#2D6A4F]/20 transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-950 font-sans flex items-center gap-1.5">
                          Anonymous Guest Foodie Mode
                          <ArrowRight className="w-4 h-4 text-[#8B1A1A] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          Instantly browse catalogs and configure cart purchases right away without linking active accounts.
                        </p>
                      </div>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  {/* Option B1: System Master Administrator */}
                  <button
                    onClick={() => handleStep2Select("lead")}
                    className="group text-left p-5 bg-white hover:bg-[#8B1A1A]/5 rounded-2xl border border-gray-200 hover:border-[#8B1A1A]/30 transition-all shadow-xs cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#8B1A1A]/10 text-[#8B1A1A] rounded-xl">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-950 font-sans flex items-center gap-1.5">
                          Lead Creator Platform Administrator
                          <ArrowRight className="w-4 h-4 text-[#8B1A1A] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          Proceed to Admin Dashboard with full operational overviews and system database parameters.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Option B2: Standard admin node */}
                  <button
                    onClick={() => handleStep2Select("operator")}
                    className="group text-left p-5 bg-white hover:bg-[#2D6A4F]/5 rounded-2xl border border-gray-200 hover:border-[#2D6A4F]/30 transition-all shadow-xs cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-xl">
                        <CloudLightning className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-950 font-sans flex items-center gap-1.5">
                          Standard Operator Console
                          <ArrowRight className="w-4 h-4 text-[#2D6A4F] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          Initialize simplified operation panel with focus on real-time driver routes and live tracking registers.
                        </p>
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Back button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors font-mono"
              >
                &larr; Back to Role Selection
              </button>
            </div>
          </div>
        )}

        {/* Footer info note */}
        <p className="text-center text-[10px] text-gray-400 font-sans tracking-tight mt-8">
          By continuing, you agree to access authorized domains under standard Nepalese gastronomy service parameters.
        </p>
      </div>
    </div>
  );
}
