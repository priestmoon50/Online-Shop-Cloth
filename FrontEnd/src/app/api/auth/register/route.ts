import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone } = await req.json();

    if (!firstName || !lastName || !phone || !email) {
      return NextResponse.json(
        { error: "All fields are required: first name, last name, email, and phone." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 422 }
      );
    }

    if (!phone.startsWith("+") || phone.length < 7) {
      return NextResponse.json(
        { error: "Phone number format is invalid. Must start with + and include country code." },
        { status: 422 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await users.findOne({
      $or: [{ phone }, { email: normalizedEmail }],
    });

    if (existingUser) {
      if (existingUser.verified) {
        return NextResponse.json(
          { error: "An account with this phone or email already exists. Try recovering your password." },
          { status: 409 }
        );
      }

      // کاربر قبلاً ثبت‌نام کرده ولی هنوز تأیید نکرده — ایمیل مجدد نفرست
      return NextResponse.json({
        message: "User already registered but not verified. Please check your email.",
        status: "pending-verification"
      });
    }

    const verificationToken = crypto.randomUUID();

    const newUser = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      verified: false,
      verificationToken,
      createdAt: new Date().toISOString(),
    };

    const result = await users.insertOne(newUser);

    if (!result.insertedId) {
      return NextResponse.json(
        { error: "User registration failed. Please try again later." },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: normalizedEmail,
      subject: "Verify your email address",
      html: `
        <p>Hello ${firstName},</p>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verificationToken}">
          Verify Email
        </a>
      `,
    });

    return NextResponse.json({
      message: "User registered. Verification email sent.",
      status: "email-sent",
      userId: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please contact support." },
      { status: 500 }
    );
  }
}
