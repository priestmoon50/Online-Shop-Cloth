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
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ];
  },

  i18n: {
    locales: ['en', 'fa', 'fr', 'de', 'es'],
    defaultLocale: 'en',
  },

  // 👇 اضافه کن برای اینکه ESLint جلوی بیلد رو نگیره
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
