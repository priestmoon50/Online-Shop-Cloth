// 📁 FrontEnd/src/app/api/auth/send-code/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toLowerCase())) {
      return NextResponse.json(
        { error: "Email format is incorrect." },
        { status: 422 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        { error: "Your account is not verified. Please check your email." },
        { status: 403 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          loginCode: code,
          loginCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 minutes
        },
      }
    );

    await resend.emails.send({
      from: "login@resend.dev",
      to: email,
      subject: "Your Login Code",
      html: `<p>Your 6-digit login code is: <strong>${code}</strong></p>`,
    });

    return NextResponse.json({ message: "Login code sent to your email." });
  } catch (error) {
    console.error("❌ Error sending code:", error);
    return NextResponse.json(
      { error: "Failed to send verification code." },
      { status: 500 }
    );
  }
}
