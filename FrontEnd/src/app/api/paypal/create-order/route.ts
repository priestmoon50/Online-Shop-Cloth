// 📁 src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 Incoming request body:", JSON.stringify(body, null, 2));

    const { totalPrice, name, email, phone, address, items } = body;

    // بررسی اولیه قیمت
    const parsedPrice = parseFloat(totalPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      console.error("❌ Invalid totalPrice:", totalPrice);
      return NextResponse.json({ error: "Invalid total price" }, { status: 400 });
    }

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      console.error("❌ PayPal credentials not found in environment");
      return NextResponse.json({ error: "Missing PayPal credentials" }, { status: 500 });
    }

    // گرفتن access_token
    const basicAuth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

    const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenText = await tokenRes.text();
    console.log("🔐 PayPal token raw response:", tokenText);

    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch (e) {
      console.error("❌ Token JSON parse error:", tokenText);
      return NextResponse.json({ error: "Invalid token response" }, { status: 500 });
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error("❌ No access_token in token response:", tokenData);
      return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
    }

    // ساخت سفارش در PayPal
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: parsedPrice.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: "http://localhost:3000/confirmation",
        cancel_url: "http://localhost:3000/cancel",
      },
    };

    console.log("📤 Order payload to PayPal:", JSON.stringify(orderPayload, null, 2));

    const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const orderRaw = await orderRes.text();
    console.log("📦 PayPal order response (raw):", orderRaw);

    let orderData;
    try {
      orderData = JSON.parse(orderRaw);
    } catch (e) {
      console.error("❌ Order JSON parse error:", orderRaw);
      return NextResponse.json({ error: "Invalid order JSON" }, { status: 500 });
    }

    const approvalUrl = orderData.links?.find((link: any) => link.rel === "approve")?.href;
    if (!approvalUrl) {
      console.error("❌ No approval URL in response:", orderData);
      return NextResponse.json({ error: "Missing approval URL", fullResponse: orderData }, { status: 500 });
    }

    console.log("✅ Order created successfully. Approval URL:", approvalUrl);
    return NextResponse.json({ approvalUrl });
  } catch (err: any) {
    console.error("🔥 Unhandled error:", err.message || err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
