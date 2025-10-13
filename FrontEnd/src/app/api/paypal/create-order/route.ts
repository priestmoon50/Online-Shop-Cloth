// 📁 src/app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// ===== ENV (Live) =====
// PAYPAL_CLIENT_ID = ...
// PAYPAL_SECRET    = ...
// BASE_URL         = https://your-domain.com   (بدون اسلش آخر)
// (اختیاری) PAYPAL_BASE = https://api-m.paypal.com  ← اگر ست نباشد، پیش‌فرض همین است
// (اختیاری) NEXT_PUBLIC_BRAND_NAME = Avenjor

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_BASE = process.env.PAYPAL_BASE || "https://api-m.paypal.com"; // ✅ default live
const BASE_URL = process.env.BASE_URL;
const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "Avenjor";

// ---------- Types ----------
type IncomingItem = {
  name?: string;
  unit_amount?: number | string;
  quantity?: number | string;
};

type CreateOrderBody =
  | {
      // سبک جدید
      amount?: number | string;
      currency?: string;
      items?: IncomingItem[];
      shipping?: number | string;
      returnPath?: string;
      cancelPath?: string;
      totalPrice?: never; // جلوگیری از تداخل
    }
  | {
      // سازگاری با کد قدیمی
      totalPrice: number | string;
      amount?: never;
      currency?: string;
      items?: IncomingItem[];
      shipping?: number | string;
      returnPath?: string;
      cancelPath?: string;
    };

// ---------- Helpers ----------
function toNumberSafe(v: unknown, fallback = 0): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  const parsed = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asMoney(v: unknown): string {
  const n = toNumberSafe(v, 0);
  const safe = n > 0 ? n : 0;
  return safe.toFixed(2);
}

async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing PayPal credentials (PAYPAL_CLIENT_ID / PAYPAL_SECRET)");
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

// ---------- Route ----------
export async function POST(req: NextRequest) {
  try {
    // BASE_URL باید https باشد در لایو
    if (!BASE_URL || !/^https:\/\//i.test(BASE_URL)) {
      return NextResponse.json(
        { error: "Invalid BASE_URL. Set e.g. https://your-domain.com" },
        { status: 500 }
      );
    }

    const body = ((await req.json().catch(() => ({}))) || {}) as CreateOrderBody;

    const currency = (body as any).currency || "EUR";
    const returnPath = (body as any).returnPath || "/confirmation";
    const cancelPath = (body as any).cancelPath || "/checkout";

    // مقدار مبلغ (از amount یا totalPrice)
    let amountStr: string | undefined;
    if ("amount" in body && body.amount !== undefined) {
      amountStr = asMoney(body.amount);
    } else if ("totalPrice" in body && body.totalPrice !== undefined) {
      amountStr = asMoney(body.totalPrice);
    }

    if (!amountStr || Number(amountStr) <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid amount/totalPrice" },
        { status: 400 }
      );
    }

    const itemsIn: IncomingItem[] = Array.isArray((body as any).items)
      ? ((body as any).items as IncomingItem[])
      : [];

    // Normalize items (اختیاری)
    let itemTotal = 0;
    const normalizedItems =
      itemsIn.length > 0
        ? itemsIn.map((it) => {
            const qtyRaw = toNumberSafe(it.quantity ?? 1, 1);
            const qty = qtyRaw > 0 ? qtyRaw : 1;

            const unitRaw =
              typeof it.unit_amount === "number"
                ? it.unit_amount
                : toNumberSafe(it.unit_amount ?? 0, 0);
            const unit = unitRaw >= 0 ? unitRaw : 0;

            itemTotal += unit * qty;

            return {
              name: String(it.name || "Item").slice(0, 120),
              quantity: String(qty), // PayPal expects string
              unit_amount: {
                currency_code: currency,
                value: asMoney(unit),
              },
            };
          })
        : [];

    const shippingStr = asMoney((body as any).shipping ?? "0.00");
    const computedTotal = (itemTotal + Number(shippingStr)).toFixed(2);

    // اگر اختلاف محسوس بود، جهت جلوگیری از mismatch PayPal، computed را جایگزین کن
    if (Math.abs(Number(amountStr) - Number(computedTotal)) > 0.02) {
      amountStr = computedTotal;
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

    const createData = await createRes.json().catch(async () => ({ raw: await createRes.text() }));
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
