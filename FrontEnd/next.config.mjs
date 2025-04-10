/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['localhost'],
  },

  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3002/uploads/:path*',
      },
    ];
  },

  i18n: {
    locales: ['en', 'fa', 'fr', 'de', 'es'],
    defaultLocale: 'en',
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    appDir: false, // ❗ فقط از pages استفاده می‌کنی؟ اینو اضافه کن
  },
};

export default nextConfig;
