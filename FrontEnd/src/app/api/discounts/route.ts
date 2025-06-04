// src/app/api/discounts/route.ts
import { connectToDatabase } from "@/utils/mongo";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const discounts = await db.collection("discounts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(discounts);
  } catch (error) {
    console.error("GET /api/discounts error:", error);
    return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { code, percentage, expiresAt } = await req.json();

    if (!code || !percentage) {
      return NextResponse.json({ error: "Code and percentage required" }, { status: 400 });
    }

    const existing = await db.collection("discounts").findOne({ code });
    if (existing) {
      return NextResponse.json({ error: "Code already exists" }, { status: 400 });
    }

    const newDiscount = {
      code,
      percentage: Number(percentage),
      active: true,
      createdAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };

    await db.collection("discounts").insertOne(newDiscount);

    return NextResponse.json(newDiscount, { status: 201 });
  } catch (error) {
    console.error("POST /api/discounts error:", error);
    return NextResponse.json({ error: "Failed to create discount" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing discount ID" }, { status: 400 });
    }

    await db.collection("discounts").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/discounts error:", error);
    return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 });
  }
}
