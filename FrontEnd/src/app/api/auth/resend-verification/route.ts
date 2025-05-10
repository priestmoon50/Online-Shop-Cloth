import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    if (user.verified) {
      return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
    }

    const newToken = crypto.randomUUID();

    await users.updateOne({ email: normalizedEmail }, {
      $set: { verificationToken: newToken }
    });

    await resend.emails.send({
      from: "noreply@mopastyle.de",
      to: normalizedEmail,
      subject: "Resend: Verify your email address",
      html: `
        <p>Hello ${user.firstName},</p>
        <p>Please verify your email again by clicking the link below:</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${newToken}">
          Verify Email
        </a>
      `,
    });

    return NextResponse.json({ message: "Verification email resent successfully." });
  } catch (error: any) {
    console.error("❌ Resend verification error:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}
