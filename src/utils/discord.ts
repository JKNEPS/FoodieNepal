import { Order } from "../types";

// Helper to load current stored Webhook URL from localStorage or import.meta.env
export const getDiscordWebhookUrl = (): string => {
  const savedUrl = localStorage.getItem("foodienepal_discord_webhook");
  if (savedUrl) return savedUrl.trim();
  return (
    ((import.meta as any).env?.VITE_DISCORD_WEBHOOK_URL || "").trim() ||
    "https://discord.com/api/webhooks/1507336523710726235/Ls1ubUb2sr0GgWbSqyJF78FN3yYmvXo-mfFpPX2VKidU4n1vB7IkRrPnoWx8TdY_0zK-"
  );
};

export const saveDiscordWebhookUrl = (url: string) => {
  localStorage.setItem("foodienepal_discord_webhook", url.trim());
};

export const sendDiscordMessage = async (payload: {
  username: string;
  avatar_url?: string;
  content?: string;
  embeds?: any[];
  thread_name?: string;
}) => {
  const url = getDiscordWebhookUrl();
  if (!url) {
    console.warn("Discord Webhook URL not configured. Storing payload locally.");
    return;
  }

  try {
    const postUrl = new URL(url);
    postUrl.searchParams.set("wait", "true");

    // Discord allows webhooks to start threads or specify forum thread names using thread_name
    const response = await fetch(postUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Discord Webhook Delivery Error:", errText);
    } else {
      console.log("Discord Webhook message logged successfully.");
    }
  } catch (error) {
    console.error("Network Error delivering Discord webhook:", error);
  }
};

/**
 * Log user session events.
 * Organizes them by custom User threads inside the Discord channel.
 */
export const notifyUserSession = async (user: {
  name: string;
  email: string;
  phone: string;
  address?: string;
  foodiePoints: number;
}, isNew: boolean, orderCount: number) => {
  const cleanUsername = user.name.replace(/[^a-zA-Z0-9_]/g, "_");
  
  const content = isNew 
    ? `🆕 **New Customer Registration Verified!**` 
    : `🔄 **Logged In Returning Customer!** Continuation secure.`;

  const fields = [
    { name: "👤 Username", value: user.name, inline: true },
    { name: "📧 Associated Gmail", value: user.email, inline: true },
    { name: "📞 Identity Phone", value: user.phone, inline: true },
    { name: "📍 Active Home Address Area", value: user.address || " Jhamsikhel, Pokhara, Nepal", inline: false },
    { name: "🌟 Loyalty Points Balance", value: `${user.foodiePoints} pts`, inline: true },
    { name: "📦 Historic Orders count", value: `${orderCount}`, inline: true },
  ];

  await sendDiscordMessage({
    username: "FoodieNepal Gateway Guard",
    avatar_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150",
    thread_name: cleanUsername,
    content,
    embeds: [
      {
        title: `Gateway Ingress: ${user.name}`,
        color: isNew ? 65280 : 16753920, // Green/Orange
        fields,
        timestamp: new Date().toISOString(),
        footer: {
          text: "Certified JWT & biometric alignment",
        },
      }
    ],
  });
};

/**
 * Log order placement events.
 */
export const notifyOrderPlacement = async (user: { name: string }, order: Order) => {
  const cleanUsername = user.name.replace(/[^a-zA-Z0-9_]/g, "_");

  const itemsString = order.items
    .map((item) => `- **${item.menuItem.name}** x${item.quantity} (Rs. ${item.menuItem.price * item.quantity}) [Spice: ${item.selectedSpice || "Medium"}]`)
    .join("\n");

  await sendDiscordMessage({
    username: "FoodieNepal Dispatch Board",
    avatar_url: "https://images.unsplash.com/photo-1625220194771-7ebded01f059?auto=format&fit=crop&q=80&w=150",
    thread_name: cleanUsername,
    content: `🚨 **Live Premium Food Delivery Initiated!**`,
    embeds: [
      {
        title: `Consignment Outflow: #${order.id.slice(-6).toUpperCase()}`,
        color: 16711680, // Red
        description: `Order successfully locked in. Tracking coordinates online.`,
        fields: [
          { name: "🏪 Merchant Source", value: order.restaurantName, inline: true },
          { name: "💳 Settlement", value: order.paymentMethod.toUpperCase(), inline: true },
          { name: "🎯 Total Price", value: `**Rs. ${order.total}**`, inline: true },
          { name: "📍 Address Area", value: order.address, inline: false },
          { name: "🍽️ Culinary Items", value: itemsString, inline: false },
          { name: "🔑 Handshake OTP", value: `🔑 ${order.deliveryOtp}`, inline: true },
          { name: "🚴 Courier State", value: `🛵 ${order.status.toUpperCase()}`, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "Rider dispatch mapping telemetry active",
        },
      }
    ],
  });
};
