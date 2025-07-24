import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, message, fromSupport } = await req.json();

  if (!email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    if (fromSupport) {
      // 🟢 ارسال با SMTP Hetzner
      const transporter = nodemailer.createTransport({
        host: "mail.w325.mopastyle.de", // یا mail.mopastyle.de اگر A رکوردش تنظیمه
        port: 587,
        secure: false,
        auth: {
          user: "support@mopastyle.de",
          pass: process.env.HETZNER_PASSWORD!,
        },
        tls: {
          rejectUnauthorized: false, // جلوگیری از مشکلات سرتیفیکیت معمول در Hetzner
        },
      });

      await transporter.sendMail({
        from: '"Website Contact" <support@mopastyle.de>',
        to: "support@mopastyle.de",
        subject: "New Message from Website Support Form",
        text: `From: ${email}\n\n${message}`,
      });
    } else {
      // 🟡 سایر ایمیل‌ها: Amazon SES از طریق Resend
      await resend.emails.send({
        from: "noreply@mopastyle.de",
        to: "admin@mopastyle.de", // یا هر ایمیلی که لازم داری
        subject: "New Message from Website",
        html: `<p><strong>From:</strong> ${email}</p><p>${message}</p>`,
      });
    }
 
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Email send error:", error);
    return NextResponse.json({ success: true });

  }
}
