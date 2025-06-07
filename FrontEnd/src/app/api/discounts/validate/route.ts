import { connectToDatabase } from "@/utils/mongo";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const cartRaw = searchParams.get("cart");

  if (!code) {
    return NextResponse.json({ valid: false, error: "کد تخفیف وارد نشده است" }, { status: 400 });
  }

  let cart: any[] = [];

  try {
    cart = cartRaw ? JSON.parse(cartRaw) : [];
  } catch (e) {
    return NextResponse.json({ valid: false, error: "فرمت سبد خرید نامعتبر است" }, { status: 400 });
  }

  const hasDiscountedItem = cart.some(
    (item) =>
      typeof item.discountPrice === "number" &&
      item.discountPrice > 0 &&
      item.discountPrice < item.price
  );

  if (hasDiscountedItem) {
    return NextResponse.json({
      valid: false,
      error: "کد تخفیف فقط روی محصولات بدون تخفیف قابل استفاده است",
    });
  }

  const { db } = await connectToDatabase();
  const discount = await db.collection("discounts").findOne({ code });

  if (!discount) {
    return NextResponse.json({ valid: false, error: "کد تخفیف نامعتبر است" }, { status: 404 });
  }

  if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, error: "کد تخفیف منقضی شده است" }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    percentage: discount.percentage,
    code: discount.code,
  });
}
