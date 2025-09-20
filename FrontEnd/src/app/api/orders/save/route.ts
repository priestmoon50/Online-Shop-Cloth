// 📁 src/app/api/orders/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";

export const runtime = "nodejs";

type Variant = {
  size?: string;
  color?: string;
  quantity: number;
  price?: number; // ما این را نرمال می‌کنیم
};

type Item = {
  id: string;
  title?: string;
  image?: string;
  price?: number | string;
  discountPrice?: number | string;
  variants: Variant[];
  priceBeforeDiscount?: number;
};

type IncomingOrder = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  street?: string;
  postalCode?: string;
  items?: Item[];
  totalPrice?: number | string;
  discountCode?: string;
  discountPercent?: number;
  rawTotal?: number | string;
  paypalOrderId?: string | null;
  userId?: string | null;
  createdAt?: string;
  status?: string;
};

const toNum = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

function normalizeItems(items: Item[]): { ok: true; items: Item[] } | { ok: false; error: string } {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Items must be a non-empty array" };
  }

  const normalized = items.map((it, idx) => {
    const price = toNum(it.price as any);
    const discount = it.discountPrice != null ? toNum(it.discountPrice as any) : NaN;
    const hasDiscount = Number.isFinite(discount) && discount < price;

    if (!Number.isFinite(price)) {
      throw new Error(`Invalid item price at index ${idx}`);
    }

    const unit = hasDiscount ? discount : price;

    return {
      ...it,
      priceBeforeDiscount: Number(price.toFixed(2)),
      variants: (it.variants || []).map((v, vIdx) => {
        const qty = Number(v.quantity ?? 0);
        if (!Number.isFinite(qty) || qty <= 0) {
          throw new Error(`Invalid variant quantity at item ${idx}, variant ${vIdx}`);
        }
        // قیمت واحد هر واریانت را اسنپ‌شات می‌کنیم (بعداً سمت کلاینت نیز پرداخت با همین مبناست)
        return {
          ...v,
          price: Number(unit.toFixed(2)),
        };
      }),
    };
  });

  return { ok: true, items: normalized };
}

function validateOrder(o: IncomingOrder) {
  const reqKeys = ["name", "email", "phone", "address", "street", "postalCode", "items", "totalPrice"] as const;
  const missing = reqKeys.filter((k) => !(k in o));
  if (missing.length) return { ok: false as const, error: `Missing fields: ${missing.join(", ")}` };

  if (!o.name || typeof o.name !== "string") return { ok: false as const, error: "Invalid name" };
  if (!o.email || typeof o.email !== "string") return { ok: false as const, error: "Invalid email" };
  if (!o.phone || typeof o.phone !== "string") return { ok: false as const, error: "Invalid phone" };
  if (!o.address || typeof o.address !== "string") return { ok: false as const, error: "Invalid address" };
  if (!o.street || typeof o.street !== "string") return { ok: false as const, error: "Invalid street" };
  if (!o.postalCode || typeof o.postalCode !== "string") return { ok: false as const, error: "Invalid postalCode" };

  const total = toNum(o.totalPrice as any);
  if (!Number.isFinite(total) || total < 0) return { ok: false as const, error: "Invalid totalPrice" };

  let itemsNormalized: Item[];
  try {
    const norm = normalizeItems(o.items as Item[]);
    if (!norm.ok) return { ok: false as const, error: norm.error };
    itemsNormalized = norm.items;
  } catch (e: any) {
    return { ok: false as const, error: e?.message || "Invalid items" };
  }

  const raw = toNum(o.rawTotal as any);
  const normalized = {
    totalPrice: Number(total.toFixed(2)),
    rawTotal: Number.isFinite(raw) ? Number(raw.toFixed(2)) : undefined,
    items: itemsNormalized,
  };

  return { ok: true as const, normalized };
}

export async function POST(req: NextRequest) {
  try {
    const order = (await req.json().catch(() => ({}))) as IncomingOrder;

    const check = validateOrder(order);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const doc = {
      name: order.name!,
      email: order.email!,
      phone: order.phone!,
      address: order.address!,
      street: order.street!,
      postalCode: order.postalCode!,
      items: check.normalized.items,
      totalPrice: check.normalized.totalPrice,
      rawTotal: check.normalized.rawTotal,
      discountCode: order.discountCode ?? undefined,
      discountPercent: typeof order.discountPercent === "number" ? order.discountPercent : undefined,
      status: "Pending" as const,
      paid: false,
      paypalOrderId: order.paypalOrderId || null,
      isGuest: !order.userId,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("orders").insertOne(doc);
    const insertedId = result?.insertedId ? String(result.insertedId) : null;

    if (!insertedId) {
      return NextResponse.json({ error: "Failed to insert order" }, { status: 500 });
    }

    return NextResponse.json({ success: true, insertedId }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Error saving order:", err);
    return NextResponse.json({ error: "Internal server error while saving order" }, { status: 500 });
  }
}
