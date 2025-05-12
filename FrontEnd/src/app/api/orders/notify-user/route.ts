// 📁 FrontEnd/src/app/api/orders/notify-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import OrderConfirmationEmail from "@/lib/email/OrderConfirmationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const order = await req.json();

    if (
      !order?.email ||
      !order?.items ||
      !order?.totalPrice ||
      !order?.name ||
      !order?._id
    ) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    const { name, email, items, totalPrice, _id } = order;

    const { error } = await resend.emails.send({
      from: "MopaStyle <no-reply@mopastyle.de>",
      to: email,
      subject: "تأیید سفارش شما | MopaStyle",
      react: OrderConfirmationEmail({
        name,
        orderId: _id,
        totalPrice,
        items,
      }),
    });

    if (error) {
      console.error("❌ Email send error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Failed to send order email:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
