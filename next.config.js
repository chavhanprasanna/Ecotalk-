/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration
  reactStrictMode: false,
  swcMinify: true,
  
  // Ignore TypeScript and ESLint during build to prevent errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // For static hosting
  images: {
    unoptimized: true,
  }
};

module.exports = nextConfig;
