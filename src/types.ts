// Type declarations for FoodieNepal Application

export type UserRole = "customer" | "vendor" | "rider" | "admin";

export interface User {
  id: string;
  name: string;
  username?: string;
  password?: string;
  phone: string;
  email: string;
  role: UserRole;
  address?: string;
  avatar?: string;
  bio?: string;
  foodiePoints: number;
  dob?: string;
  favoritePet?: string;
}

export interface Ingredient {
  name: string;
  icon: string;
  xOffset: number; // For flying starting positions
  yOffset: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  spiceLevel: "Mild" | "Medium" | "Spicy" | "Himalayan Fire";
  isVeg: boolean;
  isPopular?: boolean;
  ingredients: Ingredient[];
  model3DUrl?: string; // Standard GLB mapping
}

export interface Restaurant {
  id: string;
  name: string;
  logo: string;
  banner: string;
  rating: number;
  reviewsCount: number;
  deliveryTimeCode: string; // e.g. "25-35 min"
  deliveryFee: number;
  minOrder: number;
  address: string;
  lat: number;
  lng: number;
  openStatus: "Open" | "Closed";
  operatingHours: string;
  isFavorite?: boolean;
  cuisineTypes: string[];
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
  selectedSpice?: string;
  specialNotes?: string;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  total: number;
  address: string;
  paymentMethod: "cod" | "esewa" | "khalti" | "imepay";
  status: OrderStatus;
  createdAt: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderLat?: number;
  riderLng?: number;
  deliveryOtp?: string;
  feedbackSubmitted?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot" | "support" | "rider";
  text: string;
  timestamp: string;
  groundingLinks?: { title: string; uri: string }[];
}

export interface Review {
  id: string;
  restaurantId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  photo?: string;
  date: string;
  helpfulVotes: number;
  restaurantReply?: string;
}

export interface RiderEarnings {
  today: number;
  weeklySum: number;
  deliveriesCount: number;
  tips: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  countLeft: number;
  isVeg: boolean;
}
