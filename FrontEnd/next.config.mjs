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
};

export default nextConfig;
