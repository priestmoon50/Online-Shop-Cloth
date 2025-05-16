import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({
      resetToken: token,
      resetTokenExpiresAt: { $gt: new Date() }, // Check token is not expired
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.updateOne(
      { _id: user._id },
      {
        $set: { hashedPassword }, // Update with new hashed password
        $unset: { resetToken: "", resetTokenExpiresAt: "" }, // Remove reset token
      }
    );

    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("❌ Password reset error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
