/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@acme/ui', '@acme/theme', '@acme/shared'],
};

module.exports = nextConfig;
