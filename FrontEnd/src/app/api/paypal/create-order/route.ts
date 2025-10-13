// 📁 src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// ===== Required ENV =====
// PAYPAL_CLIENT_ID= live client id
// PAYPAL_SECRET=     live client secret
// PAYPAL_BASE=       https://api-m.paypal.com     (لایو)
// BASE_URL=          https://your-domain.com      (بدون / آخر)
// NEXT_PUBLIC_BRAND_NAME= Avenjor (اختیاری)

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_BASE = process.env.PAYPAL_BASE;
const BASE_URL = process.env.BASE_URL;
const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "Avenjor";

function asMoney(v: unknown): string {
  const n =
    typeof v === "number"
      ? v
      : parseFloat(String(v ?? "").replace(",", "."));
  const safe = Number.isFinite(n) && n > 0 ? n : 0;
  return safe.toFixed(2);
}

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing PayPal credentials (PAYPAL_CLIENT_ID / PAYPAL_SECRET)");
  }
  if (!PAYPAL_BASE || !PAYPAL_BASE.includes("api-m.paypal.com")) {
    throw new Error("PAYPAL_BASE must be set to LIVE endpoint: https://api-m.paypal.com");
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
    // --- Validate BASE_URL (must be https on LIVE)
    if (!BASE_URL || !/^https:\/\//i.test(BASE_URL)) {
      return NextResponse.json(
        { error: "Invalid BASE_URL. Set e.g. https://your-domain.com" },
        { status: 500 }
      );
    }

    // --- Accept both: { totalPrice } (your current client) OR { amount, currency, items, shipping }
    const body = (await req.json().catch(() => ({}))) || {};
    const {
      totalPrice,                   // legacy from your client
      amount,                       // optional new style
      currency = "EUR",
      items = [] as Array<{ name?: string; unit_amount?: number | string; quantity?: number | string }>,
      shipping = "0.00",
      returnPath = "/confirmation",
      cancelPath = "/checkout",
    } = body;

    // Determine amount string
    let amountStr: string | undefined =
      typeof amount === "number" || typeof amount === "string"
        ? asMoney(amount)
        : typeof totalPrice === "number" || typeof totalPrice === "string"
        ? asMoney(totalPrice)
        : undefined;

    if (!amountStr || Number(amountStr) <= 0) {
      return NextResponse.json({ error: "Missing or invalid amount/totalPrice" }, { status: 400 });
    }

    // Optional: normalize items for breakdown (if provided)
    let itemTotal = 0;
    const normalizedItems =
      Array.isArray(items) && items.length
        ? items.map((it) => {
            const qty = Number(it.quantity ?? 1);
            const unit = Number(
              typeof it.unit_amount === "number"
                ? it.unit_amount
                : parseFloat(String(it.unit_amount ?? "0").replace(",", "."))
            );
            const q = Number.isFinite(qty) && qty > 0 ? qty : 1;
            const u = Number.isFinite(unit) && unit >= 0 ? unit : 0;
            itemTotal += u * q;
            return {
              name: (it.name || "Item").toString().slice(0, 120),
              quantity: String(q),
              unit_amount: { currency_code: currency, value: asMoney(u) },
            };
          })
        : [];

    const shippingStr = asMoney(shipping);
    const computed = (itemTotal + Number(shippingStr)).toFixed(2);

    // Keep client amount if close enough, otherwise use computed to avoid PayPal mismatch errors
    if (Math.abs(Number(amountStr) - Number(computed)) > 0.02) {
      amountStr = computed;
    }

    const application_context = {
      brand_name: BRAND_NAME,
      landing_page: "LOGIN" as const,
      user_action: "PAY_NOW" as const,
      return_url: `${BASE_URL}${returnPath}`,
      cancel_url: `${BASE_URL}${cancelPath}`,
    };

    const purchaseUnit: any = {
      amount: {
        currency_code: currency,
        value: amountStr, // string with 2 decimals
      },
    };

    if (normalizedItems.length > 0) {
      purchaseUnit.items = normalizedItems;
      purchaseUnit.amount.breakdown = {
        item_total: { currency_code: currency, value: asMoney(itemTotal) },
        shipping: { currency_code: currency, value: shippingStr },
      };
    }

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [purchaseUnit],
      application_context,
    };

    const token = await getAccessToken();

    const createRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(orderPayload),
      cache: "no-store" as any,
    });

    const createData = await createRes
      .json()
      .catch(async () => ({ raw: await createRes.text() }));
    if (!createRes.ok) {
      console.error("❌ PayPal order creation failed:", createData);
      return NextResponse.json(
        { error: "paypal_create_failed", detail: createData },
        { status: 500 }
      );
    }

    const links = (createData as any)?.links ?? [];
    const approvalUrl =
      links.find((l: any) => l?.rel === "approve")?.href ||
      links.find((l: any) => l?.rel === "payer-action")?.href;

    if (!approvalUrl) {
      console.error("❌ Missing approval URL:", createData);
      return NextResponse.json(
        { error: "missing_approval_url", paypalData: createData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      approvalUrl,
      paypalOrderId: (createData as any).id,
      environment: "live",
    });
  } catch (err: any) {
    console.error("🔥 create-order unexpected error:", err?.message || err);
    return NextResponse.json(
      { error: "internal_error", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
