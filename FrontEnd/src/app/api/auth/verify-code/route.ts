// 📁 src/app/api/auth/verify-code/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({ email: email.toLowerCase() });

    if (!user || !user.verificationCode || user.verificationCodeExpires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: "Incorrect verification code." }, { status: 401 });
    }

    // پاک کردن کد بعد از استفاده
    await users.updateOne(
      { email: email.toLowerCase() },
      { $unset: { verificationCode: "", verificationCodeExpires: "" } }
    );

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({ message: "Verified", token });
  } catch (error: any) {
    console.error("❌ Code verification failed:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
