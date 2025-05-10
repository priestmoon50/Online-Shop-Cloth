import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import crypto from "crypto";
import { sendResetEmail } from "@/utils/sendResetEmail";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const users = db.collection("users");

  const user = await users.findOne({ email: email.toLowerCase() });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const resetToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        resetToken,
        resetTokenExpiresAt: expiresAt,
      },
    }
  );

  await sendResetEmail(email, resetToken);

  return NextResponse.json({ message: "Reset link sent" });
}
