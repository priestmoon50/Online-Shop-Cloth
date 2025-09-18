// 📁 src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, paypalBase } from "../../../../lib/paypalBase";

export const runtime = "nodejs";

const BASE_URL = process.env.BASE_URL;

export async function POST(req: NextRequest) {
  try {
    if (!BASE_URL) {
      return NextResponse.json(
        { error: "Missing BASE_URL environment variable" },
        { status: 500 }
      );
    }

    const { totalPrice } = await req.json();

    if (totalPrice === undefined || totalPrice === null) {
      return NextResponse.json({ error: "Missing total price" }, { status: 400 });
    }

    const parsed = typeof totalPrice === "string" ? parseFloat(totalPrice) : totalPrice;
    if (Number.isNaN(parsed) || parsed <= 0) {
      return NextResponse.json({ error: "Invalid total price" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const base = paypalBase();

    const orderBody = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: parsed.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${BASE_URL}/confirmation`,
        cancel_url: `${BASE_URL}/cancel`,
        shipping_preference: "NO_SHIPPING", // اگر آدرس نمی‌خواهی؛ در صورت نیاز حذف کن
        user_action: "PAY_NOW",
      },
    };

    const paypalRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderBody),
    });

    if (!paypalRes.ok) {
      const raw = await paypalRes.text();
      console.error("❌ PayPal order creation failed:", raw);
      return NextResponse.json({ error: "PayPal order creation failed", raw }, { status: 500 });
    }

    const data = await paypalRes.json();
    const approvalUrl = data.links?.find((l: any) => l.rel === "approve")?.href;

    if (!approvalUrl) {
      return NextResponse.json({ error: "Missing approval URL", data }, { status: 500 });
    }

    return NextResponse.json({ approvalUrl, paypalOrderId: data.id });
  } catch (err: any) {
    console.error("🔥 create-order error:", err?.message || err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
