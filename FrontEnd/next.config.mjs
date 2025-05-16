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

  images: {
    domains: ['res.cloudinary.com'],
  },

  async redirects() {
    return [
      {
        source: '/(.*)', // هر مسیر دلخواه
        has: [
          {
            type: 'host',
            value: 'mopastyle.de',
          },
        ],
        permanent: true,
        destination: 'https://mopastyle.de/:path*',
      },
    ];
  },
};

export default nextConfig;
