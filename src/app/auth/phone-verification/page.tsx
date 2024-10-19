"use client";

import PhoneVerification from './PhoneVerification';

export default function Page() {
  return (
    <div
      style={{
        marginTop: '100px',
        backgroundImage: "url('/images/red.jpg')", // مسیر تصویر در پوشه public
        backgroundSize: 'cover', // تصویر کل پس‌زمینه را می‌پوشاند
        backgroundPosition: 'center', // تصویر در مرکز قرار می‌گیرد
        backgroundRepeat: 'no-repeat', // تصویر تکرار نمی‌شود
        height: '100vh', // تنظیم ارتفاع کل صفحه
      }}
    >
      <PhoneVerification />
    </div>
  );
}
