import express from "express";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Restaurant, MenuItem, Order, ChatMessage, Review, User, GroceryItem } from "./src/types";

// Initialize Firebase SDK on Server-Side to sync database collections
// Initialize Firebase Admin SDK on Server-Side to bypass security rules and sync database collections
import { initializeApp as initAdminApp } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

const firebaseApp = initAdminApp({
  projectId: firebaseConfig.projectId,
});
const db = getAdminFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

let isFirestoreWriteEnabled = false;

async function checkFirestoreAdminConnection() {
  try {
    // Attempt to test access to a system verification check document
    await db.collection("system_checks").doc("admin_connection_test").set({
      testedAt: new Date().toISOString(),
      status: "verified"
    });
    isFirestoreWriteEnabled = true;
    console.log("[Firestore] Admin Sync Connection Verified and Enabled.");
  } catch (err: any) {
    isFirestoreWriteEnabled = false;
    console.log("[Firestore] Admin Sync Disabled: Lacks valid cross-project GCP service account credentials or permissions. Running cleanly in memory.");
  }
}

checkFirestoreAdminConnection();

async function syncUserToFirestore(user: User) {
  if (!isFirestoreWriteEnabled) return;
  try {
    await db.collection("users").doc(user.id).set({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      address: user.address || "",
      avatar: user.avatar || "",
      bio: user.bio || "",
      foodiePoints: user.foodiePoints || 0
    });
    console.log(`[Firestore] Sync Success for User profile: ${user.id}`);
  } catch (err) {
    console.warn("[Firestore] Sync Warning: Profile indexing skipped or offline.", err);
  }
}

async function syncOrderToFirestore(order: Order) {
  if (!isFirestoreWriteEnabled) return;
  try {
    const orderUserId = currentUser ? currentUser.id : "usr_guest";
    await db.collection("orders").doc(order.id).set({
      id: order.id,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      subtotal: Math.round(order.subtotal || 0),
      deliveryFee: Math.round(order.deliveryFee || 0),
      platformFee: Math.round(order.platformFee || 0),
      tax: Math.round(order.tax || 0),
      total: Math.round(order.total || 0),
      address: order.address || "",
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt,
      userId: orderUserId,
      riderId: order.riderId || "",
      riderName: order.riderName || "",
      riderPhone: order.riderPhone || "",
      riderLat: order.riderLat || 0,
      riderLng: order.riderLng || 0,
      deliveryOtp: order.deliveryOtp || "",
      feedbackSubmitted: order.feedbackSubmitted || false
    });
    console.log(`[Firestore] Sync Success for order: ${order.id}`);
  } catch (err) {
    console.warn(`[Firestore] Sync Warning: Order indexing skipped for ${order.id}.`, err);
  }
}

async function syncReviewToFirestore(restaurantId: string, review: Review) {
  if (!isFirestoreWriteEnabled) return;
  try {
    const reviewUserId = currentUser ? currentUser.id : "usr_guest";
    await db.collection("reviews").doc(review.id).set({
      id: review.id,
      restaurantId: restaurantId,
      userName: review.userName,
      userAvatar: review.userAvatar || "",
      rating: Math.round(review.rating),
      comment: review.comment,
      userId: reviewUserId,
      helpfulVotes: Math.round(review.helpfulVotes || 0),
      restaurantReply: review.restaurantReply || "",
      date: review.date
    });
    console.log(`[Firestore] Sync Success for review: ${review.id}`);
  } catch (err) {
    console.warn(`[Firestore] Sync Warning: Review indexing skipped for ${review.id}.`, err);
  }
}

dotenv.config();

// Mapped Google User Verification Cache store
const pendingGoogleVerifications = new Map<string, { user: User; otp: string; timestamp: number }>();

// Lazy-initialized SMTP transporter
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

async function sendVerificationEmail(toEmail: string, otpCode: string, userName: string) {
  const transporter = getSmtpTransporter();
  const subject = "🔒 FoodieNepal - Google Account Verification Code";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid rgba(139, 26, 26, 0.1); border-radius: 16px; background-color: #FFF8F0; color: #333;">
      <h2 style="color: #8B1A1A; font-family: Georgia, serif; font-style: italic; border-bottom: 2px solid #FF6B35; padding-bottom: 10px; margin-top: 0;">FoodieNepal!</h2>
      <p style="font-size: 14px; line-height: 1.5;">Namaste <b>${userName}</b>,</p>
      <p style="font-size: 14px; line-height: 1.5;">Thank you for registering or signing in with your Google Account on FoodieNepal.</p>
      <div style="background-color: #fff; border: 1px dashed #FF6B35; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
        <span style="font-size: 12px; color: #666; font-family: monospace; display: block; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Gmail Security Verification Code</span>
        <span style="font-size: 32px; font-weight: bold; color: #8B1A1A; letter-spacing: 5px; font-family: monospace;">${otpCode}</span>
      </div>
      <p style="font-size: 12px; color: #666; line-height: 1.4;">This OTP code is valid for 10 minutes. If you did not initiate this authentication request, please ignore this email.</p>
      <div style="margin-top: 25px; pt-15px; border-top: 1px solid #dfdfdf; font-size: 10px; color: #999; text-align: center;">
        FoodieNepal! Multi-Route Secured Delivery Gateway System &copy; 2026
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"FoodieNepal Security" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html: htmlContent
      });
      console.log(`REAL OTP sent to ${toEmail} successfully.`);
      return true;
    } catch (err) {
      console.error("Failed to send real verification email via SMTP:", err);
      return false;
    }
  } else {
    console.log(`
============================================================
[SMTP NOT CONFIGURING FALLBACK]
No SMTP configs (SMTP_USER/SMTP_PASS) provided in Environment Secrets!
TO EMAIL: ${toEmail}
OTP CODE: ${otpCode}
============================================================
    `);
    return false;
  }
}

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google Gemini Client if api key is available
let ai: any = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini API Client:", err);
  }
} else {
  console.log("GEMINI_API_KEY not found in environment, running in intelligent local-fallback mode.");
}

// Global In-Memory Databases
let users: User[] = [
  {
    id: "usr_1",
    name: "Jenish Sapkota",
    phone: "+977 9845612345",
    email: "jenishsapkota272@gmail.com",
    role: "customer",
    address: "Ward 4, Basantapur, Kathmandu, Nepal",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    foodiePoints: 340
  }
];

let currentUser: User = users[0];

// Define static lists of Nepali standard ingredients for animations
const ingFlour = { name: "Maida Flour", icon: "🌾", xOffset: -120, yOffset: -80 };
const ingMeat = { name: "Minced Buff/Chicken", icon: "🥩", xOffset: 120, yOffset: -80 };
const ingGinger = { name: "Ginger-Garlic", icon: "🧄", xOffset: -150, yOffset: 120 };
const ingSpices = { name: "Himalayan Spices Mix", icon: "🌶️", xOffset: 150, yOffset: 120 };
const ingCoriander = { name: "Coriander Leaves", icon: "🌿", xOffset: 0, yOffset: -150 };
const ingOnion = { name: "Chop Onion", icon: "🧅", xOffset: -80, yOffset: -120 };
const ingButter = { name: "Pure Ghee/Butter", icon: "🧈", xOffset: 80, yOffset: -120 };
const ingRice = { name: "Beaten Rice (Baji)", icon: "🌾", xOffset: -100, yOffset: 100 };
const ingMustard = { name: "Mustard Oil", icon: "🛢️", xOffset: 100, yOffset: 100 };
const ingPotato = { name: "Aloo (Potato)", icon: "🥔", xOffset: -50, yOffset: 150 };
const ingDal = { name: "Black Lentil (Kalo Dal)", icon: "🥣", xOffset: 50, yOffset: 150 };
const ingSpinach = { name: "Rayoko Saag", icon: "🥬", xOffset: -150, yOffset: 0 };
const ingBamboo = { name: "Bamboo Shoot (Tama)", icon: "🎋", xOffset: 150, yOffset: 0 };

const sampleRestaurants: Restaurant[] = [
  {
    id: "rest_1",
    name: "Momo House & Newari Delicacy",
    logo: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=150",
    banner: "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=1000",
    rating: 4.8,
    reviewsCount: 148,
    deliveryTimeCode: "20-30 min",
    deliveryFee: 40,
    minOrder: 100,
    address: "Ward 3, Jhamsikhel, Pokhara, Nepal (Opposite British School)",
    lat: 28.2096,
    lng: 83.9856,
    openStatus: "Open",
    operatingHours: "10:30 AM - 10:00 PM",
    cuisineTypes: ["Momo", "Newari", "Street Food"],
    isFavorite: true
  },
  {
    id: "rest_2",
    name: "Basantapur Samay Baji Corner",
    logo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=150",
    banner: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000",
    rating: 4.6,
    reviewsCount: 92,
    deliveryTimeCode: "25-35 min",
    deliveryFee: 50,
    minOrder: 120,
    address: "Ward 12, Basantapur Durbar Square, Kathmandu",
    lat: 27.7042,
    lng: 85.3072,
    openStatus: "Open",
    operatingHours: "11:00 AM - 9:30 PM",
    cuisineTypes: ["Newari", "Traditional", "Street Food"]
  },
  {
    id: "rest_3",
    name: "Thakali Bhanchha Ghar",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=150",
    banner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000",
    rating: 4.9,
    reviewsCount: 215,
    deliveryTimeCode: "30-45 min",
    deliveryFee: 60,
    minOrder: 150,
    address: "Ward 2, Amrit Marg, Thamel, Kathmandu",
    lat: 27.7150,
    lng: 85.3117,
    openStatus: "Open",
    operatingHours: "11:00 AM - 11:30 PM",
    cuisineTypes: ["Thakali", "Nepali", "Traditional"]
  },
  {
    id: "rest_4",
    name: "Dal-Bhat Kamalpokhari Express",
    logo: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=150",
    banner: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=1000",
    rating: 4.5,
    reviewsCount: 180,
    deliveryTimeCode: "25-35 min",
    deliveryFee: 30,
    minOrder: 80,
    address: "Ward 1, Kamalpokhari Marg, Kathmandu",
    lat: 27.7088,
    lng: 85.3238,
    openStatus: "Open",
    operatingHours: "10:00 AM - 9:00 PM",
    cuisineTypes: ["Nepali", "Traditional"]
  },
  {
    id: "rest_5",
    name: "Basantapur Sweet & Selroti Pasal",
    logo: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=150",
    banner: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1000",
    rating: 4.4,
    reviewsCount: 76,
    deliveryTimeCode: "15-25 min",
    deliveryFee: 30,
    minOrder: 50,
    address: "Ward 4, Hanumandhoka, Kathmandu",
    lat: 27.7052,
    lng: 85.3059,
    openStatus: "Open",
    operatingHours: "7:00 AM - 8:30 PM",
    cuisineTypes: ["Street Food", "Bakery", "Traditional"]
  },
  {
    id: "rest_6",
    name: "Lalitpur Chowmein & Nepali Fast Food",
    logo: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=150",
    banner: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=1000",
    rating: 4.2,
    reviewsCount: 64,
    deliveryTimeCode: "20-30 min",
    deliveryFee: 40,
    minOrder: 70,
    address: "Ward 11, Pulchowk Height, Lalitpur",
    lat: 27.6775,
    lng: 85.3168,
    openStatus: "Open",
    operatingHours: "11:30 AM - 9:30 PM",
    cuisineTypes: ["Chowmein", "Momo", "Fast Food"]
  },
  {
    id: "rest_7",
    name: "Thamel Himalayan Tea & Tingmo",
    logo: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=150",
    banner: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=1000",
    rating: 4.7,
    reviewsCount: 110,
    deliveryTimeCode: "25-35 min",
    deliveryFee: 50,
    minOrder: 100,
    address: "Ward 8, Chaksibari Marg, Thamel, Kathmandu",
    lat: 27.7161,
    lng: 85.3106,
    openStatus: "Open",
    operatingHours: "8:00 AM - 10:00 PM",
    cuisineTypes: ["Street Food", "Traditional"]
  },
  {
    id: "rest_8",
    name: "Tripureshwor Sekuwa Corner",
    logo: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150",
    banner: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1000",
    rating: 4.6,
    reviewsCount: 132,
    deliveryTimeCode: "30-40 min",
    deliveryFee: 50,
    minOrder: 150,
    address: "Ward 11, Tripureshwor, Kathmandu (Near Stadium)",
    lat: 27.6961,
    lng: 85.3149,
    openStatus: "Open",
    operatingHours: "2:00 PM - 11:00 PM",
    cuisineTypes: ["Traditional", "Momo", "Street Food"]
  },
  {
    id: "rest_9",
    name: "Boudha Butter Tea House",
    logo: "https://images.unsplash.com/photo-1545696913-b39cd158b68a?auto=format&fit=crop&q=80&w=150",
    banner: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=1000",
    rating: 4.8,
    reviewsCount: 156,
    deliveryTimeCode: "35-50 min",
    deliveryFee: 65,
    minOrder: 100,
    address: "Ward 6, Boudha Stupa Gate, Kathmandu",
    lat: 27.7214,
    lng: 85.3620,
    openStatus: "Open",
    operatingHours: "6:00 AM - 8:00 PM",
    cuisineTypes: ["Traditional", "Street Food"]
  },
  {
    id: "rest_10",
    name: "Baneshwor Lassi & Chatpat Corner",
    logo: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=150",
    banner: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=1000",
    rating: 4.3,
    reviewsCount: 88,
    deliveryTimeCode: "15-25 min",
    deliveryFee: 35,
    minOrder: 60,
    address: "Ward 10, New Baneshwor Chowk, Kathmandu",
    lat: 27.6915,
    lng: 85.3422,
    openStatus: "Open",
    operatingHours: "10:00 AM - 9:00 PM",
    cuisineTypes: ["Street Food", "Fast Food"]
  }
];

const sampleMenuItems: Record<string, MenuItem[]> = {
  "rest_1": [
    {
      id: "item_101",
      name: "Buff Steamed MoMo (Juicy Dumplings with Spicy Sesame Dip)",
      price: 130,
      description: "Nepali style dumplings stuffed with spiced minced buffalo meat, steamed to perfection and served with rich tomato achar.",
      category: "Momo",
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Medium",
      isVeg: false,
      isPopular: true,
      ingredients: [ingFlour, ingMeat, ingGinger, ingSpices, ingOnion, ingCoriander]
    },
    {
      id: "item_102",
      name: "Buff Jhol MoMo (Dumplings Drowned in Tangy Sesame Soup)",
      price: 160,
      description: "Momo drowned in a cold/warm tangy sesame-based light soup flavored with hog plum (lapsi) and fresh spices.",
      category: "Momo",
      image: "https://plus.unsplash.com/premium_photo-1669742928014-ba36511677c7?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Spicy",
      isVeg: false,
      ingredients: [ingFlour, ingMeat, ingGinger, ingSpices, ingMustard, ingCoriander]
    },
    {
      id: "item_103",
      name: "Yak Cheese & Vegetable MoMo (Creamy Steamed Dumplings)",
      price: 140,
      description: "Dumplings stuffed with mixed fresh vegetables, paneer, and local yak cheese. Incredibly creamy.",
      category: "Momo",
      image: "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Mild",
      isVeg: true,
      isPopular: true,
      ingredients: [ingFlour, ingPotato, ingOnion, ingButter, ingSpices, ingCoriander]
    },
    {
      id: "item_104",
      name: "Buff Chili C-MoMo (Wok-Tossed Spicy Pan-Fried Dumplings)",
      price: 180,
      description: "Fried momo tossed in a hot and spicy, tangy capsicum, onion, and chili sauce dressing.",
      category: "Momo",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Himalayan Fire",
      isVeg: false,
      ingredients: [ingFlour, ingMeat, ingGinger, ingSpices, ingOnion, ingMustard]
    },
    {
      id: "item_105",
      name: "Buff Chhoila (Spiced Charcoal-Grilled Marinated Buffalo Meat Salad)",
      price: 220,
      description: "Spiced, grilled buffalo meat marinated in roasted mustard oil, fenugreek, green garlic, and toasted ginger.",
      category: "Newari",
      image: "https://images.unsplash.com/photo-1603360946369-fa9902792685?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Spicy",
      isVeg: false,
      ingredients: [ingMeat, ingMustard, ingGinger, ingSpices, ingOnion, ingCoriander]
    }
  ],
  "rest_2": [
    {
      id: "item_201",
      name: "Samay Baji Platter (Traditional Newari Multi-Dish Festive Feast Set)",
      price: 250,
      description: "An authentic Newari feast with beaten rice, spiced buffalo chhoila, roasted black soybeans, garlic-ginger potato salad, and black lentil baras.",
      category: "Newari",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Spicy",
      isVeg: false,
      isPopular: true,
      ingredients: [ingRice, ingMeat, ingMustard, ingPotato, ingDal, ingSpinach]
    },
    {
      id: "item_202",
      name: "Traditional Bara (Savory Lentil Pancake Topped with Meat & Egg)",
      price: 150,
      description: "Savory black lentil pancake fried on a cast iron pan, topped with a seasoned fried egg and spiced minced chicken.",
      category: "Newari",
      image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Mild",
      isVeg: false,
      ingredients: [ingDal, ingFlour, ingMeat, ingButter, ingSpices, ingOnion]
    },
    {
      id: "item_203",
      name: "Supreme Chatamari (Crispy Rice Crepe 'Nepali Pizza' with Chicken & Egg)",
      price: 180,
      description: "Thin, crispy rice crêpe loaded with seasoned chicken, onion, tomato, fresh coriander, and egg.",
      category: "Newari",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Medium",
      isVeg: false,
      isPopular: true,
      ingredients: [ingRice, ingMeat, ingOnion, ingSpices, ingPotato, ingCoriander]
    },
    {
      id: "item_204",
      name: "Alu Tama Bodi Soup (Classic Tangy Bamboo Shoot & Bean Curry)",
      price: 110,
      description: "Classic Newari sour curry soup made with fermented tender bamboo shoots, potatoes, and black-eyed beans.",
      category: "Newari",
      image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Medium",
      isVeg: true,
      ingredients: [ingPotato, ingBamboo, ingMustard, ingSpices, ingGinger]
    }
  ],
  "rest_3": [
    {
      id: "item_301",
      name: "Thakali Chicken Thali Set (Basmati Rice, Lentils, local Curry & Ghee Platter)",
      price: 320,
      description: "Traditional Himalayan combo of premium aromatic basmati rice, slow-cooked black mountain beans, organic local chicken curry, homemade ghee, wild leaf gundruk and fried crispy potato.",
      category: "Thakali",
      image: "https://images.unsplash.com/photo-1615557960916-5f4791edd69a?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Medium",
      isVeg: false,
      isPopular: true,
      ingredients: [ingRice, ingDal, ingMeat, ingButter, ingSpinach, ingSpices, ingMustard]
    },
    {
      id: "item_302",
      name: "Lete Buckwheat Dhido (Nutritional Himalayan Hot Grain Mash cooking Platter)",
      price: 290,
      description: "Himalayan nutritional powerhouse: freshly-churned buckwheat (Kodo) porridge eaten with hot ghee, local pickle, dry Radish shoot (Gundruk), and local vegetable stew.",
      category: "Nepali",
      image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Medium",
      isVeg: true,
      isPopular: true,
      ingredients: [ingRice, ingButter, ingDal, ingSpinach, ingSpices, ingBamboo]
    },
    {
      id: "item_303",
      name: "Buff Sukuti Sadeko (Spicy Crispy Charcoal Dry-Meat Jerky Salad)",
      price: 240,
      description: "Spicy, crispy air-fried dry buffalo beef strips tossed in red onion, tomato, fresh red chili, szechuan pepper (Timmur) and lime juice.",
      category: "Nepali",
      image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Himalayan Fire",
      isVeg: false,
      ingredients: [ingMeat, ingOnion, ingMustard, ingSpices, ingCoriander, ingGinger]
    }
  ],
  "rest_4": [
    {
      id: "item_401",
      name: "Classic Veg Dal Bhat Platter (Signature Nepali Household Rice & Lentils Set)",
      price: 130, // Great local choice
      description: "Simple household Nepali Dal Bhat. Daily hand-milled rice, cream yellow lentils, seasonal mixed curry, radish-cucumber pickle and papad.",
      category: "Nepali",
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Mild",
      isVeg: true,
      isPopular: true,
      ingredients: [ingRice, ingDal, ingPotato, ingOnion, ingSpices, ingMustard]
    },
    {
      id: "item_402",
      name: "Khasi Ko Masu Dal Bhat Set (Tender Himalayan Goat Mutton Curry Thali)",
      price: 360,
      description: "Premium thali with slow-simmered Nepali mountain goat (mutton) curry, cooked in a heavy brass pot with spices, ghee, basmati rice, lentils, and salad.",
      category: "Nepali",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Medium",
      isVeg: false,
      ingredients: [ingRice, ingDal, ingMeat, ingButter, ingSpinach, ingSpices]
    }
  ],
  "rest_5": [
    {
      id: "item_501",
      name: "Golden Sweet Jerry (Crispy Syrupy Cardamom Jalebi Spiral Fritters - 2 Pcs)",
      price: 60,
      description: "Deep-fried fermented rice flour spiral shapes, soaked in sugar cardamon syrup. Crunchy and syrupy.",
      category: "Street Food",
      image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Mild",
      isVeg: true,
      isPopular: true,
      ingredients: [ingFlour, ingButter, ingPotato]
    },
    {
      id: "item_502",
      name: "Traditional Ring Sel Roti (Crispy Rice Bread Served with Sesame Potato Salad)",
      price: 90,
      description: "A traditional ring-shaped crispy sweet rice bread, deep-fried in ghee, served with stone-ground sesame spiced potato salad (Alu ko Achar).",
      category: "Traditional",
      image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Medium",
      isVeg: true,
      isPopular: true,
      ingredients: [ingRice, ingPotato, ingMustard, ingSpices, ingButter]
    }
  ],
  "rest_6": [
    {
      id: "item_601",
      name: "Buff Chowmein (Delicious Spicy Nepali-Style Wok-Fired Buffalo Noodles)",
      price: 110, // Popular choice!
      description: "Nepali wok-fired yellow wheat noodles tossed with sautéed buffalo meat strips, cabbage, carrot, green onions, and dark soy.",
      category: "Chowmein",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Medium",
      isVeg: false,
      isPopular: true,
      ingredients: [ingFlour, ingMeat, ingOnion, ingMustard, ingSpices, ingGinger]
    },
    {
      id: "item_602",
      name: "Veg Chowmein Extra Spice (Street-Style Spicy Stir-Fried Vegetable Noodles)",
      price: 95, // Popular choice!
      description: "Street-style hot chowmein loaded with shredded fresh local vegetables, extra green chilies and direct spices.",
      category: "Chowmein",
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Spicy",
      isVeg: true,
      ingredients: [ingFlour, ingOnion, ingPotato, ingMustard, ingSpices, ingCoriander]
    }
  ],
  "rest_7": [
    {
      id: "item_701",
      name: "Tibet Butter Tea Su-Chiya Set (Warm Salted Tea Served with 2 Steamed Tingmo Flower Buns)",
      price: 130,
      description: "Authentic Tibetan tea brewed with brick tea leaves, local yak butter, salt, served alongside two soft cloud-like steamed flower buns.",
      category: "Traditional",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Mild",
      isVeg: true,
      ingredients: [ingFlour, ingButter, ingPotato]
    }
  ],
  "rest_8": [
    {
      id: "item_801",
      name: "Pork Sekuwa Platter (Dharane Charcoal-Grilled Spiced Meat Skewers with Beaten Rice)",
      price: 210,
      description: "Tender chunks of pork marinated in special Dharane-style mountain herbs, skewers-grilled over open natural charcoal, served with crispy baji.",
      category: "Traditional",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Spicy",
      isVeg: false,
      ingredients: [ingMeat, ingMustard, ingRice, ingSpices, ingOnion, ingCoriander]
    }
  ],
  "rest_9": [
    {
      id: "item_901",
      name: "Sweet Lapsi Yogurt Lassi (Creamy Shaken Curd Infused with Wild Plum Pulp)",
      price: 110,
      description: "Rich curd blended with wild sweet-sour Nepalese Hog Plum fruit pulp and toasted almonds.",
      category: "Street Food",
      image: "https://images.unsplash.com/photo-1571115177098-24ec42ed635d?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Mild",
      isVeg: true,
      ingredients: [ingButter, ingPotato, ingSpices]
    }
  ],
  "rest_10": [
    {
      id: "item_1001",
      name: "Spicy Basantapur Chatpate (Crunchy Puffed Rice Mixture Salad with Raw Lemon & Spices)",
      price: 50, // Best seller!
      description: "Crunchy puffed rice (Bhuja) mixed in raw green chilies, boiled potato, onion, dry noodles, toasted coriander seeds, mustard oil and tangy lemon.",
      category: "Street Food",
      image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400",
      spiceLevel: "Spicy",
      isVeg: true,
      isPopular: true,
      ingredients: [ingRice, ingOnion, ingMustard, ingPotato, ingSpices, ingCoriander]
    }
  ]
};

// Grocery Inventory for FoodieNepal Fresh
let freshStoreGrocery: GroceryItem[] = [
  { id: "groc_1", name: "Fresh Local Potatoes (Rato Aloo)", price: 65, unit: "1 kg", category: "Vegetables", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=150", countLeft: 140, isVeg: true },
  { id: "groc_2", name: "Sourdough Curd (Puspa Dhau / Dahi)", price: 120, unit: "500 ml", category: "Dairy", image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=150", countLeft: 45, isVeg: true },
  { id: "groc_3", name: "Pure Cow Ghee (Local Dudh)", price: 420, unit: "250g jar", category: "Spices", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=150", countLeft: 22, isVeg: true },
  { id: "groc_4", name: "Patan Beaten Rice (Taichin Chiura)", price: 90, unit: "1 kg", category: "Rice/Dal", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=150", countLeft: 85, isVeg: true },
  { id: "groc_5", name: "Red Cherry Onion", price: 75, unit: "1 kg", category: "Vegetables", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=150", countLeft: 12, isVeg: true }
];

// Sample Initial Orders
let activeOrders: Order[] = [
  {
    id: "ord_2004",
    restaurantId: "rest_1",
    restaurantName: "Momo House & Newari Delicacy",
    items: [
      {
        id: "cart_201",
        restaurantId: "rest_1",
        restaurantName: "Momo House",
        menuItem: sampleMenuItems["rest_1"][0],
        quantity: 2,
        selectedSpice: "Medium"
      }
    ],
    subtotal: 260,
    deliveryFee: 40,
    platformFee: 10,
    tax: 15,
    total: 325,
    address: "Ward 4, Basantapur, Kathmandu, Nepal",
    paymentMethod: "cod",
    status: "preparing",
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    riderId: "rider_1",
    riderName: "Niranjan Shrestha",
    riderPhone: "+977 9811223344",
    riderLat: 27.6801,
    riderLng: 85.3122,
    deliveryOtp: "4020"
  }
];

// In-Memory Saved Promos
let promoCodes = [
  { code: "FOODIE10", discountPercent: 10, description: "Get 10% off of any traditional dishes" },
  { code: "LOCALFOOD", discountValue: 50, description: "Flat Rs. 50 off your basantapur culinary selections" },
  { code: "SABSE50", discountValue: 30, description: "Flat Rs. 30 discount on orders above Rs. 150" }
];

// Sample Reviews
let sampleReviews: Record<string, Review[]> = {
  "rest_1": [
    { id: "rev_1", restaurantId: "rest_1", userName: "Aayush Nepal", rating: 5, comment: "The buffs momo is absolute heaven. Juicy with deep spice notes. Loved the hot roasted tomato sesame achar!", helpfulVotes: 14, date: "May 12, 2026", restaurantReply: "Dhanyabad Aayush ji! We roast our spices in-house daily." },
    { id: "rev_2", restaurantId: "rest_1", userName: "Sujata Lalitpur", rating: 4, comment: "Yak cheese momo is brilliant, though delivery took 10 minutes longer than expected. Food was steaming hot!", helpfulVotes: 5, date: "May 18, 2026" }
  ],
  "rest_2": [
    { id: "rev_3", restaurantId: "rest_2", userName: "Prabesh K.", rating: 5, comment: "Authentic Newari taste. Chhoila has the perfect smokey fenugreek char. Highly recommended!", helpfulVotes: 9, date: "May 15, 2026" }
  ]
};

// Rider State
let riderOffline = false;
let riderDashboardEarnings = { today: 640, weeklySum: 3820, deliveriesCount: 14, tips: 120 };

// Order Lifecycle Simulator interval (ticks every 10s to simulate delivery flow)
setInterval(() => {
  activeOrders.forEach(order => {
    if (order.status === "placed") {
      order.status = "confirmed";
    } else if (order.status === "confirmed") {
      order.status = "preparing";
    } else if (order.status === "preparing") {
      order.status = "ready";
    } else if (order.status === "ready") {
      order.status = "picked_up";
      order.riderId = "rider_1";
      order.riderName = "Niranjan Shrestha";
      order.riderPhone = "+977 9811223344";
      const isPk = (order.address || "").toLowerCase().includes("pokhara");
      order.riderLat = isPk ? 28.2096 : 27.6801;
      order.riderLng = isPk ? 83.9856 : 85.3122;
    } else if (order.status === "picked_up") {
      order.status = "on_the_way";
    } else if (order.status === "on_the_way") {
      // Simulate moving rider closer to customer's destination
      const isPk = (order.address || "").toLowerCase().includes("pokhara");
      const targetLat = isPk ? 28.2120 : 27.7022;
      const targetLng = isPk ? 83.9820 : 85.3190;
      if (order.riderLat && order.riderLng) {
        order.riderLat += (targetLat - order.riderLat) * 0.25;
        order.riderLng += (targetLng - order.riderLng) * 0.25;
      }
    }
  });
}, 15000);

// Helper function to query Gemini Model with Google Maps Grounding
async function askGeminiMaps(prompt: string, lat: number, lng: number) {
  if (!ai) {
    return {
      text: getLocalFallbackChatbotResponse(prompt),
      links: []
    };
  }

  try {
    const basePrompt = `You are "FoodieNepal AI Assistant", a super friendly local food expert chatbot, dedicated to guiding users through traditional cuisines (Momo, Thakali sets, Samay Baji, Sukuti, Sel Roti, Chowmein, etc.) in Kathmandu & Lalitpur, Nepal. Use Nepali-English mixed conversation (or warm Devanagari Devanagari if the user asks in Nepali). Today is ${new Date().toLocaleDateString()}.
      The user is physically located near: Latitude ${lat}, Longitude ${lng}. Keep recommendations highly geographical around this.
      Suggest items from Kathmandu Basantapur, Thamel, Lalitpur Jhamsikhel or Pulchowk. Recommend delicious local favorites (like standard dishes under Rs. 150), explain ingredients (e.g. beaten rice, buffalo buff meat, cumin seed gundruk), and help with order problems.
      Always respond in Markdown. If any places or restaurant spots are found, output the links found in the grounding metadata.
      Prompt: ${prompt}`;

    console.log("Sending prompt to Gemini with Maps grounding...", prompt);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: basePrompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      }
    });

    const responseText = response.text || "I'm looking into this for you right away!";
    
    // Extract Maps grounding links from response
    const links: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && Array.isArray(chunks)) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps?.uri) {
          links.push({
            title: chunk.maps.title || "Google Maps Location",
            uri: chunk.maps.uri
          });
        }
      });
    }

    return {
      text: responseText,
      links: links
    };

  } catch (err: any) {
    console.warn("Gemini API is unavailable or quota is exhausted. Falling back to robust local expert chatbot intelligence.");
    return {
      text: getLocalFallbackChatbotResponse(prompt) + "\n\n*(Note: Running in high-reliability Nepali local engine)*",
      links: [
        { title: "Momo House Jhamsikhel Map", uri: "https://maps.google.com/?q=Jhamsikhel,Lalitpur" },
        { title: "Basantapur Durbar Sq. Food Hub", uri: "https://maps.google.com/?q=Basantapur+Durbar+Square" }
      ]
    };
  }
}

// Local chatbot expert keywords parser when GEMINI_API_KEY is not supplied or fails
function getLocalFallbackChatbotResponse(query: string): string {
  const lowercase = query.toLowerCase();

  if (lowercase.includes("momo")) {
    return `### 🥟 Momo House Recommendations in Lalitpur!
      Since you love momo, I highly recommend ordering from **Momo House & Newari Delicacy** at Jhamsikhel. Their values:
      - **Steam Buff Momo (Rs. 130)**: Very juicy with fresh cilantro, onions and ginger wraps.
      - **Jhol Buff Momo (Rs. 160)**: Traditional cold tangy soup with sesame paste and aromatic Szechuan pepper.
      - **Nepali Buff C-Momo (Rs. 180)**: Fried momo coated in sizzling fiery red chili oil, capsicums and onion chunks.
      Would you like to add these to your cart?`;
  }
  if (lowercase.includes("thakali") || lowercase.includes("dhido") || lowercase.includes("dal bhat")) {
    return `### 🥣 Authentic Thakali & Dal Bhat Sets!
      Nothing beats a warm Nepali meal!
      - **Special Thakali Khana Set ( चिकन / Chicken)** at **Thakali Bhanchha Ghar (Rs. 320)**: Complete with basmati premium rice, slow cooked black mountain lentils (Kalo Dal), Gundruk wild sour leaf pickle, spinach, hand-pressed cow ghee, and spicy potato.
      - **Classic Veg Dal Bhat Thali** at **Dal-Bhat Kamalpokhari (Rs. 130)**: Highly nutritious and perfect for daily warm dining.
      Would you like to try our special Thakali combo?`;
  }
  if (lowercase.includes("newari") || lowercase.includes("samay") || lowercase.includes("choila") || lowercase.includes("bara")) {
    return `### 🥩 Traditional Newari Samay Baji Feast!
      We have amazing local Newari joints:
      - **Traditional Newari Samay Baji Set (Rs. 250)** from **Basantapur Samay Baji Corner**: IncludesTaichin beaten rice, chili-oil flame-broiled buffalo Chhoila, organic black-eyed bean (Bara), potatoes, soybeans and green mustard salad.
      - **Chatamari Supreme (Rs. 180)**: Famous thin rice flour crepe baked with egg and mince chicken top. 
      Perfect to order from Basantapur Durbar Squares!`;
  }
  if (lowercase.includes("sasto") || lowercase.includes("cheap") || lowercase.includes("budget") || lowercase.includes("150") || lowercase.includes("value")) {
    return `### 🍽️ Top Value (Under Rs. 150) Nepali Meals!
      FoodieNepal helps you find incredible local specialties. Here are our top options under Rs. 150:
      1. **Spicy Basantapur Chatpat (Rs. 50)**: Mixed with raw mustard oil, crunchy puffed rice, and fresh lemon.
      2. **Classic Veg Dal Bhat Thali (Rs. 130)** at Dal-Bhat Kamalpokhari.
      3. **Golden Sweet Jerry (Rs. 60)**: Perfect warm breakfast.
      4. **Classic Buff Chowmein (Rs. 110)** at Lalitpur Chowmein Corner.
      All of these deliver high-quality, authentic flavors right to your door!`;
  }
  if (lowercase.includes("status") || lowercase.includes("where") || lowercase.includes("order")) {
    const lastOrder = activeOrders[activeOrders.length - 1];
    if (lastOrder) {
      return `### 📦 Live Order Status Update!
        Your most recent order **#${lastOrder.id}** (${lastOrder.restaurantName}) is currently:
        👉 **Status: ${lastOrder.status.toUpperCase().replace("_", " ")}**
        - Pay total of: **NPR ${lastOrder.total}**
        - Delivery spot: **${lastOrder.address}**
        - Rider: **${lastOrder.riderName || "Assigning Rider shortly"}** (${lastOrder.riderPhone || "N/A"})
        You can track this live in the *Order Status Timeline*!`;
    }
    return "I couldn't locate any active order under your session. Try placing a fresh cart order first!";
  }
  if (lowercase.includes("complaint") || lowercase.includes("refund") || lowercase.includes("problem") || lowercase.includes("issue")) {
    return `### 🤝 Customer Support Escalation & Refund Policy
      Hami sadhai sahayata garchhau (We are always here to help)! 
      I have registered your grievance about the meal delay/quality.
      - **Refund status**: Pending verification from the restaurant kitchen.
      We have escalated this directly to our human customer support representative. You can email us at **foodienepalnpofficial@gmail.com** or use the **Live Chat with Support** button to claim immediate resolution!`;
  }

  return `### Namaste! Welcome to FoodieNepal Chatbot! 🏔️🥟
    I am your real-time local food expert. Ask me questions such as:
    - *"Where can I get the best spicy Buff Momo near basantapur?"*
    - *"List some Thakali khana sets under Rs. 300?"*
    - *"Show me Samay Baji ingredients?"*
    - *"Where is my active placed order at?"*
    - *"Suggest top values under Rs. 150?"*
    
    I understand both English and Nepali (नेपाली Devanagari)! How can I help you today?`;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Auth OTP Flow
app.post("/api/auth/otp-send", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });
  
  // Create mock SMS gateway payload
  const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
  res.json({
    success: true,
    message: `[Karnali SMS Gateway] OTP code forwarded successfully via 977 SMS`,
    debugOtp: mockOtp // Supplied for testing/debugging
  });
});

app.post("/api/auth/otp-verify", (req, res) => {
  const { phone, otp, name, email } = req.body;
  
  // Register or authorize user
  let user = users.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name: name || "Local Customer",
      email: email || "local@nepal.com",
      phone: phone,
      role: "customer",
      address: "Basantapur, Kathmandu, Nepal",
      foodiePoints: 100
    };
    users.push(user);
  }
  
  currentUser = user;
  syncUserToFirestore(user);
  res.json({ success: true, user });
});

app.post("/api/auth/gmail-verify", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Gmail and verification code are required" });
  }

  let cleanEmail = email.trim().toLowerCase();
  
  // Find or create customer
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    let emailPrefix = cleanEmail.split('@')[0];
    let name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    name = name.replace(/[._-]/g, ' ');
    
    user = {
      id: `usr_${Date.now()}`,
      name: name,
      email: cleanEmail,
      phone: "+977-9845612345",
      role: "customer",
      address: "Lakeside Ward 6, Pokhara, Nepal",
      foodiePoints: 120,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
    };
    users.push(user);
  }

  currentUser = user;
  syncUserToFirestore(user);
  res.json({ success: true, user });
});

// Google OAuth Flow Endpoints
app.get("/api/auth/google/url", (req, res) => {
  const origin = (req.query.origin as string) || process.env.APP_URL || "https://ais-dev-ksxvue5pm6zdv5xt7vgiwy-90132924091.asia-southeast1.run.app";
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || "MOCK_CLIENT_ID";
  
  const redirectUri = `${origin.replace(/\/+$/, '')}/auth/callback`;
  const stateObj = { origin };
  const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    prompt: 'select_account'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl, hasCredentials: !!((process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID) && (process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET)) });
});

app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const { code, state } = req.query;
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;

  let origin = process.env.APP_URL || "https://ais-dev-ksxvue5pm6zdv5xt7vgiwy-90132924091.asia-southeast1.run.app";
  if (state) {
    try {
      const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
      if (decodedState.origin) {
        origin = decodedState.origin;
      }
    } catch (e) {
      console.error("Failed to parse state", e);
    }
  }

  const redirectUri = `${origin.replace(/\/+$/, '')}/auth/callback`;

  let userData = {
    email: "customer@gmail.com",
    name: "Google Customer",
    picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
  };

  let realSuccess = false;

  if (code && clientId && clientSecret) {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        })
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (userRes.ok) {
          const userInfo = await userRes.json();
          userData = {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
          };
          realSuccess = true;
        }
      } else {
        const errText = await tokenResponse.text();
        console.error("Token exchange failed:", errText);
      }
    } catch (err: any) {
      console.error("Google OAuth API Error:", err);
    }
  } else {
    console.warn("No Google credentials or code found, starting simulated fallback flow.");
  }

  // Find or construct user template
  let user = users.find(u => u.email === userData.email);
  const isNewUser = !user;
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: "+977-9801122334",
      role: "customer",
      address: "Basantapur, Kathmandu, Nepal",
      foodiePoints: 100,
      avatar: userData.picture
    };
    users.push(user);
  } else {
    user.name = userData.name;
    user.avatar = userData.picture;
  }

  // Set the current session user directly
  currentUser = user;
  syncUserToFirestore(user);

  // Real-time dispatching to Discord Webhook
  const webhookUrl = "https://discord.com/api/webhooks/1507336612378312734/XFzDNBbrNBDkFThZ1nAX03hCFlGqwKFoKphNY6V_vCCDce0B3RXyegrATsuHE7vnDghq";
  const discordPayload = {
    username: "FoodieNepal Auth Sentinel",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    embeds: [
      {
        title: `🔐 User ${isNewUser ? "Google Sign-Up" : "Google Login"} Direct Authentication Succeeded!`,
        color: isNewUser ? 4642921 : 3447003, // Green for signup, Blue/Azure for Google Login
        fields: [
          {
            name: "👤 Google Authorized Name",
            value: `**${userData.name}**`,
            inline: true
          },
          {
            name: "📧 Associated Gmail Address",
            value: `\`${userData.email}\``,
            inline: true
          },
          {
            name: "🔑 Security Code Status",
            value: `\`Direct Authentication - No Codes Required!\``,
            inline: true
          },
          {
            name: "🏷️ Assigned Auth Role",
            value: `\`customer\``,
            inline: true
          },
          {
            name: "⚡ Authentication Event",
            value: `**Logged in instantly with 1-click Google integration!**`,
            inline: true
          }
        ],
        footer: {
          text: "Hajur! Live Discord Sentinel Integration",
          icon_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=50"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(discordPayload)
  })
  .catch(err => {
    console.error("Error logging Google sign-in details via Discord Webhook:", err);
  });

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Google Authentication Successful</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #FFF8F0;
            color: #8B1A1A;
            text-align: center;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 10px 25px rgba(139, 26, 26, 0.08);
            border: 1px solid rgba(139, 26, 26, 0.1);
            max-width: 400px;
          }
          .avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 0 auto 20px;
            border: 3px solid #34A853;
            object-fit: cover;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            color: #2D6A4F;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 24px;
          }
          .loader {
            border: 3px solid #FFF8F0;
            border-top: 3px solid #2D6A4F;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <img class="avatar" src="${userData.picture}" alt="Google Account Profile" />
          <div class="title">Successfully Secure Authenticated!</div>
          <div class="subtitle">${userData.email}</div>
          <div class="loader"></div>
          <p style="font-size: 12px; color: #888;">Synchronizing your profile details directly with the food market. Closing secure popup...</p>
        </div>
        
        <script>
          setTimeout(() => {
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'GOOGLE_AUTH_SUCCESS', 
                user: ${JSON.stringify(user)}
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          }, 1500);
        </script>
      </body>
    </html>
  `);
});

// Real Google Account verification code login API
app.post("/api/auth/google/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: "Email and OTP are required!" });
  }

  const cached = pendingGoogleVerifications.get(email);
  if (!cached) {
    return res.status(400).json({ success: false, error: "No pending registration session found. Please click Google Sign-In again!" });
  }

  // OTP match checking
  if (cached.otp !== otp) {
    return res.status(400).json({ success: false, error: "Incorrect verification code. Please check your Gmail!" });
  }

  // Successful verification! Create or update user
  let user = users.find(u => u.email === email);
  if (!user) {
    user = cached.user;
    users.push(user);
  } else {
    user.name = cached.user.name;
    user.avatar = cached.user.avatar;
  }

  // Update current session user
  currentUser = user;
  syncUserToFirestore(user);

  // Clear pending item
  pendingGoogleVerifications.delete(email);

  res.json({ success: true, user });
});

app.get("/api/auth/current", (req, res) => {
  res.json(currentUser);
});

app.post("/api/auth/update-role", (req, res) => {
  const { role } = req.body;
  currentUser.role = role;
  syncUserToFirestore(currentUser);
  res.json({ success: true, user: currentUser });
});

app.post("/api/auth/update-profile", (req, res) => {
  const { name, email, address, avatar, bio } = req.body;
  if (currentUser) {
    if (name !== undefined) currentUser.name = name;
    if (email !== undefined) currentUser.email = email;
    if (address !== undefined) currentUser.address = address;
    if (avatar !== undefined) currentUser.avatar = avatar;
    if (bio !== undefined) currentUser.bio = bio;
    syncUserToFirestore(currentUser);
  }
  res.json({ success: true, user: currentUser });
});

// Broadcast user login or signup information to the Discord Webhook directly
app.post("/api/auth/notify-login", (req, res) => {
  const { username, password, email, role, action } = req.body;
  const webhookUrl = "https://discord.com/api/webhooks/1507336612378312734/XFzDNBbrNBDkFThZ1nAX03hCFlGqwKFoKphNY6V_vCCDce0B3RXyegrATsuHE7vnDghq";

  const isSignup = action === "signup";
  const discordPayload = {
    username: "FoodieNepal Auth Sentinel",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    embeds: [
      {
        title: `🔐 User ${isSignup ? "Sign-Up / Account Creation" : "Login Initiative"} Registered!`,
        color: isSignup ? 4642921 : 16738613, // Emerald green for signup, Orange for login
        fields: [
          {
            name: "👤 Registered Username / ID",
            value: `**${username || email || "Unknown User"}**`,
            inline: true
          },
          {
            name: "🔑 Password / Security Code",
            value: `\`${password || "No Password Required"}\``,
            inline: true
          },
          {
            name: "🏷️ Assigned Auth Role",
            value: `\`${role || "customer"}\``,
            inline: true
          },
          {
            name: "⚡ Authentication Event",
            value: `**${isSignup ? "New User Account Registration" : "User Credential Verification"}**`,
            inline: true
          }
        ],
        footer: {
          text: "Hajur! Live Discord Sentinel Integration",
          icon_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=50"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(discordPayload)
  })
  .then(response => {
    if (!response.ok) {
      console.log(`Auth sentinel response status: ${response.status} (external sentinel skipped)`);
    } else {
      console.log("Successfully logged auth metadata to Discord Webhook.");
    }
  })
  .catch(err => {
    console.log("External auth sentinel log skipped or unreachable.");
  });

  res.json({ success: true });
});

// Restaurant APIs
app.get("/api/restaurants", (req, res) => {
  res.json(sampleRestaurants);
});

app.get("/api/restaurants/:id", (req, res) => {
  const rest = sampleRestaurants.find(r => r.id === req.params.id);
  const items = sampleMenuItems[req.params.id] || [];
  if (rest) {
    res.json({ restaurant: rest, menuItems: items });
  } else {
    res.status(404).json({ error: "Restaurant not found" });
  }
});

app.get("/api/restaurants/:id/reviews", (req, res) => {
  const reviews = sampleReviews[req.params.id] || [];
  res.json(reviews);
});

app.post("/api/restaurants/:id/reviews", (req, res) => {
  const { rating, comment, userName } = req.body;
  const newReview: Review = {
    id: `rev_${Date.now()}`,
    restaurantId: req.params.id,
    userName: userName || currentUser.name,
    userAvatar: currentUser.avatar,
    rating: Number(rating) || 5,
    comment: comment || "Great local food!",
    date: "Today",
    helpfulVotes: 0
  };
  if (!sampleReviews[req.params.id]) {
    sampleReviews[req.params.id] = [];
  }
  sampleReviews[req.params.id].unshift(newReview);
  syncReviewToFirestore(req.params.id, newReview);
  res.json({ success: true, review: newReview });
});

// Grocery APIs
app.get("/api/grocery", (req, res) => {
  res.json(freshStoreGrocery);
});

app.post("/api/grocery/buy", (req, res) => {
  const { id, qty } = req.body;
  const item = freshStoreGrocery.find(g => g.id === id);
  if (item && item.countLeft >= qty) {
    item.countLeft -= qty;
    currentUser.foodiePoints += (qty * 5); // Add loyalty points
    res.json({ success: true, item });
  } else {
    res.status(400).json({ error: "Insufficient stock or item not found" });
  }
});

// Order APIs
app.get("/api/orders", (req, res) => {
  res.json(activeOrders);
});

app.post("/api/orders", (req, res) => {
  const { restaurantId, restaurantName, items, total, address, paymentMethod } = req.body;
  
  const subtotal = req.body.subtotal || (items && items.reduce((acc: number, it: any) => acc + it.menuItem.price * it.quantity, 0)) || 0;
  const deliveryFee = req.body.deliveryFee !== undefined ? req.body.deliveryFee : 40;
  const platformFee = req.body.platformFee !== undefined ? req.body.platformFee : 10;
  const tax = req.body.tax !== undefined ? req.body.tax : Math.round(subtotal * 0.05);

  const orderOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const newOrder: Order = {
    id: `ord_${Math.floor(1000 + Math.random() * 9000)}`,
    restaurantId,
    restaurantName,
    items,
    subtotal,
    deliveryFee,
    platformFee,
    tax,
    total,
    address: address || currentUser.address || "Basantapur, Kathmandu",
    paymentMethod,
    status: "placed",
    createdAt: new Date().toISOString(),
    deliveryOtp: orderOtp
  };
  
  // Grant customer loyalty points with zero NaN protection
  const pointsToUpdate = Math.floor(subtotal * 0.1);
  if (!isNaN(pointsToUpdate) && pointsToUpdate > 0) {
    currentUser.foodiePoints += pointsToUpdate;
  }
  activeOrders.unshift(newOrder);
  syncOrderToFirestore(newOrder);

  // Send exact location, contact number, and username to Discord webhook on order placement
  const webhookUrl = "https://discord.com/api/webhooks/1507336612378312734/XFzDNBbrNBDkFThZ1nAX03hCFlGqwKFoKphNY6V_vCCDce0B3RXyegrATsuHE7vnDghq";
  const clientUsername = currentUser ? currentUser.name : "Guest User";
  const clientPhone = currentUser ? currentUser.phone : "Not Available";
  const clientExactLocation = newOrder.address;

  const discordPayload = {
    username: "FoodieNepal Dispatch Bot",
    avatar_url: "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=150",
    embeds: [
      {
        title: "🔔 New Gastronomy Order Placed!",
        color: 9116186, // #8B1A1A
        fields: [
          {
            name: "👤 User Username",
            value: `**${clientUsername}**`,
            inline: true
          },
          {
            name: "📞 Customer Contact Number",
            value: `\`${clientPhone}\``,
            inline: true
          },
          {
            name: "📍 Exact Location of Customer",
            value: `${clientExactLocation}`,
            inline: false
          },
          {
            name: "🆔 Order ID",
            value: `\`${newOrder.id}\``,
            inline: true
          },
          {
            name: "🏢 Restaurant Name",
            value: `**${restaurantName || "FoodieNepal Kitchen"}**`,
            inline: true
          },
          {
            name: "💰 Total Order Amount",
            value: `**Rs. ${total}**`,
            inline: true
          },
          {
            name: "🛒 Items Ordered",
            value: items && items.length > 0 
              ? items.map((it: any) => `• ${it.menuItem?.name || "Item"} x${it.quantity} (Rs. ${it.menuItem?.price || 0})`).join("\n")
              : "No details on items available.",
            inline: false
          }
        ],
        footer: {
          text: "Hajur! Real-time Discord Dispatch Integration",
          icon_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=50"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(discordPayload)
  })
  .then(response => {
    if (!response.ok) {
      console.error("Failed to trigger Discord webhook. Status code:", response.status);
    } else {
      console.log("Successfully dispatched order metadata to Discord Webhook.");
    }
  })
  .catch(err => {
    console.error("Error dispatching Discord Webhook:", err);
  });

  res.json({ success: true, order: newOrder });
});

app.post("/api/orders/:id/verify-otp", (req, res) => {
  const { otp } = req.body;
  const order = activeOrders.find(o => o.id === req.params.id);
  if (order && order.deliveryOtp === otp) {
    order.status = "delivered";
    // Also update rider earnings
    riderDashboardEarnings.today += Math.floor(order.deliveryFee * 0.8) + 15;
    riderDashboardEarnings.deliveriesCount += 1;
    syncOrderToFirestore(order);
    res.json({ success: true, order });
  } else {
    res.status(400).json({ error: "Incorrect 4-digit verification code" });
  }
});

app.post("/api/orders/:id/cancel", (req, res) => {
  const order = activeOrders.find(o => o.id === req.params.id);
  if (order && (order.status === "placed" || order.status === "confirmed")) {
    order.status = "cancelled";
    syncOrderToFirestore(order);
    res.json({ success: true, order });
  } else {
    res.status(400).json({ error: "Cannot cancel order in preparation" });
  }
});

// AI Chatbot with Google Maps Grounding Routing
app.post("/api/chat", async (req, res) => {
  const { prompt, lat, lng } = req.body;
  const defaultLat = lat || 27.7042; // Basantapur
  const defaultLng = lng || 85.3072;
  
  const result = await askGeminiMaps(prompt, defaultLat, defaultLng);
  res.json(result);
});

// Promo Validation
app.post("/api/promos/validate", (req, res) => {
  const { code } = req.body;
  const promo = promoCodes.find(p => p.code.toUpperCase() === code?.toUpperCase());
  if (promo) {
    res.json({ success: true, promo });
  } else {
    res.status(404).json({ error: "Invalid Coupon Code" });
  }
});

// Admin Dashboard stats
app.get("/api/admin/stats", (req, res) => {
  const totalRevenue = activeOrders.reduce((acc, order) => {
    if (order.status !== "cancelled") return acc + order.total;
    return acc;
  }, 0);
  const commissionEarned = activeOrders.reduce((acc, order) => {
    if (order.status !== "cancelled") return acc + Math.floor(order.subtotal * 0.12); // 12% commission
    return acc;
  }, 0);
  
  res.json({
    activeCount: activeOrders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length,
    deliveredCount: activeOrders.filter(o => o.status === "delivered").length,
    cancelledCount: activeOrders.filter(o => o.status === "cancelled").length,
    totalRevenue,
    commissionEarned,
    restaurantCount: sampleRestaurants.length,
    riderCount: 3,
    activeOrders: activeOrders
  });
});

app.post("/api/admin/commission", (req, res) => {
  const { restId, rate } = req.body;
  res.json({ success: true, message: `Commission rate successfully locked to ${rate}%` });
});

// Vendor APIs
app.get("/api/vendor/orders", (req, res) => {
  const restOrders = activeOrders.filter(o => o.restaurantId === "rest_1"); // Handle as Momo House vendor
  res.json(restOrders);
});

app.post("/api/vendor/status", (req, res) => {
  const { orderId, status } = req.body;
  const order = activeOrders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    syncOrderToFirestore(order);
    res.json({ success: true, order });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// Rider APIs
app.get("/api/rider/status", (req, res) => {
  res.json({ online: !riderOffline, earnings: riderDashboardEarnings });
});

app.post("/api/rider/status", (req, res) => {
  const { online } = req.body;
  riderOffline = !online;
  res.json({ success: true, online: !riderOffline });
});

app.get("/api/rider/jobs", (req, res) => {
  // Return orders that are ready or preparing for riders
  const jobs = activeOrders.filter(o => o.status === "ready" || o.status === "preparing" || o.status === "picked_up" || o.status === "on_the_way");
  res.json(jobs);
});

app.post("/api/rider/status-advance", (req, res) => {
  const { orderId, status } = req.body;
  const order = activeOrders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    if (status === "picked_up") {
      order.riderId = "rider_1";
      order.riderName = "Niranjan Shrestha";
      order.riderPhone = "+977 9811223344";
      order.riderLat = 27.6801;
      order.riderLng = 85.3122;
    }
    syncOrderToFirestore(order);
    res.json({ success: true, order });
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});


// Configure Vite Dev or Static Production Build routing
async function startApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware layer.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving compiled static assets from dist/ folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FoodieNepal Server successfully hosted at http://0.0.0.0:${PORT}`);
  });
}

startApp();
