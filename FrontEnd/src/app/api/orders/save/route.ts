import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { db } = await connectToDatabase(); // ← اینجا باید destructure بشه
    const orders = db.collection("orders");

    const result = await orders.insertOne(body);

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (err: any) {
    console.error("❌ Error saving order:", err.message);
    return NextResponse.json({ error: "Error saving order" }, { status: 500 });
  }
}
