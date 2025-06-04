// 📁 FrontEnd/src/app/api/orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const orders = await db
      .collection("orders")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("❌ Error fetching orders:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await req.json();

    const {
      name,
      email,
      phone,
      address,
      street,
      postalCode,
      items,
      totalPrice,
    } = body;

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !street ||
      !postalCode ||
      !items?.length ||
      !totalPrice
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // بررسی موجودی هر سایز
    for (const item of items) {
      const product = await db.collection("products").findOne({ id: item.id });

      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.id} not found` },
          { status: 404 }
        );
      }

      for (const variant of item.variants) {
        const sizeEntry = product.sizes?.find(
          (s: any) => s.size === variant.size
        );

        if (!sizeEntry || sizeEntry.stock < variant.quantity) {
          return NextResponse.json(
            {
              error: `Not enough stock for ${product.name} (size: ${variant.size})`,
            },
            { status: 400 }
          );
        }
      }
    }

    // کاهش موجودی هر سایز
    for (const item of items) {
      for (const variant of item.variants) {
        await db.collection("products").updateOne(
          { id: item.id, "sizes.size": variant.size },
          { $inc: { "sizes.$.stock": -variant.quantity } }
        );
      }
    }

    const order = {
      name,
      email,
      phone,
      address,
      street,
      postalCode,
      items,
      totalPrice,
      status: "Pending",
      paid: false,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("orders").insertOne(order);

    return NextResponse.json({ success: true, orderId: result.insertedId });
  } catch (error: any) {
    console.error("❌ Error saving order:", error.message);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
