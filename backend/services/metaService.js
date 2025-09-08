import axios from "axios";

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN; // long-lived token
const PIXEL_ID = process.env.META_PIXEL_ID;

// 🔹 Common Meta CAPI Event Function
export const sendMetaEvent = async (
  eventName,
  userData,
  customData = {},
  eventId = null
) => {
  try {
    const url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_id: eventId || `${eventName}_${Date.now()}`,
          user_data: {
            em: userData?.email ? [hash(userData.email)] : [],
            ph: userData?.phone ? [hash(userData.phone)] : [],
            client_ip_address: userData?.ip || "",
            client_user_agent: userData?.userAgent || "",
          },
          custom_data: customData,
        },
      ],
      access_token: META_ACCESS_TOKEN,
    };

    await axios.post(url, payload);
    console.log(`✅ Meta CAPI Event Sent: ${eventName}`);
  } catch (error) {
    console.error(
      "❌ Meta CAPI Error:",
      error?.response?.data || error.message
    );
  }
};

import crypto from "crypto";
function hash(data) {
  return crypto
    .createHash("sha256")
    .update(data.toLowerCase().trim())
    .digest("hex");
}
