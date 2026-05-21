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
import { MenuItem, CartItem, Order, GroceryItem } from "./types";
import LoginPortal from "./components/LoginPortal";
import AdminPortalPanel from "./components/AdminPortalPanel";

export default function App() {
  // Global States
  const [userRole, setUserRole] = useState<"customer" | "vendor" | "rider" | "admin">("customer");
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<"home" | "restaurant" | "checkout" | "tracking">("home");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("rest_1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(["rest_1", "rest_4"]);
  const [customerAddress, setCustomerAddress] = useState("Ward No. 3, Jhamsikhel Tole, Lalitpur, Kathmandu");
  const [loyaltyPoints, setLoyaltyPoints] = useState(120);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Floating Overlay trigger states
  const [activeCookItem, setActiveCookItem] = useState<MenuItem | null>(null);
  const [activeARItem, setActiveARItem] = useState<MenuItem | null>(null);

  // Syncing cart contents or active activeOrder with localStorage for continuous state
  useEffect(() => {
    localStorage.setItem("foodienepal_cart", JSON.stringify(cart));
  }, [cart]);

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
      // Clean previous items from other restaurants to respect single-cart deliveries
      const fromOtherRest = prev.some((cartIt) => cartIt.restaurantId !== restId);
      const baseCart = fromOtherRest ? [] : prev;

      const existingIdx = baseCart.findIndex((cartIt) => cartIt.menuItem.id === item.id);
      if (existingIdx > -1) {
        const updated = [...baseCart];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [
        ...baseCart,
        {
          id: `cart_${Date.now()}`,
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
      discountAmount
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
        setCurrentView("tracking");
        // Award substantial loyalty points upon buying!
        setLoyaltyPoints((pts) => pts + 25);
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
            if (role === "customer") {
              setCurrentView("home");
            }
            setShowLogin(false);
          }}
          onCancel={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}
