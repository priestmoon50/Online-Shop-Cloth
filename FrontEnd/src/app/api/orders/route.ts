import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const orders = await db.collection("orders").find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("❌ Error fetching orders:", error.message);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await req.json();

    const { name, email, phone, address, items, totalPrice } = body;

    if (!name || !email || !phone || !address || !items?.length || !totalPrice) {
      console.error("❌ Missing order data");
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const order = {
      name,
      email,
      phone,
      address,
      items,
      totalPrice,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("orders").insertOne(order);

    return NextResponse.json({ success: true, orderId: result.insertedId });
  } catch (error: any) {
    console.error("❌ Error saving order:", error.message);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
