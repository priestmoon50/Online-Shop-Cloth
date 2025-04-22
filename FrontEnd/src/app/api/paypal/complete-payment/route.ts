// 📁 src/app/api/paypal/complete-payment/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      console.error("❌ Missing orderId in request body");
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      console.error("❌ Missing PayPal credentials");
      return NextResponse.json({ error: "Missing PayPal credentials" }, { status: 500 });
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

    // 1. گرفتن access token
    const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("❌ Failed to get access token:", tokenData);
      return NextResponse.json({ error: "Access token fetch failed" }, { status: 500 });
    }

    // 2. Capture تراکنش (دقت: بدون Content-Type چون body ندارد)
// ✅ Step 2: Capture payment
const captureRes = await fetch(
  `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json", // این خط باید اضافه شود
      
    },
  }
);
console.log("🔴 PayPal capture response status:", captureRes.status);
console.log("🔴 PayPal capture response headers:", JSON.stringify(captureRes.headers));



    const captureText = await captureRes.text();
    console.log("📦 PayPal Capture Response Raw:", captureText);

    let captureData;
    try {
      captureData = JSON.parse(captureText);
    } catch (err) {
      console.error("❌ Failed to parse PayPal capture response:", err);
      return NextResponse.json({ error: "Invalid capture response", raw: captureText }, { status: 500 });
    }

    if (!captureRes.ok) {
      console.error("❌ Capture failed:", JSON.stringify(captureData, null, 2));
      return NextResponse.json({ error: "Capture failed", details: captureData }, { status: 500 });
    }

    console.log("✅ Payment captured successfully:", captureData);

    return NextResponse.json({ success: true, data: captureData });
  } catch (err: any) {
    console.error("❌ Unexpected server error:", err.message || err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
