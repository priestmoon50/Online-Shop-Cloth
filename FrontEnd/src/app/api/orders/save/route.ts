// 📁 src/app/api/orders/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";

export async function POST(req: NextRequest) {
  try {
    const order = await req.json();

    // لیست فیلدهای ضروری که باید وجود داشته باشند
    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "street",
      "postalCode",
      "items",
      "totalPrice",
    ];

    // بررسی فیلدهای جاافتاده
    const missingFields = requiredFields.filter((key) => !order[key]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // آماده‌سازی اطلاعات نهایی سفارش برای ذخیره در دیتابیس
    const orderData = {
      name: order.name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      street: order.street,
      postalCode: order.postalCode,
      totalPrice: order.totalPrice,
      items: order.items,
      status: "Pending",
      paid: false,
      paypalOrderId: order.paypalOrderId || null,
      isGuest: !order.userId,
      createdAt: new Date().toISOString(),
    };

    // اتصال به دیتابیس و درج سفارش
    const { db } = await connectToDatabase();
    const result = await db.collection("orders").insertOne(orderData);

    console.log("✅ Order saved:", result.insertedId);

    return NextResponse.json(
      { success: true, insertedId: result.insertedId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error saving order:", error.message);
    return NextResponse.json(
      { error: "Internal server error while saving order" },
      { status: 500 }
    );
  }
}
