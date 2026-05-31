import { getFormsAccessToken } from "./googleFormsAuth";
import { auth } from "../firebase";

// Global cache for spreadsheet ID during runtime session
let activeSheetId: string | null = null;

/**
 * Searches for a "FoodieNepal_Database" spreadsheet in Google Drive.
 * If not found, creates it with Sheets for Auth Logs and Order Logs, 
 * and initializes column headers on first run.
 */
export async function searchOrCreateSpreadsheet(token: string): Promise<string> {
  if (activeSheetId) return activeSheetId;

  // 1. Try to load saved spreadsheetId from localStorage
  const savedId = localStorage.getItem("foodienepal_sheet_id");
  if (savedId && savedId !== "undefined" && savedId !== "null") {
    activeSheetId = savedId;
    return savedId;
  }

  try {
    // 2. Search in Google Drive
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='FoodieNepal_Database'+and+mimeType='application/vnd.google-apps.spreadsheet'+and+trashed=false&fields=files(id,name)`;
    const searchRes = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const foundId = searchData.files[0].id;
        activeSheetId = foundId;
        localStorage.setItem("foodienepal_sheet_id", foundId);
        console.log("[Workspace Sync] Found existing Google Sheet database ID:", foundId);
        return foundId;
      }
    }

    // 3. Create a brand new Spreadsheet with separate custom logging tabs
    console.log("[Workspace Sync] No spreadsheet database found. Creating a new 'FoodieNepal_Database'...");
    const createUrl = "https://sheets.googleapis.com/v4/spreadsheets";
    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: {
          title: "FoodieNepal_Database"
        },
        sheets: [
          {
            properties: {
              title: "Auth_Logs"
            }
          },
          {
            properties: {
              title: "Order_Logs"
            }
          }
        ]
      })
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create spreadsheet metadata: ${createRes.statusText}`);
    }

    const createdData = await createRes.json();
    const newId = createdData.spreadsheetId;
    activeSheetId = newId;
    localStorage.setItem("foodienepal_sheet_id", newId);

    // 4. Initialize headers in sheets
    console.log("[Workspace Sync] Initializing log headers in spreadsheet:", newId);
    
    // Auth_Logs headers
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${newId}/values/Auth_Logs:append?valueInputOption=RAW`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values: [
          ["Timestamp", "Event (Register/Login)", "Full Name", "Username", "Email Address", "Phone Number", "Assigned Role"]
        ]
      })
    });

    // Order_Logs headers
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${newId}/values/Order_Logs:append?valueInputOption=RAW`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values: [
          ["Timestamp", "Order ID", "Customer Name", "Customer Email", "Ordered Product(s)", "Total Amount (Rs.)", "Status", "Payment Method", "Delivery Address"]
        ]
      })
    });

    return newId;
  } catch (err) {
    console.warn("[Workspace Sync Exception on Sheet Creation]:", err);
    throw err;
  }
}

/**
 * Appends a login or registration authentication log entry to the Google Sheet.
 */
export async function logAuthToGoogleSheets(
  event: "Register" | "Login",
  name: string,
  username: string,
  email: string,
  phone = "Not Provided",
  role = "customer"
): Promise<boolean> {
  const token = getFormsAccessToken();
  if (!token) {
    console.log("[Workspace Sync] Sheets tracking skipped: user has not integrated Google Workspace.");
    return false;
  }

  try {
    const spreadsheetId = await searchOrCreateSpreadsheet(token);
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Auth_Logs:append?valueInputOption=USER_ENTERED`;
    const response = await fetch(appendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values: [
          [
            new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " UTC",
            event,
            name,
            username,
            email,
            phone,
            role
          ]
        ]
      })
    });

    if (response.ok) {
      console.log(`[Workspace Sync] Recorded Auth Event (${event}) in Google Sheet successfully.`);
      return true;
    } else {
      console.warn("[Workspace Sync Sheets Error]: Received failure code:", response.status);
      return false;
    }
  } catch (err) {
    console.error("[Workspace Sync Exception]:", err);
    return false;
  }
}

/**
 * Appends a checkout order ticket creation entry to the Google Sheet.
 */
export async function logOrderToGoogleSheets(order: any, user: any): Promise<boolean> {
  const token = getFormsAccessToken();
  if (!token) {
    console.log("[Workspace Sync] Sheets order entry skipped: user has not integrated Google Workspace.");
    return false;
  }

  try {
    const spreadsheetId = await searchOrCreateSpreadsheet(token);
    
    // Parse ordered item summaries
    const itemsList = Array.isArray(order.items) ? order.items : [];
    const productNames = itemsList.map((item: any) => {
      const q = item.quantity || 1;
      const n = item.menuItem?.name || item.name || "Item";
      return `${q}x ${n}`;
    }).join(", ");

    const fullName = user?.name || "Guest Checkout User";
    const emailVal = user?.email || "guest@gmail.com";
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Order_Logs:append?valueInputOption=USER_ENTERED`;

    const response = await fetch(appendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values: [
          [
            new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " UTC",
            order.id || "N/A",
            fullName,
            emailVal,
            productNames || "Selected Delicacy Package",
            order.total || order.total_amount || 0,
            order.status || "placed",
            order.paymentMethod || order.payment_method || "COD",
            order.address || order.street_address || "Nepal Regional"
          ]
        ]
      })
    });

    if (response.ok) {
      console.log(`[Workspace Sync] Order ${order.id} inserted into Google Sheets log.`);
      return true;
    } else {
      console.warn("[Workspace Sync Sheets Error logging order]:", response.status);
      return false;
    }
  } catch (err) {
    console.error("[Workspace Sync Order Excel Append Exception]:", err);
    return false;
  }
}

/**
 * Sends a notification email on behalf of the user utilizing the secure Gmail send scope.
 */
export async function sendGmailNotification(
  subject: string,
  htmlBody: string,
  customRecipient?: string
): Promise<boolean> {
  const token = getFormsAccessToken();
  if (!token) {
    console.log("[Workspace Sync] Gmail dispatch skipped: User has not integrated Google Workspace.");
    return false;
  }

  try {
    // Deliver a copy to foodienepalnpofficial@gmail.com as requested, and optionally the customer/user email address.
    let recipientsList = "foodienepalnpofficial@gmail.com";
    const userEmail = customRecipient || auth.currentUser?.email;
    if (userEmail && userEmail.trim() !== "" && userEmail.toLowerCase() !== "foodienepalnpofficial@gmail.com") {
      recipientsList += `, ${userEmail.trim()}`;
    }
    
    const emailLines = [
      `To: ${recipientsList}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      "",
      htmlBody
    ];

    const rawMsg = btoa(unescape(encodeURIComponent(emailLines.join("\r\n"))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        raw: rawMsg
      })
    });

    if (sendRes.ok) {
      console.log(`[Workspace Sync] Gmail notification dispatched successfully to ${recipientsList}.`);
      return true;
    } else {
      const errText = await sendRes.text();
      console.warn("[Workspace Sync Gmail Dispatch Failed]:", sendRes.status, errText);
      return false;
    }
  } catch (err) {
    console.error("[Workspace Sync Gmail Dispatch Exception]:", err);
    return false;
  }
}
