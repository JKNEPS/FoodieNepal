import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  const localUrl = localStorage.getItem("custom_supabase_url");
  if (localUrl && localUrl.trim().startsWith("http")) {
    return localUrl.trim();
  }
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (
    typeof envUrl === "string" &&
    envUrl.trim() !== "" &&
    envUrl.trim().startsWith("http") &&
    !envUrl.includes("PLACEHOLDER") &&
    envUrl !== "undefined" &&
    envUrl !== "null"
  ) {
    return envUrl.trim();
  }
  return "https://zzrvhdfbytyaaxulfjnm.supabase.co";
}

function getSupabaseAnonKey(): string {
  const localKey = localStorage.getItem("custom_supabase_anon_key");
  if (localKey && localKey.trim() !== "") {
    return localKey.trim();
  }
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (
    typeof envKey === "string" &&
    envKey.trim() !== "" &&
    !envKey.includes("PLACEHOLDER") &&
    envKey !== "undefined" &&
    envKey !== "null"
  ) {
    return envKey.trim();
  }
  return "sb_publishable_BkSoJmoIeju843vzeDtyJQ_u8KZI2Cb";
}

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();

export let supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Update and persist custom Supabase configuration at runtime.
 */
export function reinitializeSupabase(url: string, key: string) {
  if (url && key) {
    localStorage.setItem("custom_supabase_url", url.trim());
    localStorage.setItem("custom_supabase_anon_key", key.trim());
    supabase = createClient(url.trim(), key.trim());
    console.log("[Supabase Config] Dynamic configuration applied & cached.");
  }
}

/**
 * Remove any custom overrides and revert back to system defaults.
 */
export function resetSupabaseToDefault() {
  localStorage.removeItem("custom_supabase_url");
  localStorage.removeItem("custom_supabase_anon_key");
  supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  console.log("[Supabase Config] Custom credentials cleared. Reverted to sandbox.");
}

/**
 * Inserts any newly placed order into the user's Supabase database.
 * Supports both structured column formats and fallback dynamic snake/camel case payloads
 * to prevent any schema conflicts.
 */
export async function insertOrderToSupabase(order: any, user: any) {
  try {
    const userObj = user && typeof user === "object" ? user : null;
    const fullName = userObj?.name || "Guest Customer";
    const usernameVal = userObj?.username || "guest_user";
    const emailVal = userObj?.email || "guest@gmail.com";
    const phoneNumber = userObj?.phone || "+977 9800000000";
    
    const itemsList = Array.isArray(order.items) ? order.items : [];
    const productNames = itemsList.map((item: any) => {
      const q = item.quantity || 1;
      const n = item.menuItem?.name || item.name || "Item";
      return `${q}x ${n}`;
    }).join(", ");
    
    const productCount = itemsList.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    const fullAddress = order.address || "Kathmandu, Nepal";
    
    let parsedCity = "Kathmandu";
    const addrLower = fullAddress.toLowerCase();
    if (addrLower.includes("lalitpur") || addrLower.includes("jhamsikhel")) {
      parsedCity = "Lalitpur";
    } else if (addrLower.includes("pokhara")) {
      parsedCity = "Pokhara";
    } else if (addrLower.includes("bhaktapur")) {
      parsedCity = "Bhaktapur";
    }

    const payload = {
      id: order.id,
      full_name: fullName,
      username: usernameVal,
      email: emailVal,
      phone_number: phoneNumber,
      street_address: fullAddress,
      city: parsedCity,
      product_name: productNames || "Himalayan Cuisine Combo",
      product_amount: productCount || 1,
      total_amount: Number(order.total || 0),
      date_time: order.createdAt || new Date().toISOString(),
      status: order.status || "placed",
      payment_method: order.paymentMethod || "COD",
      items: typeof order.items === "string" ? order.items : JSON.stringify(order.items || [])
    };

    console.log("[Supabase] Attempting to insert order into 'orders' table:", payload);
    const { data, error } = await supabase.from("orders").insert([payload]);
    
    if (error) {
      console.warn("[Supabase] Primary insertion error into custom columns, trying older fallback keys:", error.message);
      
      const oldPayload = {
        id: order.id,
        restaurant_id: order.restaurantId,
        restaurant_name: order.restaurantName,
        subtotal: Number(order.subtotal || 0),
        delivery_fee: Number(order.deliveryFee || 0),
        platform_fee: Number(order.platformFee || 0),
        tax: Number(order.tax || 0),
        total: Number(order.total || 0),
        address: fullAddress,
        payment_method: order.paymentMethod || "COD",
        status: order.status || "placed",
        created_at: order.createdAt || new Date().toISOString(),
        user_id: userObj?.id || "usr_guest",
        items: typeof order.items === "string" ? order.items : JSON.stringify(order.items || [])
      };
      
      const { data: fallbackData, error: fallbackError } = await supabase.from("orders").insert([oldPayload]);
      if (fallbackError) {
        console.warn("[Supabase Warning] Older schema fallback retry notice:", fallbackError.message);
        return { success: false, error: fallbackError.message };
      }
      return { success: true, data: fallbackData };
    }

    console.log("[Supabase] Success! Placed order inserted into Supabase:", data);
    return { success: true, data };
  } catch (err: any) {
    console.warn("[Supabase Warning] Notice for insert attempt deviation:", err);
    return { success: false, error: err.message || err };
  }
}
