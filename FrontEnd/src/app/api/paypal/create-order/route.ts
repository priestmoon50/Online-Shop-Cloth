// 📁 src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // جلوگیری از خطای Buffer در Edge Runtime

const BASE_URL = process.env.BASE_URL;

export async function POST(req: NextRequest) {
  if (!BASE_URL) {
    return NextResponse.json({ error: "Missing BASE_URL environment variable" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { totalPrice } = body;

    console.log("📦 totalPrice received:", totalPrice, "type:", typeof totalPrice);

    if (!totalPrice) {
      return NextResponse.json({ error: "Missing total price" }, { status: 400 });
    }

    const parsedPrice = typeof totalPrice === "string" ? parseFloat(totalPrice) : totalPrice;

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: "Invalid total price" }, { status: 400 });
    }

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return NextResponse.json({ error: "Missing PayPal credentials" }, { status: 500 });
    }

    const basicAuth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {

      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("❌ PayPal token error:", tokenData);
      return NextResponse.json({ error: "Failed to fetch PayPal token", details: tokenData }, { status: 500 });
    }

    const accessToken = tokenData.access_token;

    const paypalOrder = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: parsedPrice.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${BASE_URL}/confirmation`,
        cancel_url: `${BASE_URL}/cancel`,
      },
    };

    const paypalRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {

      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paypalOrder),
    });

    if (!paypalRes.ok) {
      const raw = await paypalRes.text();
      console.error("❌ PayPal order creation failed:", raw);
      return NextResponse.json({ error: "PayPal order creation failed", raw }, { status: 500 });
    }

    const paypalData = await paypalRes.json();
    const approvalUrl = paypalData.links?.find((l: any) => l.rel === "approve")?.href;

    if (!approvalUrl) {
      return NextResponse.json({ error: "Missing approval URL", paypalData }, { status: 500 });
    }

    console.log("✅ PayPal approval URL:", approvalUrl);

    return NextResponse.json({ approvalUrl, paypalOrderId: paypalData.id });
  } catch (err: any) {
    console.error("🔥 Unexpected error in create-order:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
