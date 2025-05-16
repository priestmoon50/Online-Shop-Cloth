import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { email, message } = await req.json();

  if (!email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // SMTP تنظیمات مخصوص Hetzner
  const transporter = nodemailer.createTransport({
    host: "mail.your-server.de", // این آدرس کلی صحیح‌تر از mail.w325...
    port: 587,
    secure: false, // چون از TLS استفاده نمی‌کنی (STARTTLS روی port 587)
    auth: {
      user: "support@mopastyle.de",
      pass: process.env.EMAIL_PASSWORD!,
    },
    tls: {
      rejectUnauthorized: false, // برخی اوقات برای Hetzner لازم میشه
    },
  });

  try {
    await transporter.sendMail({
      from: '"Website Contact" <support@mopastyle.de>', // نقل‌قول‌های استاندارد
      to: "support@mopastyle.de",
      subject: "New Message from Website",
      text: `From: ${email}\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
