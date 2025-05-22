// 📁 src/app/api/orders/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";

export async function POST(req: NextRequest) {
  try {
    const order = await req.json();

    // بررسی فیلدهای الزامی
    const requiredFields = ["name", "email", "phone", "address", "items"];
    const missingFields = requiredFields.filter((key) => !order[key]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // تنظیم وضعیت اولیه سفارش و زمان ایجاد
    const orderData = {
      ...order,
      status: "Pending", // وضعیت اولیه
      createdAt: new Date().toISOString(),
      paid: false, // هنوز پرداخت نشده
      paypalOrderId: order.paypalOrderId || null,
      isGuest: !order.userId,
    };

    const { db } = await connectToDatabase();
    const result = await db.collection("orders").insertOne(orderData);

    console.log("✅ Order inserted:", result.insertedId);
    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (err: any) {
    console.error("❌ Error saving order:", err.message);
    return NextResponse.json(
      { error: "Error saving order" },
      { status: 500 }
    );
  }
}
