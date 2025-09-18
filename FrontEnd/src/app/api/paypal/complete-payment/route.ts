// 📁 src/app/api/paypal/complete-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, paypalBase } from "@/lib/paypalBase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 1) Access Token
    const accessToken = await getAccessToken();

    // 2) Base URL (live/sandbox از روی ENV)
    const base = paypalBase();

    // 3) Capture
    const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // اگر پاسخ JSON نبود
      return NextResponse.json(
        { error: "Invalid capture response", raw: text },
        { status: 500 }
      );
    }

    if (!res.ok) {
      console.error("❌ Capture failed:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: "Capture failed", details: data },
        { status: 500 }
      );
    }

    // برای لاگ: باید معمولا COMPLETED باشد
    console.log("CAPTURE:", {
      env: process.env.PAYPAL_ENV,
      status: data?.status,
      id: data?.id,
    });

    // برای مرحله بعدی (update-payment) خروجی‌های پرتکرار را برگردانیم
    const captureId =
      data?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;

    return NextResponse.json({
      success: true,
      captureId,
      data,
    });
  } catch (err: any) {
    console.error("🔥 complete-payment error:", err?.message || err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
