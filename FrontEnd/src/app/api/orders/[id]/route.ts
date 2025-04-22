import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { ObjectId } from "mongodb";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const orderId = context.params.id;
    const body = await req.json();

    if (!orderId || !body) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const updateFields: any = {};
    if (body.status) updateFields.status = body.status;
    if (body.name) updateFields.name = body.name;
    if (body.email) updateFields.email = body.email;
    if (body.phone) updateFields.phone = body.phone;
    if (body.address) updateFields.address = body.address;
    if (body.items) updateFields.items = body.items;
    if (body.totalPrice) updateFields.totalPrice = body.totalPrice;
    if (body.createdAt) updateFields.createdAt = body.createdAt;

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order updated successfully" });
  } catch (error: any) {
    console.error("❌ Error updating order:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
