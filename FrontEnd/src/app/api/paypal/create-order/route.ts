// 📁 src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE_URL = process.env.BASE_URL;

const toNum = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

export async function POST(req: NextRequest) {
  if (!BASE_URL) {
    return NextResponse.json({ error: "Missing BASE_URL environment variable" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { totalPrice } = body ?? {};

    if (totalPrice === undefined || totalPrice === null) {
      return NextResponse.json({ error: "Missing total price" }, { status: 400 });
    }

    const priceNum = toNum(totalPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: "Invalid total price" }, { status: 400 });
    }

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return NextResponse.json({ error: "Missing PayPal credentials" }, { status: 500 });
    }

    // --- 1) OAuth Token
    const basicAuth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
      // @ts-ignore
      cache: "no-store",
    });

    const tokenData = await tokenRes.json().catch(async () => ({ raw: await tokenRes.text() }));
    if (!tokenRes.ok || !(tokenData as any)?.access_token) {
      console.error("❌ PayPal token error:", tokenData);
      return NextResponse.json({ error: "Failed to fetch PayPal token", details: tokenData }, { status: 500 });
    }

    const accessToken = (tokenData as any).access_token as string;

    // --- 2) Create Order
    const paypalOrder = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: priceNum.toFixed(2), // PayPal -> string with 2 decimals
          },
        },
      ],
      application_context: {
        return_url: `${BASE_URL}/confirmation`,
        cancel_url: `${BASE_URL}/cancel`,
      },
    };

    const createRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(paypalOrder),
      // @ts-ignore
      cache: "no-store",
    });

    const createData = await createRes.json().catch(async () => ({ raw: await createRes.text() }));
    if (!createRes.ok) {
      console.error("❌ PayPal order creation failed:", createData);
      return NextResponse.json({ error: "PayPal order creation failed", details: createData }, { status: 500 });
    }

    const links = (createData as any)?.links ?? [];
    const approvalUrl =
      links.find((l: any) => l?.rel === "approve")?.href ??
      links.find((l: any) => l?.rel === "payer-action")?.href;

    if (!approvalUrl) {
      console.error("❌ Missing approval URL:", createData);
      return NextResponse.json({ error: "Missing approval URL", paypalData: createData }, { status: 500 });
    }

    return NextResponse.json({ approvalUrl, paypalOrderId: (createData as any).id });
  } catch (err: any) {
    console.error("🔥 Unexpected error in create-order:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
