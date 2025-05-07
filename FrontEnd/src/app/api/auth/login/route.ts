import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        { error: "This account has not been verified yet. Please check your email." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "Login successful.",
      userId: user._id.toString(),
    });
  } catch (error: any) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
