import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
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

    if (!user.hashedPassword) {
      return NextResponse.json(
        { error: "This account does not support password login." },
        { status: 400 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.firstName + " " + user.lastName,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
