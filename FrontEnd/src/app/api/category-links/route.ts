import { connectToDatabase } from "@/utils/mongo";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET all category links
export async function GET(req: NextRequest) {
  const { db } = await connectToDatabase();
  const title = req.nextUrl.searchParams.get("title");

  if (title) {
    const existing = await db.collection("categoryLinks").findOne({ title });
    return NextResponse.json({ exists: !!existing });
  }

  const categories = await db.collection("categoryLinks").find().toArray();
  return NextResponse.json(categories);
}


// ✅ PUT to update image URL
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, imageUrl } = body;

  if (!id || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const result = await db.collection("categoryLinks").updateOne(
    { _id: new ObjectId(id) },
    { $set: { imageUrl } }
  );

  return NextResponse.json({ success: true, result });
}

// ✅ POST to create category (imageUrl optional)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, imageUrl = "" } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const { db } = await connectToDatabase();

  // Check if already exists
  const exists = await db.collection("categoryLinks").findOne({ title });
  if (exists) {
    return NextResponse.json({ message: "Already exists" }, { status: 200 });
  }

  const newCat = {
    title,
    imageUrl,
    createdAt: new Date(),
  };

  await db.collection("categoryLinks").insertOne(newCat);
  return NextResponse.json({ success: true });
}
