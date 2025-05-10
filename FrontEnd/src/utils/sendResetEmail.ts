import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendResetEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  
  await resend.emails.send({
    from: "noreply@yourdomain.com",
    to: email,
    subject: "Reset your password",
    html: `<p>Click below to reset your password:</p><a href="${url}">${url}</a>`,
  });
}
