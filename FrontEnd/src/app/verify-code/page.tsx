// 📁 src/app/verify-code/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import VerifyCodeForm from "./VerifyCodeForm";

export default function VerifyCodePage() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "";

  if (!email) return <p>Missing email address.</p>;

  return <VerifyCodeForm email={email} />;
}
 