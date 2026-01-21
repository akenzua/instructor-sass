/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@acme/ui', '@acme/theme', '@acme/shared'],

  // Enable static exports for better caching
  // output: 'standalone',

  // Image optimization
  images: {
    domains: ['localhost', 'indrive.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.indrive.com',
      },
    ],
  },

  // Headers for SEO and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
