import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { totalPrice } = body;

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      console.error("❌ PayPal credentials not found in .env");
      return NextResponse.json({ error: "Missing PayPal credentials" }, { status: 500 });
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

    // گرفتن access token از PayPal
    const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenText = await tokenRes.text();
    console.log("🔐 PayPal Token Response:", tokenText);

    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch (e) {
      console.error("❌ Failed to parse token response:", tokenText);
      return NextResponse.json({ error: "Invalid token response" }, { status: 500 });
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error("❌ access_token not found");
      return NextResponse.json({ error: "No access token" }, { status: 500 });
    }

    // ایجاد سفارش در PayPal
    const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: Number(totalPrice).toFixed(2),

            },
          },
        ],
        application_context: {
          return_url: "http://localhost:3000/confirmation",
          cancel_url: "http://localhost:3000/cancel",
        },
      }),
    });

    const orderRaw = await orderRes.text();
    console.log("📦 PayPal Order Response:", orderRaw);

    let orderData;
    try {
      orderData = JSON.parse(orderRaw);
    } catch (e) {
      console.error("❌ Failed to parse order response:", orderRaw);
      return NextResponse.json({ error: "Invalid order JSON" }, { status: 500 });
    }

    const approvalUrl = orderData.links?.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      console.error("❌ No approval URL in order response");
      return NextResponse.json({ error: "Missing approval URL" }, { status: 500 });
    }

    return NextResponse.json({ approvalUrl });
  } catch (err: any) {
    console.error("🔥 PayPal API Error:", err.message || err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
