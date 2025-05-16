import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: 'mail.w325.your-server.de',
      port: 587,
      secure: false,
      auth: {
        user: 'support@mopastyle.de',
        pass: process.env.EMAIL_PASSWORD!,
      },
    });

    await transporter.sendMail({
      from: `"Mopastyle Contact" <support@mopastyle.de>`,
      to: 'support@mopastyle.de',
      replyTo: email, // 🔁 برای اینکه پاسخ مستقیم بره به کاربر
      subject: 'New message from website form',
      text: `New message received:\n\nFrom: ${email}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Email send error:', error.message || error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
