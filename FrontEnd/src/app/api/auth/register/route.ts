import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { Resend } from "resend";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password } = await req.json();

    if (!firstName || !lastName || !phone || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required: first name, last name, email, phone, password." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 422 });
    }

    if (!phone.startsWith("+") || phone.length < 7) {
      return NextResponse.json(
        { error: "Phone number must start with + and include country code." },
        { status: 422 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 422 });
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
          { error: "An account with this phone or email already exists !  Please login" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          message: "User already registered but not verified. Please check your email.",
          status: "pending-verification",
        },
        { status: 409 }
      );
    }

    const verificationToken = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      hashedPassword,
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
      from: "noreply@mopastyle.de",
      to: normalizedEmail,
      subject: "Verify your email address",
      html: `
        <p>Hello ${firstName},</p>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
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
