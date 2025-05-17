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
      from: "noreply@mopastyle.de",
      to,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://yourdomain.com/logo.png" alt="MopaStyle" height="40" />
            </div>

            <!-- Title -->
            <h2 style="color: #333;">Hi ${firstName},</h2>
            <p style="color: #555;">Thanks for joining <strong>MopaStyle</strong>! To activate your account, please verify your email address by clicking the button below:</p>

            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #007bff; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>

            <p style="color: #999; font-size: 12px;">If you didn’t request this, you can safely ignore this email.</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />

            <p style="font-size: 12px; color: #aaa; text-align: center;">
              © ${new Date().getFullYear()} MopaStyle. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send verification email");
  }
}
