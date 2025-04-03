/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // یا می‌توانید false کنید
  
    images: {
      domains: ['localhost'], // اجازه بارگذاری تصاویر از localhost
    },
  
    async rewrites() {
      return [
        {
          source: '/uploads/:path*', // مسیر آپلود در فرانت
          destination: 'http://localhost:3001/uploads/:path*', // مسیر به سرور بک‌اند
        },
      ];
    },
  
    // اضافه کردن تنظیمات بین‌المللی‌سازی
    i18n: {
      locales: ['en', 'fa', 'fr', 'de', 'es'], // زبان‌هایی که می‌خواهید پشتیبانی کنید
      defaultLocale: 'en', // زبان پیش‌فرض
    },
  };
  
  export default nextConfig;
  