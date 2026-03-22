/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@acme/ui', '@acme/theme', '@acme/shared'],
  experimental: {
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
  },
};

module.exports = nextConfig;
