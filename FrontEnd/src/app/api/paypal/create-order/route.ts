// 📁 src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📅 Received order data:", body);

    const { totalPrice } = body;

    if (!totalPrice) {
      return NextResponse.json({ error: "Missing total price" }, { status: 400 });
    }

    const parsedPrice = parseFloat(totalPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: "Invalid total price" }, { status: 400 });
    }

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return NextResponse.json({ error: "Missing PayPal credentials" }, { status: 500 });
    }

    const basicAuth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

    const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: "PayPal access token failed" }, { status: 500 });
    }

    const paypalOrder = {
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

    const paypalRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paypalOrder),
    });

    const paypalData = await paypalRes.json();
    const approvalUrl = paypalData.links?.find((l: any) => l.rel === "approve")?.href;

    if (!approvalUrl) {
      return NextResponse.json({ error: "Missing approval URL", paypalData }, { status: 500 });
    }

    console.log("✅ PayPal approval URL:", approvalUrl);

    return NextResponse.json({ approvalUrl });
  } catch (err: any) {
    console.error("🔥 Unexpected error in create-order:", err.message || err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
