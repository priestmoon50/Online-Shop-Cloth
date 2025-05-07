// 📁 src/app/api/auth/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Verification token is missing or invalid." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({ verificationToken: token });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token." },
        { status: 404 }
      );
    }

    if (user.verified) {
      return NextResponse.json(
        { message: "Your account is already verified." },
        { status: 200 }
      );
    }

    const updateResult = await users.updateOne(
      { _id: user._id },
      {
        $set: { verified: true },
        $unset: { verificationToken: "" },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to verify your account. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Email successfully verified." }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Verification error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
