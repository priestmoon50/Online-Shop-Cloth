/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  i18n: {
    locales: ['en', 'fa', 'fr', 'de', 'es'],
    defaultLocale: 'en',
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
