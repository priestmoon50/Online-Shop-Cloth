// 📁 src/app/api/orders/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";

export const runtime = "nodejs"; // برای اطمینان از دسترسی به درایور Mongo در Edge اجرا نشه

type IncomingOrder = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  street?: string;
  postalCode?: string;
  items?: Array<any>;
  totalPrice?: number | string;
  discountCode?: string;
  discountPercent?: number;
  rawTotal?: number;
  paypalOrderId?: string | null;
  userId?: string | null;
  createdAt?: string;
  status?: string;
};

function validateOrder(o: IncomingOrder) {
  const missing: string[] = [];

  // وجود کلیدها
  const keys = [
    "name",
    "email",
    "phone",
    "address",
    "street",
    "postalCode",
    "items",
    "totalPrice",
  ] as const;

  for (const k of keys) {
    if (!(k in o)) missing.push(k);
  }
  if (missing.length) {
    return { ok: false, error: `Missing fields: ${missing.join(", ")}` };
  }

  // اعتبارسنجی مقادیر
  if (!o.name || typeof o.name !== "string") return { ok: false, error: "Invalid name" };
  if (!o.email || typeof o.email !== "string") return { ok: false, error: "Invalid email" };
  if (!o.phone || typeof o.phone !== "string") return { ok: false, error: "Invalid phone" };
  if (!o.address || typeof o.address !== "string") return { ok: false, error: "Invalid address" };
  if (!o.street || typeof o.street !== "string") return { ok: false, error: "Invalid street" };
  if (!o.postalCode || typeof o.postalCode !== "string")
    return { ok: false, error: "Invalid postalCode" };

  if (!Array.isArray(o.items) || o.items.length === 0)
    return { ok: false, error: "Items must be a non-empty array" };

  const priceNum =
    typeof o.totalPrice === "string" ? parseFloat(o.totalPrice) : Number(o.totalPrice);
  if (!Number.isFinite(priceNum) || priceNum < 0)
    return { ok: false, error: "Invalid totalPrice" };

  return { ok: true, normalizedTotalPrice: Number(priceNum.toFixed(2)) };
}

export async function POST(req: NextRequest) {
  try {
    const order = (await req.json().catch(() => ({}))) as IncomingOrder;

    // ✅ ولیدیشن دقیق
    const check = validateOrder(order);
    if (!("ok" in check) || check.ok === false) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    // داده‌ای که ذخیره می‌کنیم
    const orderData = {
      name: order.name!,
      email: order.email!,
      phone: order.phone!,
      address: order.address!,
      street: order.street!,
      postalCode: order.postalCode!,
      items: order.items!,
      totalPrice: check.normalizedTotalPrice, // عدد با دو رقم اعشار نرمال‌شده
      rawTotal:
        typeof order.rawTotal === "number" && Number.isFinite(order.rawTotal)
          ? Number(order.rawTotal.toFixed(2))
          : undefined,
      discountCode: order.discountCode ?? undefined,
      discountPercent:
        typeof order.discountPercent === "number" ? order.discountPercent : undefined,
      status: "Pending" as const,
      paid: false,
      paypalOrderId: order.paypalOrderId || null,
      isGuest: !order.userId,
      createdAt: new Date().toISOString(),
    };

    // اتصال و درج
    const { db } = await connectToDatabase();
    const result = await db.collection("orders").insertOne(orderData);

    // ObjectId رو به رشته تبدیل کنیم تا JSON تمیز برگرده
    const insertedId = result?.insertedId ? String(result.insertedId) : null;

    if (!insertedId) {
      return NextResponse.json(
        { error: "Failed to insert order" },
        { status: 500 }
      );
    }

    // موفق
    return NextResponse.json(
      { success: true, insertedId },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error saving order:", err);
    return NextResponse.json(
      { error: "Internal server error while saving order" },
      { status: 500 }
    );
  }
}
