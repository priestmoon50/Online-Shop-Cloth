// 📁 src/app/api/paypal/complete-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, paypalBase } from "../../../../lib/paypalBase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const base = paypalBase();

    const captureRes = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const text = await captureRes.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid capture response", raw: text }, { status: 500 });
    }

    if (!captureRes.ok) {
      console.error("❌ Capture failed:", JSON.stringify(data, null, 2));
      return NextResponse.json({ error: "Capture failed", details: data }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("🔥 complete-payment error:", err?.message || err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
