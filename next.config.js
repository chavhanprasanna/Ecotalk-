/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export
  output: 'export',
  
  // Disable React StrictMode for compatibility with some libraries
  reactStrictMode: false,
  
  // Enable static HTML export
  trailingSlash: true,
  
  // Disable image optimization during export
  images: {
    unoptimized: true,
  },
  
  // Ignore TypeScript and ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable server components
  experimental: {
    // No experimental features needed for now
  }
};

// Only include headers in development
if (process.env.NODE_ENV !== 'production') {
  nextConfig.headers = async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  };
}

module.exports = nextConfig;
