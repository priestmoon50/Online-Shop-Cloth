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
      return NextResponse.json({ error: "Order not found or not updated" }, { status: 404 });
    }

    console.log("✅ Order payment updated:", orderId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error updating payment status:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
