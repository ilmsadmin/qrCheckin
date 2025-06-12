/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/graphql',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
      },
    ];
  },
};

module.exports = nextConfig;