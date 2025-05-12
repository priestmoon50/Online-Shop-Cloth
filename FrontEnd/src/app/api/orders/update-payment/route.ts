// 📁 src/app/api/orders/update-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { ObjectId } from "mongodb";

export async function PUT(req: NextRequest) {
  try {
    const { orderId, paypalCaptureId } = await req.json();

    if (!orderId || !paypalCaptureId) {
      return NextResponse.json(
        { error: "orderId and paypalCaptureId are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const orders = db.collection("orders");

    // ▶ به‌روزرسانی پرداخت
    const updateRes = await orders.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "Processing",
          paid: true,
          paypalCaptureId,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (updateRes.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Order not found or not updated" },
        { status: 404 }
      );
    }

    // ▶ گرفتن اطلاعات سفارش برای ارسال ایمیل
    const updatedOrder = await orders.findOne({ _id: new ObjectId(orderId) });

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found after update" }, { status: 404 });
    }

    // ▶ ارسال ایمیل تأیید سفارش
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/notify-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedOrder),
    });

    console.log("✅ Order payment updated & email triggered:", orderId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error updating payment status:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
