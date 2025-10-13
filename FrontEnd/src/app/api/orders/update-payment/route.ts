// 📁 src/app/api/orders/update-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

type Body = {
  orderId?: string;
  paypalCaptureId?: string;
  paypalOrderId?: string; // optional, if you want to persist it
};

export async function PUT(req: NextRequest) {
  try {
    const { orderId, paypalCaptureId, paypalOrderId }: Body = await req.json();

    // === Validate input
    if (!orderId || !paypalCaptureId) {
      return NextResponse.json(
        { error: "orderId and paypalCaptureId are required" },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid orderId format" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const orders = db.collection("orders");
    const _id = new ObjectId(orderId);

    // === Idempotent short-circuit
    const existing = await orders.findOne(
      { _id },
      { projection: { paid: 1, status: 1, email: 1, name: 1, totalPrice: 1 } }
    );
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (existing.paid === true) {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    // === Atomic update only if not yet paid
    const setFields: Record<string, any> = {
      status: "Processing",
      paid: true,
      paypalCaptureId,
      updatedAt: new Date().toISOString(),
    };
    if (paypalOrderId) setFields.paypalOrderId = paypalOrderId;

    const upd = await orders.findOneAndUpdate(
      { _id, paid: { $ne: true } },
      { $set: setFields },
      { returnDocument: "after" }
    );

    // Guard against null/undefined
    if (!upd || !upd.value) {
      // Either not found or a race condition set paid=true just now
      const now = await orders.findOne({ _id }, { projection: { paid: 1 } });
      if (now?.paid) {
        return NextResponse.json({ success: true, alreadyPaid: true });
      }
      return NextResponse.json(
        { error: "Order not found or not updated" },
        { status: 404 }
      );
    }

    const updatedDoc = upd.value as {
      name?: string;
      email?: string;
      totalPrice?: number;
      status?: string;
      paid?: boolean;
    };

    // === Fire-and-forget email (non-blocking)
    const BASE_URL = process.env.BASE_URL; // e.g., https://your-domain.com
    if (BASE_URL) {
      fetch(`${BASE_URL}/api/orders/notify-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: orderId,
          name: updatedDoc.name,
          email: updatedDoc.email,
          totalPrice: updatedDoc.totalPrice,
          status: updatedDoc.status,
          paid: updatedDoc.paid,
          paypalCaptureId,
        }),
        cache: "no-store" as any,
      }).catch((e) => {
        console.error("⚠️ notify-user failed (non-blocking):", e?.message || e);
      });
    } else {
      console.warn("⚠️ BASE_URL is not set; skip notify-user");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error updating payment status:", err?.message || err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
