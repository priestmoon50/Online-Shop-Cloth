import { connectToDatabase } from "@/utils/mongo";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { db } = await connectToDatabase();
  const slides = await db.collection("homeSlides").find().sort({ createdAt: -1 }).toArray();
  return NextResponse.json(slides);
}

export async function POST(req: NextRequest) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  await db.collection("homeSlides").insertOne({ imageUrl, createdAt: new Date() });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { db } = await connectToDatabase();
  await db.collection("homeSlides").deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ success: true });
}
