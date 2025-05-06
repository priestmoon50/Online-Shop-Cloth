/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  i18n: {
    locales: ['en', 'fa', 'fr', 'de', 'es'],
    defaultLocale: 'en',
    localeDetection: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    appDir: false,
  },

  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
