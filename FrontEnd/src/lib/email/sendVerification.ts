// 📁 src/lib/email/sendVerification.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail({
  to,
  firstName,
  verificationToken,
}: {
  to: string;
  firstName: string;
  verificationToken: string;
}) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // یا ایمیل تأیید شده دامنه شما
      to,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: sans-serif; line-height: 1.5;">
          <h2>Hello ${firstName},</h2>
          <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
          <p><a href="${verificationUrl}" style="color: #007bff;">Verify Email</a></p>
          <p>If you did not request this, please ignore this message.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send verification email");
  }
}
