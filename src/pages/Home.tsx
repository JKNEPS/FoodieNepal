import { useState, useEffect } from "react";
import { Star, MapPin, Bike, Heart, Sparkles, Flame, Store, Plus, Clock, Compass, Activity, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import HeroBanner from "../components/HeroBanner";
import { Restaurant, MenuItem, GroceryItem, Order, CartItem } from "../types";

// Import custom high-resolution food assets
import chickenBurgerImg from "../assets/images/chicken_burger_1780140936309.png";
import chickenPizzaImg from "../assets/images/chicken_pizza_1780140960052.png";
import samayBajiImg from "../assets/images/samay_baji_1780140980351.png";
import buckwheatDhidoImg from "../assets/images/buckwheat_dhido_1780141002501.png";
import nepaliChatpateImg from "../assets/images/nepali_chatpate_1780141021967.png";
import buffChhoilaImg from "../assets/images/buff_chhoila_1780141044024.png";

interface HomeProps {
  onSelectRestaurant: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCartDirect: (item: MenuItem, restId: string, restName: string) => void;
  onCookAnimation: (item: MenuItem) => void;
  onARPreview: (item: MenuItem) => void;
  onSelectGroceryItem: (item: GroceryItem, qty: number) => void;
  customerAddress: string;
  onChangeAddress: (addr: string) => void;
  loyaltyPoints: number;
  onChangeLoyaltyPoints: (pts: number | ((p: number) => number)) => void;
  onTrackOrder: (order: Order) => void;
  cartItems: CartItem[];
}

// Correct high-resolution images for the loyalty prize hub
const LOYALTY_EXCHANGE_ITEMS = [
  {
    id: "loyalty_momo",
    name: "🎁 Points Chicken Steamed MoMo (10pcs)",
    pointsRequired: 600,
    price: 0,
    description: "Points Special: Authentic plate of 10 juicy chicken steamed dumplings seasoned to perfection.",
    category: "Momo",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600",
    spiceLevel: "Medium",
    isVeg: false,
    ingredients: []
  },
  {
    id: "loyalty_burger",
    name: "🎁 Points Chicken Burger (200Rs)",
    pointsRequired: 2000,
    price: 0,
    description: "Points Special: Mouth-watering crispy chicken burger with cheese and premium toasted buns.",
    category: "Burger",
    image: chickenBurgerImg,
    spiceLevel: "Mild",
    isVeg: false,
    ingredients: []
  },
  {
    id: "loyalty_pizza",
    name: "🎁 Points Chicken Fired Wood Pizza",
    pointsRequired: 5400,
    price: 0,
    description: "Points Special: Delicious wood-fired organic pizza topped with grilled chicken, local yak cheese, and fresh herbs.",
    category: "Pizza",
    image: chickenPizzaImg,
    spiceLevel: "Medium",
    isVeg: false,
    ingredients: []
  }
];

// Master high-fidelity Menu Varieties database (with fully corrected images)
const ALL_MENU_ITEMS = [
  {
    id: "item_101",
    name: "Buff Steamed MoMo (Juicy Dumplings with Spicy Sesame Dip)",
    price: 130,
    description: "Nepali style dumplings stuffed with spiced minced buffalo meat, steamed to perfection.",
    category: "Momo",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_1",
    restaurantName: "Momo House & Newari Delicacy"
  },
  {
    id: "item_102",
    name: "Buff Jhol MoMo (Dumplings Drowned in Tangy Sesame Soup)",
    price: 160,
    description: "Momo drowned in a cold/warm tangy sesame-based light soup flavored with hog plum (lapsi).",
    category: "Momo",
    image: "https://plus.unsplash.com/premium_photo-1669742928014-ba36511677c7?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_1",
    restaurantName: "Momo House & Newari Delicacy"
  },
  {
    id: "item_103",
    name: "Yak Cheese & Vegetable MoMo (Creamy Steamed Dumplings)",
    price: 140,
    description: "Dumplings stuffed with mixed fresh vegetables, paneer, and local yak cheese. Incredibly rich.",
    category: "Momo",
    image: "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_1",
    restaurantName: "Momo House & Newari Delicacy"
  },
  {
    id: "item_104",
    name: "Buff Chili C-MoMo (Wok-Tossed Spicy Pan-Fried Dumplings)",
    price: 180,
    description: "Fried momo tossed in a hot and spicy, tangy capsicum, onion, and chili sauce dressing.",
    category: "Momo",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_1",
    restaurantName: "Momo House & Newari Delicacy"
  },
  {
    id: "item_105",
    name: "Buff Chhoila (Spiced Charcoal-Grilled Marinated Buffalo Meat Salad)",
    price: 220,
    description: "Spiced grilled meat salad marinated with roasted garlic, fenugreek, and mustard oil.",
    category: "Newari",
    image: buffChhoilaImg,
    restaurantId: "rest_1",
    restaurantName: "Momo House & Newari Delicacy"
  },
  {
    id: "item_201",
    name: "Samay Baji Platter (Traditional Newari Multi-Dish Festive Feast Set)",
    price: 250,
    description: "An authentic Newari feast with beaten rice, spiced buffalo chhoila, roasted black soybeans, and baras.",
    category: "Newari",
    image: samayBajiImg,
    restaurantId: "rest_2",
    restaurantName: "Basantapur Samay Baji Corner"
  },
  {
    id: "item_202",
    name: "Traditional Bara (Savory Lentil Pancake Topped with Meat & Egg)",
    price: 150,
    description: "Savory black lentil pancake fried on a cast iron pan, topped with egg and seasoned meat.",
    category: "Newari",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_2",
    restaurantName: "Basantapur Samay Baji Corner"
  },
  {
    id: "item_203",
    name: "Supreme Chatamari (Crispy Rice Crepe 'Nepali Pizza' with Chicken & Egg)",
    price: 180,
    description: "Thin, crispy rice flour crepe loaded with seasoned chicken, onion, tomato, fresh coriander, and egg.",
    category: "Newari",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_2",
    restaurantName: "Basantapur Samay Baji Corner"
  },
  {
    id: "item_204",
    name: "Alu Tama Bodi Soup (Classic Tangy Bamboo Shoot & Bean Curry)",
    price: 110,
    description: "Classic Newari soup curry made with fermented tender bamboo shoots, potatoes, and black-eyed peas.",
    category: "Newari",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_2",
    restaurantName: "Basantapur Samay Baji Corner"
  },
  {
    id: "item_301",
    name: "Thakali Chicken Thali Set (Basmati Rice, Lentils, local Curry & Ghee Platter)",
    price: 320,
    description: "Aromatic basmati rice, slow-cooked yellow and black lentils, organic chicken curry, pure Himalayan ghee, and pickles.",
    category: "Thakali",
    image: "https://images.unsplash.com/photo-1615557960916-5f4791edd69a?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_3",
    restaurantName: "Thakali Bhanchha Ghar"
  },
  {
    id: "item_302",
    name: "Lete Buckwheat Dhido (Nutritional Himalayan Hot Grain Mash cooking Platter)",
    price: 290,
    description: "Himalayan nutritional powerhouse: buckwheat porridge served with clarifying ghee, Gundruk and local stew.",
    category: "Traditional",
    image: buckwheatDhidoImg,
    restaurantId: "rest_3",
    restaurantName: "Thakali Bhanchha Ghar"
  },
  {
    id: "item_303",
    name: "Buff Sukuti Sadeko (Spicy Crispy Charcoal Dry-Meat Jerky Salad)",
    price: 240,
    description: "Spicy air-fried dry buffalo strips tossed with red onions, szechuan pepper (Timmur), and lemon.",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_3",
    restaurantName: "Thakali Bhanchha Ghar"
  },
  {
    id: "item_401",
    name: "Classic Veg Dal Bhat Platter (Signature Nepali Household Rice & Lentils Set)",
    price: 130,
    description: "Simple household Nepali thali with yellow mountain lentils, mixed seasonal vegetables, and pickles.",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_4",
    restaurantName: "Dal-Bhat Kamalpokhari Express"
  },
  {
    id: "item_402",
    name: "Khasi Ko Masu Dal Bhat Set (Tender Himalayan Goat Mutton Curry Thali)",
    price: 360,
    description: "Premium thali with slow-simmered local mountain mutton (goat) curry cooked in traditional heavy brass pots.",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_4",
    restaurantName: "Dal-Bhat Kamalpokhari Express"
  },
  {
    id: "item_501",
    name: "Golden Sweet Jerry (Crispy Syrupy Cardamom Jalebi Spiral Fritters - 2 Pcs)",
    price: 60,
    description: "Deep-fried fermented rice flour spiral shapes, soaked in aromatic sugar cardamom syrup.",
    category: "Street Food",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_5",
    restaurantName: "Basantapur Sweet & Selroti Pasal"
  },
  {
    id: "item_502",
    name: "Traditional Ring Sel Roti (Crispy Rice Bread Served with Sesame Potato Salad)",
    price: 90,
    description: "Traditional ring-shaped crispy sweet rice bread, deep-fried in ghee, served with sesame potato salad.",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_5",
    restaurantName: "Basantapur Sweet & Selroti Pasal"
  },
  {
    id: "item_601",
    name: "Buff Chowmein (Delicious Spicy Nepali-Style Wok-Fired Buffalo Noodles)",
    price: 110,
    description: "Nepali wok-fired wheat noodles tossed with sautéed buffalo meat strips, cabbage, carrot, and soy.",
    category: "Chowmein",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_6",
    restaurantName: "Lalitpur Chowmein & Nepali Fast Food"
  },
  {
    id: "item_602",
    name: "Veg Chowmein Extra Spice (Street-Style Spicy Stir-Fried Vegetable Noodles)",
    price: 95,
    description: "Street-style hot chowmein loaded with shredded fresh local vegetables and extra green chilies.",
    category: "Chowmein",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_6",
    restaurantName: "Lalitpur Chowmein & Nepali Fast Food"
  },
  {
    id: "item_701",
    name: "Tibet Butter Tea Su-Chiya Set (Warm Salted Tea Served with 2 Steamed Tingmo Flower Buns)",
    price: 130,
    description: "Authentic Tibetan tea brewed with yak butter and salt, served alongside two soft flower steamed buns.",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_7",
    restaurantName: "Thamel Himalayan Tea & Tingmo"
  },
  {
    id: "item_801",
    name: "Pork Sekuwa Platter (Dharane Charcoal-Grilled Spiced Meat Skewers with Beaten Rice)",
    price: 210,
    description: "Tender chunks of pork marinated in Dharane-style mountain herbs, skewers-grilled over open natural charcoal.",
    category: "Street Food",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_8",
    restaurantName: "Tripureshwor Sekuwa Corner"
  },
  {
    id: "item_901",
    name: "Sweet Lapsi Yogurt Lassi (Creamy Shaken Curd Infused with Wild Plum Pulp)",
    price: 110,
    description: "Rich curd blended with wild sweet-sour Nepalese Hog Plum fruit pulp and toasted almonds.",
    category: "Street Food",
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed635d?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_9",
    restaurantName: "Boudha Butter Tea House"
  },
  {
    id: "item_1001",
    name: "Spicy Basantapur Chatpate (Crunchy Puffed Rice Mixture Salad with Raw Lemon & Spices)",
    price: 50,
    description: "Crunchy puffed rice mixed in raw green chilies, boiled potatoes, chopped onions, and mustard oil.",
    category: "Street Food",
    image: nepaliChatpateImg,
    restaurantId: "rest_10",
    restaurantName: "Baneshwor Lassi & Chatpat Corner"
  },
  // Bakery Delicacies
  {
    id: "item_bak_1",
    name: "Bakery Butter Bun (Sweet Fluffy Neighborhood Bun Brushed with Fresh Ghee)",
    price: 75,
    description: "Sweet, fluffy neighborhood bakery bun brushed with pure clarifying butter.",
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_5",
    restaurantName: "Basantapur Sweet & Selroti Pasal"
  },
  {
    id: "item_bak_2",
    name: "Yak Cheese Butter Croissant (Flaky Golden Pastry Filled with Melted Local Mountain Cheese)",
    price: 155,
    description: "Flaky golden croissant stuffed with melted local Himalayan mountain yak cheese cream.",
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_5",
    restaurantName: "Basantapur Sweet & Selroti Pasal"
  },
  {
    id: "item_bak_3",
    name: "Kathmandu Honey Roasted Almond Cake (Moist Sponge slice with Local Cardamom Honey Syrup)",
    price: 120,
    description: "Moist sponge slice loaded with crunchy roasted almonds and local honey syrup toppings.",
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=400",
    restaurantId: "rest_5",
    restaurantName: "Basantapur Sweet & Selroti Pasal"
  }
];

export default function Home({
  onSelectRestaurant,
  favorites,
  onToggleFavorite,
  onAddToCartDirect,
  onCookAnimation,
  onARPreview,
  customerAddress,
  onChangeAddress,
  loyaltyPoints,
  onChangeLoyaltyPoints,
  onTrackOrder,
  cartItems
}: HomeProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"food" | "history">("food");
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [redeemSuccess, setRedeemSuccess] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Controlled address bar input state resolver
  const [localAddress, setLocalAddress] = useState(customerAddress);

  // Propagate outer customer address changes down
  useEffect(() => {
    setLocalAddress(customerAddress);
  }, [customerAddress]);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    setLocationError("");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Search high accuracy geolocation to define exact landmarks or coordinates
        let geoName = "Lakeside Ward 6, Pokhara";
        // Check standard ranges
        if (latitude > 27.65 && latitude < 27.75 && longitude > 85.28 && longitude < 85.35) {
          geoName = "Jhamsikhel, Lalitpur";
        } else if (latitude > 27.68 && latitude < 27.73 && longitude > 85.30 && longitude < 85.34) {
          geoName = "Kathmandu Durbar Square";
        }
        
        const fullString = `${geoName}, Nepal (GPS: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E)`;
        setLocalAddress(fullString);
        onChangeAddress(fullString);
        setDetectingLocation(false);
      },
      (error) => {
        console.warn("Geolocation precise reading error:", error);
        // Fallback elegantly to highly realistic local Pokhara standard coordinates
        const simulatedPositions = [
          "Lakeside Road, Ward 6, Pokhara (GPS: 28.2096°N, 83.9584°E)",
          "Jhamsikhel Circle, Lalitpur (GPS: 27.6775°N, 85.3168°E)",
          "Kupondole Height, Lalitpur (GPS: 27.6891°N, 85.3195°E)",
          "Boudha Stupa Outer Ring, Kathmandu (GPS: 27.7215°N, 85.3620°E)"
        ];
        const randomCoord = simulatedPositions[Math.floor(Math.random() * simulatedPositions.length)];
        setLocalAddress(randomCoord);
        onChangeAddress(randomCoord);
        
        setLocationError(`Precise GPS simulation loaded (Status: ${error.message || "Permission restricted"})`);
        setDetectingLocation(false);
        setTimeout(() => setLocationError(""), 5000);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  const fetchOrderHistory = () => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrderHistory([...data].reverse());
        }
      })
      .catch((err) => console.error(err));
  };

  const handleRedeemLoyaltyItem = (loyaltyItem: typeof LOYALTY_EXCHANGE_ITEMS[number]) => {
    // Prevent multiple redeemed items in the active cart/order
    const existingLoyaltyItem = cartItems?.find(it => it.menuItem.id.startsWith("loyalty_"));
    if (existingLoyaltyItem) {
      setRedeemSuccess("");
      setRedeemError(`You can only redeem one item with points per order. Your cart already contains "${existingLoyaltyItem.menuItem.name.replace("🎁 Points ", "")}". Please complete your current order first!`);
      setTimeout(() => setRedeemError(""), 5500);
      return;
    }

    if (loyaltyPoints < loyaltyItem.pointsRequired) {
      setRedeemSuccess("");
      setRedeemError(`Insufficient loyalty points! "${loyaltyItem.name.replace("🎁 Points ", "")}" requires ${loyaltyItem.pointsRequired} pts but you only have ${loyaltyPoints} pts.`);
      setTimeout(() => setRedeemError(""), 5500);
      return;
    }
    
    onChangeLoyaltyPoints((prev) => prev - loyaltyItem.pointsRequired);
    
    const convertedItem: MenuItem = {
      id: loyaltyItem.id,
      name: loyaltyItem.name,
      price: 0,
      description: loyaltyItem.description,
      category: loyaltyItem.category,
      image: loyaltyItem.image,
      spiceLevel: loyaltyItem.spiceLevel as any,
      isVeg: loyaltyItem.isVeg,
      ingredients: []
    };
    onAddToCartDirect(convertedItem, "points_exchange", "FoodiePoints Rewards Hub");
    setRedeemError("");
    setRedeemSuccess(`Successfully redeemed "${loyaltyItem.name.replace("🎁 Points ", "")}"! Added directly to your Cart at Rs. 0.`);
    setTimeout(() => setRedeemSuccess(""), 4500);
  };

  // Listen to local fallback events for live status syncs
  useEffect(() => {
    const handleSync = () => {
      fetchOrderHistory();
    };
    window.addEventListener("order_status_sync", handleSync);
    return () => window.removeEventListener("order_status_sync", handleSync);
  }, []);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurants(data))
      .catch((err) => console.error(err));

    fetchOrderHistory();
    const interval = setInterval(fetchOrderHistory, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const categories = [
    { name: "Momo", icon: "🥟" },
    { name: "Newari", icon: "🥩" },
    { name: "Thakali", icon: "🥣" },
    { name: "Chowmein", icon: "🍝" },
    { name: "Street Food", icon: "🌶️" },
    { name: "Traditional", icon: "🫓" },
    { name: "Bakery", icon: "🍪" }
  ];

  // Filter restaurants based on query
  const filteredRestaurants = restaurants.filter((rest) => {
    const matchesSearch =
      rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.cuisineTypes.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rest.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory
      ? rest.cuisineTypes.includes(selectedCategory)
      : true;

    const matchesRating = rest.rating >= minRating;

    return matchesSearch && matchesCategory && matchesRating;
  });

  // Extract sasto budget dishes under Rs. 150
  const sampleSastoItems = [
    {
      restaurantId: "rest_1",
      restaurantName: "Momo House & Newari Delicacy",
      item: {
        id: "item_101",
        name: "Steam Buff Momo",
        price: 130,
        description: "Nepali style dumplings stuffed with spiced minced buffalo meat.",
        category: "Momo",
        image: "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=400",
        spiceLevel: "Medium" as const,
        isVeg: false,
        ingredients: []
      }
    },
    {
      restaurantId: "rest_4",
      restaurantName: "Dal-Bhat Kamalpokhari Express",
      item: {
        id: "item_401",
        name: "Classic Veg Dal Bhat Thali",
        price: 130,
        description: "Delightful Nepali Dal Bhat. Daily hand-milled rice, yellow lenses, seasonal curry.",
        category: "Nepali",
        image: "https://images.unsplash.com/photo-1615557960916-5f4791edd69a?auto=format&fit=crop&q=80&w=400",
        spiceLevel: "Mild" as const,
        isVeg: true,
        ingredients: []
      }
    },
    {
      restaurantId: "rest_5",
      restaurantName: "Basantapur Sweet & Selroti Pasal",
      item: {
        id: "item_502",
        name: "Piped Sel Roti with Alu Achar",
        price: 90,
        description: "Traditional ring-shaped crispy sweet rice bread, deep-fried in ghee.",
        category: "Traditional",
        image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400", // Corrected Sel Roti Bread!
        spiceLevel: "Medium" as const,
        isVeg: true,
        ingredients: []
      }
    },
    {
      restaurantId: "rest_6",
      restaurantName: "Lalitpur Chowmein",
      item: {
        id: "item_601",
        name: "Classic Buff Chowmein",
        price: 110,
        description: "Nepali wok-fired wheat noodles tossed with sautéed buffalo meat and dark soy.",
        category: "Chowmein",
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400",
        spiceLevel: "Medium" as const,
        isVeg: false,
        ingredients: []
      }
    }
  ];

  // Varieties filtering based on chosen category icon list
  const selectedVarieties = selectedCategory
    ? ALL_MENU_ITEMS.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase())
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      
      {/* Animated Hero Header */}
      <HeroBanner
        onSearch={handleSearch}
        onFilterToggle={() => setShowFilters(!showFilters)}
        activeFilterCount={(minRating > 0 ? 1 : 0)}
        menuItems={ALL_MENU_ITEMS}
      />

      {/* Filter Options Side Panel HUD */}
      {showFilters && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md mb-6 flex flex-wrap items-center justify-between gap-4 animate-fadeIn text-left">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-bold text-gray-700">Minimum Partner Rating:</span>
            <div className="flex items-center gap-1.5">
              {[0, 4.0, 4.5, 4.8].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(stars)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${minRating === stars ? "bg-[#2D6A4F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {stars === 0 ? "All" : `${stars} ★ +`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setMinRating(0);
              setSearchQuery("");
              setSelectedCategory(null);
            }}
            className="text-xs font-bold text-[#8B1A1A] hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Current Delivery Location GPS HUD Picker */}
      <div className="bg-[#121620] text-white p-4 sm:p-5 rounded-3xl border border-gray-800 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="p-3 bg-[#FF6B35]/15 rounded-2xl border border-[#FF6B35]/20 flex-shrink-0 animate-pulse">
            <MapPin className="w-5 h-5 text-[#FF6B35]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-orange-400 font-extrabold block">GPS Active Destination</span>
            <p className="text-xs text-gray-300 font-black truncate mt-0.5" title={customerAddress}>{customerAddress}</p>
            {locationError && (
              <span className="text-[10px] text-orange-300 block font-semibold mt-1 animate-pulse">
                ℹ️ {locationError}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="px-3.5 py-2.5 bg-[#2D6A4F] hover:bg-[#1a3d2e] disabled:bg-gray-700 text-white text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md"
            title="Locate exactly on high fidelity map"
          >
            <span>{detectingLocation ? "⏳ Detecting GPS..." : "🎯 Detect Exact Location"}</span>
          </button>
          <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
            <input
              type="text"
              placeholder="Search Pokhara address..."
              value={localAddress}
              onChange={(e) => setLocalAddress(e.target.value)}
              id="gps-address-input-spot"
              className="bg-gray-950 border border-gray-800 focus:border-[#FF6B35] px-4 py-2.5 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none w-full md:w-64 font-medium"
            />
            <button
              onClick={() => {
                if (localAddress.trim()) {
                  onChangeAddress(localAddress.trim());
                }
              }}
              className="px-4 py-2.5 bg-[#FF6B35] hover:bg-orange-600 text-white text-xs font-bold rounded-2xl transition-all whitespace-nowrap active:scale-95 cursor-pointer shadow-sm"
            >
              Update Map
            </button>
          </div>
        </div>
      </div>

      {/* UNIFIED FOOD FEED & REAL-TIME DISPATCH LOGS LAYOUT */}
      <div className="space-y-12">
        <div className="space-y-12">
          {/* POINTS EXCHANGES MINI BANNER HUD */}
          <div className="bg-[#121620] p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden text-left text-white mb-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-[#FF6B35] font-black text-[10px] uppercase tracking-widest bg-[#FF6B35]/10 px-3 py-1 rounded-full border border-[#FF6B35]/20 w-max">
                  💸 Loyalty Reward Hub
                </div>
                <h3 className="text-2xl font-serif italic text-white mt-2 font-bold flex items-center gap-2">
                  <span>🎁 Points Food Exchange Bazaar</span>
                </h3>
                <p className="text-xs text-gray-400 max-w-xl leading-relaxed mt-0.5">
                  Redeem accumulated foodie loyalty points here instantly for zero-price gourmet delicacies! Points are credited automatically on checkout: placing an order of more than <b>Rs. 500</b> secures <b>50 pts</b> (worth Rs. 5), placing an order of more than <b>Rs. 1000</b> secures <b>100 pts</b> (worth Rs. 10), and so on (50 PTS = Rs. 5, 1 PTS = Rs. 0.1 ratio)!
                </p>
              </div>

              <div className="bg-gradient-to-r from-orange-500/20 to-[#8B1A1A]/30 px-5 py-3 rounded-2xl border border-orange-500/30 flex items-center gap-3.5 shadow-lg animate-fadeIn">
                <span className="text-2xl animate-spin-slow">🌟</span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFF8F0]/65 block font-bold">Your Available Points</span>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-amber-300 font-mono">{loyaltyPoints} pts</span>
                    <span className="text-[10px] text-orange-200/90 font-mono font-bold mt-0.5">≈ Rs. {(loyaltyPoints * 0.1).toFixed(2)} Value</span>
                  </div>
                </div>
              </div>
            </div>

            {redeemError && (
              <div className="bg-rose-950/40 text-rose-400 border border-rose-500/30 px-4 py-3 rounded-2xl text-xs font-bold font-mono tracking-wide mb-4 animate-shake flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                <span>{redeemError}</span>
              </div>
            )}

            {redeemSuccess && (
              <div className="bg-[#2D6A4F]/20 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-2xl text-xs font-bold font-mono tracking-wide mb-4 animate-fadeIn flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span>{redeemSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {LOYALTY_EXCHANGE_ITEMS.map((item) => {
                const countNeeded = item.pointsRequired;
                const hasEnough = loyaltyPoints >= countNeeded;
                return (
                  <div key={item.id} className="bg-gray-950/60 rounded-2xl border border-gray-800 p-3.5 flex flex-col justify-between hover:border-[#FF6B35]/30 transition-all">
                    <div className="relative rounded-xl overflow-hidden mb-3 aspect-video">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full filter brightness-90 hover:scale-101 transition-all" referrerPolicy="no-referrer" />
                      <span className="absolute bottom-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-950 font-black text-[10px] px-2.5 py-1 rounded-lg leading-none shadow-md">
                        Cost: {countNeeded} pts
                      </span>
                    </div>

                    <div className="text-left">
                      <h4 className="font-extrabold text-[#FFF8F0] text-xs leading-tight">{item.name.replace("🎁 Points ", "")}</h4>
                      <p className="text-[10px] text-gray-400 leading-snug font-medium mt-1 pr-1">{item.description}</p>
                    </div>

                    <button
                      disabled={!hasEnough}
                      onClick={() => handleRedeemLoyaltyItem(item)}
                      className={`mt-4 py-2 px-3 text-xs font-bold text-center rounded-xl transition-all ${
                        hasEnough
                          ? "bg-gradient-to-r from-[#FF6B35] to-orange-600 hover:from-emerald-600 hover:to-emerald-700 text-white cursor-pointer shadow-md"
                          : "bg-gray-800 text-gray-500 border border-gray-700/60 cursor-not-allowed"
                      }`}
                    >
                      {hasEnough ? "🎁 Redeem for Free!" : `Locked (Need ${countNeeded} pts)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cuisines categories horizontally sliding */}
          <div>
            <h2 className="text-xl font-serif italic font-bold text-[#8B1A1A] text-left mb-4">Explore Local Nepali Cuisines</h2>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-xs cursor-pointer ${selectedCategory === null ? "bg-[#8B1A1A] text-white border border-[#8B1A1A]" : "bg-white text-gray-750 hover:bg-gray-55 border border-[#8B1A1A]/10"}`}
              >
                🍴 All Foods
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-xs cursor-pointer ${selectedCategory === cat.name ? "bg-[#FF6B35] text-white border border-[#FF6B35]" : "bg-white text-gray-750 hover:bg-gray-55 border border-[#8B1A1A]/10"}`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC CATEGORY DISH VARIETIES EXPLORER (The core Momo variety / Bakery variety / Newari variety grid) */}
          {selectedCategory && (
            <div className="bg-[#FFF8F0] p-6 rounded-3xl border-2 border-dashed border-[#FF6B35]/25 text-left animate-fadeIn">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg font-serif italic text-[#8B1A1A] font-bold">
                    Select Delicious {selectedCategory} Varieties
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Order directly from different neighborhood kitchens making authentic {selectedCategory} meals.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-[#FF6B35] hover:underline font-bold"
                >
                  Clear Selection
                </button>
              </div>

              {selectedVarieties.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-6 text-center">
                  No registered {selectedCategory} varieties active right now. Please explore other cuisines.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {selectedVarieties.map((dish) => (
                    <div key={dish.id} className="bg-white rounded-2xl border border-gray-150 p-3.5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                      <div>
                        {/* Correct Image with Unsplash referPolicy */}
                        <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-gray-50">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="object-cover w-full h-full filter brightness-95"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2 right-2 bg-gradient-to-r from-[#8B1A1A] to-red-800 text-white font-mono text-xs font-black px-2.5 py-1 rounded-lg">
                            Rs. {dish.price}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-[#8B1A1A] text-sm leading-snug">{dish.name}</h4>
                        <span className="text-[10px] text-[#2D6A4F] font-bold block mt-0.5">🏪 {dish.restaurantName}</span>
                        <p className="text-[10px] text-gray-500 leading-normal mt-1.5 font-medium">{dish.description}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 mt-4">
                        <button
                          onClick={() => onCookAnimation(dish as any)}
                          className="py-1.5 bg-orange-50 hover:bg-orange-100 text-[10px] text-[#FF6B35] font-extrabold rounded-lg transition-all cursor-pointer text-center"
                        >
                          Cook
                        </button>
                        <button
                          onClick={() => onARPreview(dish as any)}
                          className="py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[10px] text-emerald-800 font-extrabold rounded-lg transition-all cursor-pointer text-center"
                        >
                          AR Live
                        </button>
                        <button
                          onClick={() => onAddToCartDirect(dish as any, dish.restaurantId, dish.restaurantName)}
                          className="py-1.5 bg-[#FF6B35] hover:bg-[#8B1A1A] text-white text-[10px] text-center font-extrabold rounded-lg transition-all cursor-pointer pr-1"
                        >
                          + Choose
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SABSE SASTO: BUDGET SECTION FOR FAMILIES! (Under Rs 150) */}
          <div className="bg-gradient-to-r from-[#FFF8F0] to-[#FFE8D6] p-6 rounded-3xl border border-[#8B1A1A]/10 mb-12 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
              <div>
                <div className="flex items-center gap-2 text-[#FF6B35] font-black text-xs uppercase tracking-wider bg-white px-2.5 py-1 rounded-full w-max border border-orange-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  Nepalese Local Delicacies
                </div>
                <h2 className="text-2xl font-serif italic text-[#8B1A1A] mt-1 font-bold">Popular Dishes (Under Rs. 150)</h2>
                <p className="text-xs text-gray-550 font-medium font-serif italic">Delicious traditional dishes sourced from partner neighborhood kitchens.</p>
              </div>
              <span className="text-[10px] font-extrabold text-[#2D6A4F] font-mono tracking-widest uppercase bg-white px-3 py-1.5 rounded-xl border border-[#8B1A1A]/5">
                ★ Best Sellers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sampleSastoItems.map((sasto) => (
                <div key={sasto.item.id} className="bg-white rounded-2xl border border-gray-105 shadow-sm p-3.5 hover:shadow-md transition-all flex flex-col justify-between text-left">
                  <div className="relative rounded-xl overflow-hidden mb-2.5 aspect-video bg-gray-50">
                    <img src={sasto.item.image} alt={sasto.item.name} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1 right-1 bg-[#2D6A4F] text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded leading-none">
                      Rs. {sasto.item.price}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-900 truncate leading-tight">{sasto.item.name}</h4>
                    <span className="text-[9px] text-gray-400 font-bold block truncate mt-0.5">{sasto.restaurantName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    <button
                      onClick={() => onCookAnimation(sasto.item as any)}
                      className="py-1 px-1 bg-gray-50 hover:bg-orange-50 text-[10px] text-center font-bold text-[#FF6B35] rounded-lg border border-gray-100 cursor-pointer"
                    >
                      Cook
                    </button>
                    <button
                      onClick={() => onAddToCartDirect(sasto.item as any, sasto.restaurantId, sasto.restaurantName)}
                      className="py-1 px-1 bg-[#FF6B35] hover:bg-[#2D6A4F] text-white text-[10px] text-center font-bold rounded-lg cursor-pointer animate-fadeIn"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN FEATURED RESTAURANTS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-6 text-left">
              <div>
                <h2 className="text-2xl font-serif italic text-[#8B1A1A] font-bold">Featured Local Restaurants</h2>
                <p className="text-xs text-gray-550 font-medium font-sans">Fresh warm dishes directly from Kathmandu and Pokhara standard kitchens</p>
              </div>
              <span className="text-xs text-[#FF6B35] font-extrabold hidden sm:inline">Showing {filteredRestaurants.length} places</span>
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700">No partner kitchens detected close to your query</h3>
                <p className="text-xs text-gray-400 mt-1">Try resetting the star ratings filter or look up local search coordinates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredRestaurants.map((rest) => (
                  <div
                    key={rest.id}
                    onClick={() => onSelectRestaurant(rest.id)}
                    className="editorial-card group text-left cursor-pointer flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Banner Wrapper */}
                      <div className="relative h-44 bg-gray-100">
                        <img src={rest.banner} alt={rest.name} className="object-cover w-full h-full group-hover:scale-101 transition-all" referrerPolicy="no-referrer" />
                        
                        {/* Favorite Heart toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(rest.id);
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-rose-500 hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-md border border-[#8B1A1A]/10 cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(rest.id) ? "fill-current" : ""}`} />
                        </button>

                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-md border border-[#8B1A1A]/10 text-[9px] font-extrabold font-mono text-[#8B1A1A] uppercase tracking-wider">
                          ⏱️ {rest.deliveryTimeCode}
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className="font-bold text-gray-900 group-hover:text-[#FF6B35] transition-colors text-base truncate flex-1 leading-tight">
                            {rest.name}
                          </h3>
                          <span className="bg-[#2D6A4F]/10 text-[#2D6A4F] font-black text-xs px-2 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-[#2D6A4F]" />
                            {rest.rating.toFixed(1)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-550 font-medium mb-3 truncate font-sans">{rest.address}</p>

                        {/* Cuisine chips */}
                        <div className="flex flex-wrap items-center gap-1 mb-4">
                          {rest.cuisineTypes.map((c) => (
                            <span key={c} className="bg-[#FFF8F0] border border-[#8B1A1A]/5 text-[#8B1A1A]/85 text-[9px] font-bold px-2.5 py-1 rounded-md">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Delivery metadata footer line */}
                    <div className="border-t border-[#8B1A1A]/10 px-5 py-3.5 bg-[#FFF8F0]/30 flex items-center justify-between text-xs text-gray-700 font-semibold font-sans">
                      <div className="flex items-center gap-1.5">
                        <Bike className="w-4 h-4 text-[#FF6B35]" />
                        <span>Delivery Rs. {rest.deliveryFee}</span>
                      </div>
                      <span className="text-[#8B1A1A] font-extrabold">Min. order Rs. {rest.minOrder}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REVOLUTIONARY HIGH-CRAFT ANIMATED TERMINAL ORDER DISPATCH HISTORY LOGS */}
      <div className="mt-16 pt-12 border-t-2 border-dashed border-[#8B1A1A]/10 text-left">
        <div className="bg-[#121620] rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl mr-4" />
          <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#FF6B35]/5 rounded-full blur-2xl" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 w-max font-mono mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Nepali Dispatch Logistics Radar</span>
              </div>
              <h2 className="text-2xl font-serif italic text-white font-black">
                Order Dispatch History Logs
              </h2>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Monitor real-time dispatch milestones, rider locations, and historic culinary transactions
              </p>
            </div>

            <div className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>TERMINAL STATUS: ACTIVE LOGS</span>
            </div>
          </div>

          {orderHistory.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 md:py-16">
              <span className="text-4xl animate-bounce inline-block">🚴</span>
              <h3 className="font-extrabold text-white mt-3 text-sm">No dispatch consignments registered</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Once you select items from any kitchen and place an order at checkout, your live delivery milestone path will draw here.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div 
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                {orderHistory.map((order, orderIdx) => {
                  const isActive = order.status !== "delivered" && order.status !== "cancelled";
                  
                  // Extract milestones based on status to draw the animated tracking path
                  const milestoneSteps = [
                    { label: "Placed", done: true, icon: "🧾" },
                    { label: "Kitchen Prepping", done: order.status === "cooking" || order.status === "dispatched" || order.status === "arriving" || order.status === "delivered", icon: "🔥" },
                    { label: "Rider Dispatched", done: order.status === "dispatched" || order.status === "arriving" || order.status === "delivered", icon: "🚴" },
                    { label: "Delivered", done: order.status === "delivered", icon: "🎁" }
                  ];

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -4, borderColor: "rgba(255,107,53,0.3)" }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: orderIdx * 0.1 }}
                      className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group transition-all"
                    >
                      {/* Status indicator glow ring */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${isActive ? "bg-emerald-500" : "bg-gray-700"}`} />

                      <div>
                        {/* Header metadata row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-extrabold pr-20 bg-emerald-400/10 px-2 py-0.5 rounded">
                              ID: #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <h4 className="font-serif italic font-extrabold text-lg text-white mt-1 pr-16 group-hover:text-[#FF6B35] transition-colors">
                              {order.restaurantName}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                              Placed: {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-500"}`} />
                            <span className={`text-[9px] uppercase font-mono tracking-wider font-extrabold px-2.5 py-1 rounded-full ${
                              order.status === "delivered" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              order.status === "cancelled" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                              "bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/25"
                            }`}>
                              {order.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        {/* Animated Consignment Logistics Timeline */}
                        {order.status !== "cancelled" && (
                          <div className="my-5 bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-[10px] uppercase font-bold text-gray-300 tracking-wider font-mono mb-3.5 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-yellow-400" />
                              <span>Live Consignment Milestones</span>
                            </p>
                            
                            <div className="relative flex justify-between items-center">
                              {/* Horizontal Gray connector track */}
                              <div className="absolute left-4 right-4 top-4 h-0.5 bg-white/10 z-0" />
                              
                              {/* Glowing Active colored connector track */}
                              <div 
                                className="absolute left-4 top-4 h-0.5 bg-gradient-to-r from-emerald-500 via-[#FF6B35] to-[#FF6B35]/80 z-0 transition-all duration-1000"
                                style={{
                                  width: `${
                                    order.status === "delivered" ? "100%" :
                                    order.status === "dispatched" || order.status === "arriving" ? "66%" :
                                    order.status === "cooking" ? "33%" : "0%"
                                  }`
                                }}
                              />

                              {milestoneSteps.map((step, sIdx) => (
                                <div key={sIdx} className="flex flex-col items-center relative z-10 font-sans">
                                  <div 
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                      step.done 
                                        ? "bg-gradient-to-br from-emerald-400 to-[#FF6B35] text-white shadow-md shadow-orange-500/20 scale-110" 
                                        : "bg-gray-800 text-gray-500 border border-white/10"
                                    }`}
                                  >
                                    <span className="text-xs">{step.icon}</span>
                                  </div>
                                  <span className={`text-[8px] font-sans font-bold mt-1.5 uppercase ${
                                    step.done ? "text-white" : "text-gray-550"
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cart items list box inside the invoice container */}
                        <div className="border-t border-b border-white/10 py-3.5 my-4 space-y-2 font-sans bg-black/10 px-3 rounded-xl border border-white/5">
                          <p className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-1 leading-none">ORDER SUMMARY</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-gray-200">
                              <span className="truncate flex-1 max-w-[280px]">
                                {item.menuItem.name} 
                                <span className="text-gray-400 text-[10px] font-mono ml-1">x{item.quantity}</span>
                              </span>
                              <span className="font-mono text-[11px] font-bold text-gray-300">Rs. {item.menuItem.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Dropoff Address indicator */}
                        <p className="text-[10px] text-gray-400 italic truncate font-sans flex items-center gap-1.5 mt-2.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          <span>Delivery Area: {order.address}</span>
                        </p>
                      </div>

                      {/* Footer pricing and control actions row */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                        <div>
                          <p className="text-[9px] text-gray-400 font-extrabold uppercase leading-none font-mono tracking-wider">Total Value Paid</p>
                          <p className="text-base font-black text-white mt-1 font-mono">
                            Rs. {order.total || order.totalAmount || 180}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {isActive && (
                            <button
                              onClick={() => onTrackOrder(order)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                            >
                              🚴 Track Live Rider
                            </button>
                          )}
                          {!isActive && (
                            <button
                              onClick={() => {
                                order.items.forEach((it) => {
                                  onAddToCartDirect(it.menuItem, order.restaurantId, order.restaurantName);
                                });
                              }}
                              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-[#FF6B35] font-extrabold text-[11px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                            >
                              🔄 Reorder All
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
