// 📁 src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, paypalBase } from "@/lib/paypalBase";

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

    const value =
      typeof totalPrice === "string" ? parseFloat(totalPrice) : totalPrice;

    if (Number.isNaN(value) || value <= 0) {
      return NextResponse.json({ error: "Invalid total price" }, { status: 400 });
    }

    // 1) Access token
    const accessToken = await getAccessToken();

    // 2) Base URL (live یا sandbox بر اساس ENV)
    const base = paypalBase();

    // 3) Build order body
    const orderBody = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: value.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${BASE_URL}/confirmation`,
        cancel_url: `${BASE_URL}/cancel`,
        user_action: "PAY_NOW",            // UX بهتر روی PayPal
        // shipping_preference: "NO_SHIPPING", // اگر آدرس نمی‌خواهی، آزاد است حذف کنی
      },
    };

    // 4) Create order
    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderBody),
      cache: "no-store",
    });

    if (!res.ok) {
      const raw = await res.text();
      console.error("❌ PayPal order creation failed:", raw);
      return NextResponse.json(
        { error: "PayPal order creation failed", raw },
        { status: 500 }
      );
    }

    const data = await res.json();
    const approvalUrl = data?.links?.find((l: any) => l.rel === "approve")?.href;

    if (!approvalUrl) {
      return NextResponse.json(
        { error: "Missing approval URL", data },
        { status: 500 }
      );
    }

    // برای اطمینان از لایو بودن
    console.log("PAYPAL_ENV =", process.env.PAYPAL_ENV, "approval =", approvalUrl);

    return NextResponse.json({ approvalUrl, paypalOrderId: data.id });
  } catch (err: any) {
    console.error("🔥 Unexpected error in create-order:", err?.message || err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
