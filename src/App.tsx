import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Restaurant from "./pages/Restaurant";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import Chatbot from "./components/Chatbot";
import IngredientAnimation from "./components/IngredientAnimation";
import ARViewer from "./components/ARViewer";
import VendorDashboard from "./vendor/VendorDashboard";
import RiderDashboard from "./rider/RiderDashboard";
import { MenuItem, CartItem, Order, GroceryItem, User } from "./types";
import LoginPortal from "./components/LoginPortal";
import AdminPortalPanel from "./components/AdminPortalPanel";
import Footer from "./components/Footer";
import OnboardingWizard from "./components/OnboardingWizard";

export default function App() {
  // Global States
  const [portalLock, setPortalLock] = useState<"customer" | "admin" | null>(() => {
    return (localStorage.getItem("foodienepal_portal_lock") as "customer" | "admin" | null) || null;
  });
  const [googleUser, setGoogleUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("foodienepal_google_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userRole, setUserRole] = useState<"customer" | "vendor" | "rider" | "admin">(() => {
    return (localStorage.getItem("foodienepal_portal_lock") as any) || "customer";
  });
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<"home" | "restaurant" | "checkout" | "tracking">("home");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("rest_1");
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("foodienepal_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [favorites, setFavorites] = useState<string[]>(["rest_1", "rest_4"]);
  const [customerAddress, setCustomerAddress] = useState(() => {
    return localStorage.getItem("foodienepal_customer_address") || "Pokhara, Nepal";
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState(() => {
    try {
      const saved = localStorage.getItem("foodienepal_loyalty_points");
      return saved ? parseInt(saved, 10) : 120;
    } catch {
      return 120;
    }
  });

  const handleOnboardingComplete = (chosenRole: "customer" | "admin") => {
    setPortalLock(chosenRole);
    setUserRole(chosenRole);
    localStorage.setItem("foodienepal_portal_lock", chosenRole);
    if (chosenRole === "customer") {
      setCurrentView("home");
    }
  };

  const handleGoogleSuccess = (user: User) => {
    setGoogleUser(user);
    setLoyaltyPoints(user.foodiePoints || 100);
    localStorage.setItem("foodienepal_google_user", JSON.stringify(user));
  };

  const handleGoogleSignOut = () => {
    setGoogleUser(null);
    localStorage.removeItem("foodienepal_google_user");
  };

  const handleResetPortal = () => {
    setPortalLock(null);
    setGoogleUser(null);
    localStorage.removeItem("foodienepal_portal_lock");
    localStorage.removeItem("foodienepal_google_user");
  };

  useEffect(() => {
    localStorage.setItem("foodienepal_loyalty_points", loyaltyPoints.toString());
  }, [loyaltyPoints]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);

  // Floating Overlay trigger states
  const [activeCookItem, setActiveCookItem] = useState<MenuItem | null>(null);
  const [activeARItem, setActiveARItem] = useState<MenuItem | null>(null);

  // Syncing cart contents with localStorage for continuous state
  useEffect(() => {
    localStorage.setItem("foodienepal_cart", JSON.stringify(cart));
  }, [cart]);

  // Syncing address changes with local storage and mock profile details
  useEffect(() => {
    localStorage.setItem("foodienepal_customer_address", customerAddress);
    fetch("/api/auth/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: customerAddress })
    }).catch(() => {});
  }, [customerAddress]);

  // Restore latest pending active order on startup
  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((orders) => {
        if (orders && orders.length > 0) {
          const pending = orders.find((o: Order) => o.status !== "delivered" && o.status !== "cancelled");
          if (pending) {
            setActiveOrder(pending);
            setCurrentView("tracking");
          }
        }
      })
      .catch(() => {});
  }, []);

  // Navbar Switcher trigger
  const handleRoleChange = (role: "customer" | "vendor" | "rider" | "admin") => {
    setUserRole(role);
    if (role === "customer") {
      setCurrentView("home");
    }
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Cart operations
  const handleAddToCart = (item: MenuItem, restId: string, restName: string) => {
    setCart((prev) => {
      // Support multi-restaurant items inside the cart together
      const baseCart = prev;

      const existingIdx = baseCart.findIndex((cartIt) => cartIt.menuItem.id === item.id);
      if (existingIdx > -1) {
        const updated = [...baseCart];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [
        ...baseCart,
        {
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          menuItem: item,
          quantity: 1,
          restaurantId: restId,
          restaurantName: restName
        }
      ];
    });

    // Award loyalty point for adding
    setLoyaltyPoints((pts) => pts + 2);
  };

  // Add search chatbot string or standard text search
  const handleBotAddToCartDirect = (itemName: string) => {
    // Mimic chatbot adding food items directly based on names
    const mockMatchItem: MenuItem = {
      id: "item_101",
      name: "Steam Buff Momo",
      price: 130,
      description: "Nepali style dumplings stuffed with spiced minced buffalo meat.",
      category: "Momo",
      image: "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Medium",
      isVeg: false,
      ingredients: []
    };
    handleAddToCart(mockMatchItem, "rest_1", "Momo House Lalitpur");
  };

  const handleUpdateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((cartIt) => (cartIt.id === id ? { ...cartIt, quantity: qty } : cartIt))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((cartIt) => cartIt.id !== id));
  };

  const handleUpdateCartItemSpice = (id: string, spice: string) => {
    setCart((prev) =>
      prev.map((cartIt) => (cartIt.id === id ? { ...cartIt, selectedSpice: spice } : cartIt))
    );
  };

  const handleUpdateCartItemNote = (id: string, note: string) => {
    setCart((prev) =>
      prev.map((cartIt) => (cartIt.id === id ? { ...cartIt, notes: note } : cartIt))
    );
  };

  // Adding Raw Grocery item to standard Checkout Cart
  const handleSelectGroceryItem = (item: GroceryItem, qty: number) => {
    const relativeMenuItem: MenuItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      description: `Organic pantry: ${item.name} sold per ${item.unit}. Pack from Mandi.`,
      category: "Fresh Pantry",
      image: item.image,
      spiceLevel: "Mild",
      isVeg: true,
      ingredients: []
    };
    handleAddToCart(relativeMenuItem, "grocery_mandi", "FoodieNepal Fresh Mandi");
    setCurrentView("checkout");
  };

  // Place Order Action
  const handlePlaceOrder = async (
    paymentMethod: "cod" | "esewa" | "khalti" | "imepay",
    promoCode?: string,
    discountAmount?: number
  ) => {
    if (cart.length === 0) return;

    const firstItem = cart[0];
    const subtotal = cart.reduce((acc, it) => acc + it.menuItem.price * it.quantity, 0);
    const calculatedTax = Math.round(subtotal * 0.05);
    const finalBill = Math.max(0, subtotal + 40 + 10 + calculatedTax - (discountAmount || 0));

    const orderPayload = {
      items: cart,
      restaurantId: firstItem.restaurantId,
      restaurantName: firstItem.restaurantName,
      address: customerAddress,
      total: finalBill,
      paymentMethod,
      promoCode,
      discountAmount,
      subtotal,
      deliveryFee: 40,
      platformFee: 10,
      tax: calculatedTax
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(data.order);
        setCart([]); // Clear cart
        
        // Calculate precise points: Up to 500 Rs -> 50 pts, Up to 1000 Rs -> 100 pts, etc. per item
        const earnedPoints = cart.reduce((acc, item) => {
          const itemPrice = item.menuItem.price;
          const pointsPerItemUnit = Math.ceil(itemPrice / 500) * 50;
          return acc + (pointsPerItemUnit * item.quantity);
        }, 0);
        
        setLoyaltyPoints((pts) => pts + earnedPoints);
        setOrderPlacedSuccess(true);
        setTimeout(() => {
          setOrderPlacedSuccess(false);
          setCurrentView("tracking");
        }, 2200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(data.order);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyOtp = async (id: string, otp: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(data.order);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackOrder = (order: Order) => {
    setActiveOrder(order);
    setCurrentView("tracking");
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 text-gray-800 flex flex-col font-sans">
      
      {/* Dynamic Navigations bar */}
      <Navbar
        currentRole={userRole}
        onRoleChange={handleRoleChange}
        cartCount={cart.reduce((acc, it) => acc + it.quantity, 0)}
        onCartToggle={() => setCurrentView("checkout")}
        currentAddress={customerAddress}
        foodiePoints={loyaltyPoints}
        onOpenLogin={() => setShowLogin(true)}
        portalLock={portalLock}
        googleUser={googleUser}
        onGoogleSignOut={handleGoogleSignOut}
        onResetPortal={handleResetPortal}
      />

      <main className="flex-1 mt-6">
        {/* Switch Rendering Views depending on Selected Roles */}
        {userRole === "customer" && (
          <>
            {currentView === "home" && (
              <Home
                onSelectRestaurant={(id) => {
                  setSelectedRestaurantId(id);
                  setCurrentView("restaurant");
                }}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onAddToCartDirect={handleAddToCart}
                onCookAnimation={(item) => setActiveCookItem(item)}
                onARPreview={(item) => setActiveARItem(item)}
                onSelectGroceryItem={handleSelectGroceryItem}
                customerAddress={customerAddress}
                onChangeAddress={setCustomerAddress}
                loyaltyPoints={loyaltyPoints}
                onChangeLoyaltyPoints={setLoyaltyPoints}
                onTrackOrder={handleTrackOrder}
              />
            )}

            {currentView === "restaurant" && (
              <Restaurant
                restaurantId={selectedRestaurantId}
                onBack={() => setCurrentView("home")}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
                onCookAnimation={(item) => setActiveCookItem(item)}
                onARPreview={(item) => setActiveARItem(item)}
              />
            )}

            {currentView === "checkout" && (
              <Checkout
                cartItems={cart}
                onBack={() => setCurrentView("home")}
                onUpdateQty={handleUpdateCartQty}
                onRemoveItem={handleRemoveCartItem}
                onUpdateCartItemSpice={handleUpdateCartItemSpice}
                onUpdateCartItemNote={handleUpdateCartItemNote}
                customerAddress={customerAddress}
                onChangeAddress={setCustomerAddress}
                onPlaceOrder={handlePlaceOrder}
              />
            )}

            {currentView === "tracking" && (
              <OrderTracking
                order={activeOrder}
                onBack={() => setCurrentView("home")}
                onCancelOrder={handleCancelOrder}
                onVerifyOtp={handleVerifyOtp}
              />
            )}
          </>
        )}

        {userRole === "vendor" && <VendorDashboard />}

        {userRole === "rider" && <RiderDashboard />}

        {userRole === "admin" && <AdminPortalPanel />}
      </main>

      {/* Global Application Footer */}
      <Footer />

      {/* Floating Grounded GIS Chatbot for Customers */}
      {userRole === "customer" && (
        <Chatbot
          onAddToCartDirect={handleBotAddToCartDirect}
          lastOrderId={activeOrder?.id}
          userLocation={customerAddress}
        />
      )}

      {/* FLYING COOKING INGREDIENT INTERACTION MODAL */}
      {activeCookItem && (
        <IngredientAnimation
          item={activeCookItem}
          onClose={() => setActiveCookItem(null)}
          onAddToCartDirect={(item) => handleAddToCart(item, selectedRestaurantId, "Momo House")}
        />
      )}

      {/* WebAR INTERACTIVE TABLE MODEL INTERACTIVE MODAL */}
      {activeARItem && (
        <ARViewer
          item={activeARItem}
          onClose={() => setActiveARItem(null)}
          onAddToCartDirect={(item) => handleAddToCart(item, selectedRestaurantId, "Momo House")}
        />
      )}

      {showLogin && (
        <LoginPortal
          onLoginSuccess={(role) => {
            setUserRole(role);
            if (role === "admin") {
              setPortalLock("admin");
              localStorage.setItem("foodienepal_portal_lock", "admin");
            } else if (role === "customer" || role === "vendor" || role === "rider") {
              setPortalLock("customer");
              localStorage.setItem("foodienepal_portal_lock", "customer");
              if (role === "customer") {
                setCurrentView("home");
              }
            }
            setShowLogin(false);
          }}
          onCancel={() => setShowLogin(false)}
          onGoogleSuccess={handleGoogleSuccess}
        />
      )}

      {/* ONBOARDING INITIAL ROLE GATEWAYS (ASK 2 QUESTIONS AT STARTUP) */}
      {!portalLock && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onGoogleSignIn={() => setShowLogin(true)}
        />
      )}

      {orderPlacedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#FFF8F0] border-2 border-[#8B1A1A] text-gray-950 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-500 via-[#8B1A1A] to-emerald-500" />
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner animate-bounce">
              <svg className="w-10 h-10 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-xl font-serif italic font-extrabold text-[#8B1A1A] mb-1">
              Order successfully placed !
            </h3>
            <p className="text-[10px] font-mono text-[#FF6B35] tracking-widest uppercase font-bold mb-4">
              Nepalese Gastronomy Dispatch
            </p>
            <p className="text-xs text-gray-700 leading-relaxed max-w-xs mx-auto mb-6">
              Hajur! Your high-fidelity culinary order has been safely locked in. Preparing standard delivery live maps...
            </p>
            
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 mb-5 text-[11px] text-gray-500">
              <div className="flex items-center justify-between">
                <span>Loyalty Multiplier:</span>
                <span className="text-emerald-600 font-bold">+25 loyalty points secured</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-ping" />
              <span>Redirecting to order tracking section...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
