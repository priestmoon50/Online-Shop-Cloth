// 📁 src/app/api/paypal/complete-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

// ENV های لازم:
// PAYPAL_CLIENT_ID=... (Live)
// PAYPAL_SECRET=...    (Live)
// PAYPAL_BASE=https://api-m.paypal.com

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_BASE = process.env.PAYPAL_BASE || "https://api-m.paypal.com";

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing PayPal credentials (PAYPAL_CLIENT_ID / PAYPAL_SECRET)");
  }
  if (!PAYPAL_BASE.includes("api-m.paypal.com")) {
    throw new Error("PAYPAL_BASE must point to LIVE endpoint: https://api-m.paypal.com");
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
    cache: "no-store" as any,
  });

  const data = await res.json().catch(async () => ({ raw: await res.text() }));
  if (!res.ok || !(data as any)?.access_token) {
    console.error("❌ PayPal OAuth error:", data);
    throw new Error("PayPal OAuth failed");
  }
  return (data as any).access_token as string;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Missing or invalid orderId" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    // Idempotency key برای جلوگیری از کپچر دوباره در صورت رفرش/ارسال مجدد
    const idemKey = `capture_${orderId}_${crypto.randomUUID()}`;

    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
        "PayPal-Request-Id": idemKey, // idempotency
      },
      cache: "no-store" as any,
    });

    const text = await captureRes.text();
    let json: any;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("❌ Failed to parse capture response:", text);
      return NextResponse.json({ error: "Invalid capture response", raw: text }, { status: 502 });
    }

    if (!captureRes.ok) {
      console.error("❌ Capture failed:", JSON.stringify(json, null, 2));
      return NextResponse.json({ error: "Capture failed", details: json }, { status: 502 });
    }

    // حالت‌های موفق: status === "COMPLETED" یا approvals خاص
    const status = json?.status;
    if (status !== "COMPLETED") {
      // برخی مواقع ممکن است PENDING باشد (مثلا 3DS یا review). این را شفاف برگردانیم.
      return NextResponse.json({ success: true, pending: true, data: json }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: json }, { status: 200 });
  } catch (err: any) {
    console.error("❌ complete-payment unexpected error:", err?.message || err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
